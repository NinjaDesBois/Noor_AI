const BASE = 'https://api.quran.com/api/v4'

export const TAFSIRS = {
  ibn_kathir: { id: 169, name: 'Ibn Kathir', lang: 'en', nameAr: 'ابن كثير' },
  al_tabari:  { id: 1,   name: 'Al-Tabari',  lang: 'ar', nameAr: 'الطبري'  },
  al_sadi:    { id: 91,  name: "Al-Sa'di",   lang: 'ar', nameAr: 'السعدي'  },
}

export async function getTafsirForVerse(verseKey, tafsirId) {
  const res = await fetch(`${BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`)
  if (!res.ok) throw new Error(`Tafsir ${tafsirId} unavailable`)
  const { tafsir } = await res.json()
  return tafsir?.text?.replace(/<[^>]*>/g, '').trim() || null
}

export async function getAllTafsirsForVerse(verseKey) {
  const results = {}
  await Promise.allSettled(
    Object.entries(TAFSIRS).map(async ([key, t]) => {
      try {
        results[key] = await getTafsirForVerse(verseKey, t.id)
      } catch {
        results[key] = null
      }
    })
  )
  return results
}
