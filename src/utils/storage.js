// ─── Central localStorage schema ─────────────────────────────────────────────
// Single source of truth for every key used in the app.
// All reads/writes must go through these helpers — never use raw strings.

export const STORAGE = {
  lang:         'noor_lang',         // 'fr' | 'en'
  location:     'noor_location',     // JSON: { lat, lng, city, country, source, timestamp }
  prayerSource: 'noor_prayer_src',   // 'mawaqit' | 'aladhan' | 'adhan'
  reciter:      'noor_reciter',      // 'ar.alafasy' | 'ar.abdulsamad' | 'ar.husary'
  translation:  'noor_translation',  // 'fr' | 'en'  (currently auto-follows lang)
  notifEnabled: 'noor_notif',        // 'true' | 'false'
  notifTime:    'noor_notif_time',   // 'HH:MM'
  bookmark:     'noor_bookmark',     // JSON: { surah, verse }
  streakLast:   'noor_streak_last',  // ISO date 'YYYY-MM-DD'
  streakCount:  'noor_streak_count', // integer string
  hijriOffset:  'noor_hijri_offset', // '-1' | '0' | '1'
  // Dynamic keys (not listed here):
  //   noor_hifz_{surah}_{verse} = 'true'
}

// ─── Language ─────────────────────────────────────────────────────────────────
export const getLang     = ()  => localStorage.getItem(STORAGE.lang) || 'fr'
export const setLang     = (v) => localStorage.setItem(STORAGE.lang, v)

// ─── Reciter ──────────────────────────────────────────────────────────────────
export const getReciter  = ()  => localStorage.getItem(STORAGE.reciter) || 'ar.alafasy'
export const setReciter  = (v) => localStorage.setItem(STORAGE.reciter, v)

// ─── Translation ──────────────────────────────────────────────────────────────
export const getTranslation = () => localStorage.getItem(STORAGE.translation) || getLang()
export const setTranslation = (v) => localStorage.setItem(STORAGE.translation, v)

// ─── Hijri offset ─────────────────────────────────────────────────────────────
export const getHijriOffset = ()  => parseInt(localStorage.getItem(STORAGE.hijriOffset) || '0', 10)
export const setHijriOffset = (v) => localStorage.setItem(STORAGE.hijriOffset, String(Math.max(-1, Math.min(1, v))))

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifEnabled = ()  => localStorage.getItem(STORAGE.notifEnabled) === 'true'
export const setNotifEnabled = (v) => localStorage.setItem(STORAGE.notifEnabled, String(v))
export const getNotifTime    = ()  => localStorage.getItem(STORAGE.notifTime) || '07:00'
export const setNotifTime    = (v) => localStorage.setItem(STORAGE.notifTime, v)

// ─── Bookmark ─────────────────────────────────────────────────────────────────
export function getBookmark() {
  try { return JSON.parse(localStorage.getItem(STORAGE.bookmark) || 'null') }
  catch { return null }
}
export const setBookmark = (surah, verse) =>
  localStorage.setItem(STORAGE.bookmark, JSON.stringify({ surah, verse }))
export const clearBookmark = () => localStorage.removeItem(STORAGE.bookmark)

// ─── Location ─────────────────────────────────────────────────────────────────
export function getLocation() {
  try {
    const raw = localStorage.getItem(STORAGE.location)
    if (!raw) return null
    const loc = JSON.parse(raw)
    if (Date.now() - loc.timestamp > 86400000) return null  // 24-hour cache
    return loc
  } catch { return null }
}
export const clearLocation = () => localStorage.removeItem(STORAGE.location)

// ─── Prayer source ────────────────────────────────────────────────────────────
export const getPrayerSource = ()  => localStorage.getItem(STORAGE.prayerSource) || null
export const setPrayerSource = (v) => localStorage.setItem(STORAGE.prayerSource, v)

// ─── Streak ───────────────────────────────────────────────────────────────────
export const getStreakCount = () => parseInt(localStorage.getItem(STORAGE.streakCount) || '0', 10)
export const getStreakLast  = () => localStorage.getItem(STORAGE.streakLast) || null

export function updateStreak() {
  const today     = new Date().toISOString().slice(0, 10)
  const lastDate  = getStreakLast()
  if (lastDate === today) return getStreakCount()   // already recorded today

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const newCount  = lastDate === yesterday ? getStreakCount() + 1 : 1
  localStorage.setItem(STORAGE.streakLast,  today)
  localStorage.setItem(STORAGE.streakCount, String(newCount))
  return newCount
}

// ─── Hifz (memorization) ─────────────────────────────────────────────────────
export const hifzKey = (surah, verse) => `noor_hifz_${surah}_${verse}`

export const isVerseMemorized = (surah, verse) =>
  localStorage.getItem(hifzKey(surah, verse)) === 'true'

export function setVerseMemorized(surah, verse, value) {
  if (value) localStorage.setItem(hifzKey(surah, verse), 'true')
  else       localStorage.removeItem(hifzKey(surah, verse))
}

export function getSurahHifzProgress(surah, versesCount) {
  let count = 0
  for (let v = 1; v <= versesCount; v++) {
    if (isVerseMemorized(surah, v)) count++
  }
  return versesCount > 0 ? { count, total: versesCount, pct: Math.round((count / versesCount) * 100) } : { count: 0, total: versesCount, pct: 0 }
}

export function getTotalMemorizedVerses() {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.startsWith('noor_hifz_')) total++
  }
  return total
}

// ─── Data management ─────────────────────────────────────────────────────────
export function clearAllHifz() {
  const toRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('noor_hifz_')) toRemove.push(key)
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}

export function clearAllAppData() {
  const toRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('noor_')) toRemove.push(key)
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}
