const BASE = 'https://api.quran.com/api/v4'

// Translation IDs on quran.com
const TRANSLATIONS = {
  fr: 31,   // Muhammad Hamidullah — most rigorous French translation
  en: 131,  // Dr. Mustafa Khattab (The Clear Quran) — modern, accurate English
}

export async function getAllSurahs(lang = 'fr') {
  const res = await fetch(`${BASE}/chapters?language=${lang}`)
  if (!res.ok) throw new Error('Failed to fetch surahs')
  const { chapters } = await res.json()
  return chapters.map(c => ({
    number:      c.id,
    nameArabic:  c.name_arabic,
    nameSimple:  c.name_simple,
    nameFr:      c.translated_name?.name || c.name_simple,
    versesCount: c.verses_count,
    revelation:  c.revelation_place,  // 'makkah' or 'madinah'
    order:       c.revelation_order,
  }))
}

export async function getSurahVerses(surahNumber, lang = 'fr') {
  const translationId = TRANSLATIONS[lang] || TRANSLATIONS.fr
  const perPage = 300

  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE}/quran/verses/uthmani?chapter_number=${surahNumber}`),
    fetch(`${BASE}/verses/by_chapter/${surahNumber}?translations=${translationId}&fields=text_uthmani,verse_key&per_page=${perPage}`)
  ])

  if (!arabicRes.ok || !translationRes.ok) {
    throw new Error('Quran API error — check connection')
  }

  const { verses: arabicVerses }  = await arabicRes.json()
  const { verses: transVerses }   = await translationRes.json()

  return transVerses.map((v, i) => ({
    number:      v.verse_number,
    key:         v.verse_key,
    arabic:      arabicVerses[i]?.text_uthmani || '',
    translation: v.translations?.[0]?.text?.replace(/<[^>]*>/g, '') || '',
    audioUrl:    getAudioUrl(getGlobalVerseNumber(surahNumber, v.verse_number)),
  }))
}

export async function getSingleVerse(verseKey, lang = 'fr') {
  const translationId = TRANSLATIONS[lang] || TRANSLATIONS.fr
  const [arabicRes, transRes] = await Promise.all([
    fetch(`${BASE}/verses/by_key/${verseKey}?fields=text_uthmani`),
    fetch(`${BASE}/verses/by_key/${verseKey}?translations=${translationId}&fields=text_uthmani`)
  ])
  if (!arabicRes.ok || !transRes.ok) throw new Error('Verse fetch failed')
  const arabic = await arabicRes.json()
  const trans  = await transRes.json()
  return {
    key:         verseKey,
    arabic:      arabic.verse?.text_uthmani || '',
    translation: trans.verse?.translations?.[0]?.text?.replace(/<[^>]*>/g, '') || '',
  }
}

// Audio URL — Islamic Network CDN, Mishary Al-Afasy default
function getAudioUrl(globalVerseNumber, reciter = 'ar.alafasy') {
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalVerseNumber}.mp3`
}

// Verse counts for all 114 surahs (standard Hafs 'an 'Asim, total = 6236)
const VERSE_COUNTS = [
    7,286,200,176,120,165,206, 75,129,109,
  123,111, 43, 52, 99,128,111,110, 98,135,
  112, 78,118, 64, 77,227, 93, 88, 69, 60,
   34, 30, 73, 54, 45, 83,182, 88, 75, 85,
   54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
   60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
   14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
   28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
   29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
   15, 21, 11,  8,  8, 19,  5,  8,  8, 11,
   11,  8,  3,  9,  5,  4,  7,  3,  6,  3,
    5,  4,  5,  6,
]

// SURAH_OFFSETS[n] = total verses before surah n+1 (cumulative sum of preceding surahs)
const SURAH_OFFSETS = VERSE_COUNTS.reduce(
  (acc, n) => (acc.push(acc[acc.length - 1] + n), acc),
  [0]
)

function getGlobalVerseNumber(surah, verse) {
  return SURAH_OFFSETS[surah - 1] + verse
}
