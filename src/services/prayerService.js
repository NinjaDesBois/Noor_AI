import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan'

// TIER 1: Mawaqit — mosque-based, most accurate
async function fromMawaqit(lat, lng) {
  const searchRes = await fetch(
    `https://mawaqit.net/api/2.0/mosque/search?lat=${lat}&lon=${lng}&_format=json`,
    { headers: { Accept: 'application/json' } }
  )
  if (!searchRes.ok) throw new Error('Mawaqit search failed')
  const mosques = await searchRes.json()
  if (!mosques?.length) throw new Error('No mosque found')

  const slug = mosques[0].slug
  const timesRes = await fetch(
    `https://mawaqit.net/api/2.0/mosque/${slug}?_format=json`,
    { headers: { Accept: 'application/json' } }
  )
  if (!timesRes.ok) throw new Error('Mawaqit times failed')
  const data = await timesRes.json()

  const dayIndex = getDayOfYear(new Date()) - 1
  const times = data.calendar?.[dayIndex] ?? data.times
  if (!times || times.length < 6) throw new Error('Invalid Mawaqit times')

  return {
    source:     'mawaqit',
    mosqueName: mosques[0].name,
    city:       mosques[0].city || mosques[0].address,
    fajr:    times[0],
    shuruk:  times[1],
    dhuhr:   times[2],
    asr:     times[3],
    maghrib: times[4],
    isha:    times[5],
  }
}

// TIER 2: Aladhan API
async function fromAladhan(lat, lng) {
  const d = new Date()
  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}` +
    `?latitude=${lat}&longitude=${lng}&method=3`
  )
  if (!res.ok) throw new Error('Aladhan failed')
  const { data } = await res.json()
  const t = data.timings
  return {
    source:  'aladhan',
    city:    '',
    fajr:    t.Fajr,
    shuruk:  t.Sunrise,
    dhuhr:   t.Dhuhr,
    asr:     t.Asr,
    maghrib: t.Maghrib,
    isha:    t.Isha,
  }
}

// TIER 3: Local Adhan.js (offline capable)
function fromAdhan(lat, lng) {
  const coords = new Coordinates(lat, lng)
  const params = CalculationMethod.MuslimWorldLeague()
  params.madhab = Madhab.Hanafi
  const pt  = new PrayerTimes(coords, new Date(), params)
  const fmt = d => d.toLocaleTimeString('fr-BE', {
    hour: '2-digit', minute: '2-digit', hour12: false
  })
  return {
    source:   'adhan-mwl',
    city:     '',
    fajr:     fmt(pt.fajr),
    shuruk:   fmt(pt.sunrise),
    dhuhr:    fmt(pt.dhuhr),
    asr:      fmt(pt.asr),
    maghrib:  fmt(pt.maghrib),
    isha:     fmt(pt.isha),
    rawTimes: pt,
  }
}

export async function getPrayerTimes(lat, lng) {
  try { return await fromMawaqit(lat, lng) } catch (e) {
    console.warn('Mawaqit failed:', e.message)
  }
  try { return await fromAladhan(lat, lng) } catch (e) {
    console.warn('Aladhan failed:', e.message)
  }
  return fromAdhan(lat, lng)
}

export function getNextPrayer(times) {
  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  const arabicNames = {
    fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
  }

  for (const name of prayers) {
    const [h, m]      = times[name].split(':').map(Number)
    const prayerMins  = h * 60 + m
    if (prayerMins > nowMins) {
      const diff = prayerMins - nowMins
      return {
        name, arabic: arabicNames[name],
        time: times[name],
        minutesUntil: diff,
        hoursUntil:   Math.floor(diff / 60),
        minsUntil:    diff % 60,
      }
    }
  }

  // Past Isha — next is Fajr tomorrow
  const [h, m] = times.fajr.split(':').map(Number)
  const diff   = (h * 60 + m + 1440) - nowMins
  return {
    name: 'fajr', arabic: 'الفجر',
    time: times.fajr,
    minutesUntil: diff,
    hoursUntil:   Math.floor(diff / 60),
    minsUntil:    diff % 60,
  }
}

export function getQiblaAngle(lat, lng) {
  const MECCA_LAT = 21.3891 * Math.PI / 180
  const MECCA_LNG = 39.8579 * Math.PI / 180
  const userLat   = lat * Math.PI / 180
  const dLng      = MECCA_LNG - (lng * Math.PI / 180)
  const y = Math.sin(dLng) * Math.cos(MECCA_LAT)
  const x = Math.cos(userLat) * Math.sin(MECCA_LAT) -
            Math.sin(userLat) * Math.cos(MECCA_LAT) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export function getDistanceToMecca(lat, lng) {
  const R          = 6371
  const MECCA_LAT  = 21.3891
  const MECCA_LNG  = 39.8579
  const dLat = (MECCA_LAT - lat) * Math.PI / 180
  const dLng = (MECCA_LNG - lng) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat * Math.PI / 180) * Math.cos(MECCA_LAT * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date - start) / 86400000)
}
