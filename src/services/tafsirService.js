import { translateToFrench } from './translationService.js';

const BASE = 'https://api.quran.com/api/v4';
const ARABIC_RE = /[؀-ۿ]/;

export const TAFSIRS = {
  ibn_kathir: { id: 169, name: 'Ibn Kathir', lang: 'en', nameAr: 'ابن كثير' },
  al_tabari:  { id: 1,   name: 'Al-Tabari',  lang: 'ar', nameAr: 'الطبري'  },
  al_sadi:    { id: 91,  name: "Al-Sa'di",   lang: 'ar', nameAr: 'السعدي'  },
};

export async function getTafsirForVerse(verseKey, tafsirId) {
  const res = await fetch(`${BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
  if (!res.ok) throw new Error(`Tafsir ${tafsirId} unavailable`);
  const { tafsir } = await res.json();
  return tafsir?.text?.replace(/<[^>]*>/g, '').trim() || null;
}

export async function getAllTafsirsForVerse(verseKey) {
  const results = {};
  await Promise.allSettled(
    Object.entries(TAFSIRS).map(async ([key, t]) => {
      try {
        results[key] = await getTafsirForVerse(verseKey, t.id);
      } catch {
        results[key] = null;
      }
    })
  );
  return results;
}

function splitIntoChunks(text, maxLen = 400) {
  const sentences = text.split('. ');
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    const next = current ? `${current}. ${sentence}` : sentence;
    if (next.length > maxLen && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function translateTafsirText(text, verseKey, tafsirId) {
  if (!text || ARABIC_RE.test(text)) return text;

  const cacheKey = `noor_tafsir_trans_${verseKey}_${tafsirId}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const chunks = splitIntoChunks(text);
  const parts = [];
  for (const chunk of chunks) {
    parts.push(await translateToFrench(chunk));
  }
  const result = parts.join(' ');
  if (result !== text) localStorage.setItem(cacheKey, result);
  return result;
}
