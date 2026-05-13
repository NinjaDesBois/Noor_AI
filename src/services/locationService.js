export async function getUserLocation() {
  // 1. Check localStorage cache (valid 24h)
  const cached = localStorage.getItem('noor_location')
  if (cached) {
    const loc = JSON.parse(cached)
    if (Date.now() - loc.timestamp < 86400000) return loc
  }

  // 2. GPS — ask browser
  if (navigator.geolocation) {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {
          timeout: 8000, enableHighAccuracy: true
        })
      )
      const loc = await enrichWithCityName(
        pos.coords.latitude, pos.coords.longitude, 'gps'
      )
      saveLocation(loc)
      return loc
    } catch {}
  }

  // 3. IP geolocation fallback
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (data.latitude && data.longitude) {
      const loc = {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city,
        country: data.country_name,
        source: 'ip'
      }
      saveLocation(loc)
      return loc
    }
  } catch {}

  // 4. Return null → UI shows manual city input
  return null
}

async function enrichWithCityName(lat, lng, source) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'fr,en' } }
    )
    const data = await res.json()
    return {
      lat, lng, source,
      city: data.address?.city || data.address?.town ||
            data.address?.village || data.address?.county || 'Unknown',
      country: data.address?.country || ''
    }
  } catch {
    return { lat, lng, source, city: 'Unknown', country: '' }
  }
}

export async function getCoordsFromCity(cityName) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
  )
  const data = await res.json()
  if (!data.length) throw new Error('City not found')
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    city: cityName,
    source: 'manual'
  }
}

function saveLocation(loc) {
  localStorage.setItem('noor_location', JSON.stringify({
    ...loc, timestamp: Date.now()
  }))
}
