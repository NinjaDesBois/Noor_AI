export async function getHijriDate(date = new Date()) {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/gToH?date=${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
    )
    const { data } = await res.json()
    const h = data.hijri
    return {
      day:     parseInt(h.day),
      month:   parseInt(h.month.number),
      monthAr: h.month.ar,
      monthEn: h.month.en,
      year:    parseInt(h.year),
      display: `${h.day} ${h.month.ar} ${h.year}`,
    }
  } catch {
    return fallbackHijri(date)
  }
}

function fallbackHijri(date) {
  // Approximate calculation — only used if API fails
  const JD = Math.floor((date - new Date('622-07-16')) / 86400000) + 1
  const year  = Math.floor((30 * JD + 10646) / 10631)
  const month = Math.min(12, Math.ceil((JD - Math.floor(29.5001 * (year - 1))) / 29.5))
  const day   = JD - Math.floor(29.5001 * (month - 1)) - Math.floor(29.5001 * (year - 1) * 12)
  const monthNames = [
    'Muharram', 'Safar', "Rabi' I", "Rabi' II", "Jumada I", "Jumada II",
    'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhul Qa'da", 'Dhul Hijja'
  ]
  return {
    day, month,
    monthAr: monthNames[month - 1],
    monthEn: monthNames[month - 1],
    year,
    display: `${day} ${monthNames[month - 1]} ${year}`
  }
}
