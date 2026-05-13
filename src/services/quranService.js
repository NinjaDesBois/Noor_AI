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

// Pre-computed surah starting verse numbers (1-indexed)
function getGlobalVerseNumber(surah, verse) {
  const STARTS = [
    0,1,7,293,493,670,789,954,1160,1235,1364,1473,1596,1707,1750,1802,
    1901,2029,2140,2250,2348,2483,2595,2673,2791,2855,2932,3159,3252,3340,3409,3469,
    3503,3533,3606,3660,3705,3788,3970,4058,4133,4218,4272,4325,4414,4473,4510,4545,
    4583,4612,4630,4675,4735,4784,4846,4901,4979,5075,5104,5126,5150,5163,5177,5188,
    5199,5217,5229,5241,5271,5323,5375,5419,5447,5475,5495,5551,5600,5672,5712,5758,
    5800,5829,5848,5884,5909,5931,5948,5967,5993,6023,6043,6058,6079,6090,6098,6106,
    6125,6130,6138,6146,6157,6168,6176,6179,6188,6193,6197,6204,6207,6213,6216,6221,
    6225,6230,6236
  ]
  return (STARTS[surah - 1] || 0) + verse
}
