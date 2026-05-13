function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

let lastRequest = Promise.resolve();

function enqueue(fn) {
  const result = lastRequest.then(() => fn());
  lastRequest = result.then(
    () => new Promise(r => setTimeout(r, 300)),
    () => new Promise(r => setTimeout(r, 300))
  );
  return result;
}

async function translateToFrench(text) {
  if (!text) return text;

  const cacheKey = `noor_trans_${hashCode(text)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const translated = await enqueue(async () => {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr&de=souhibdev@gmail.com`;
      const res = await fetch(url);
      const data = await res.json();
      return data?.responseData?.translatedText || text;
    });
    if (translated !== text) localStorage.setItem(cacheKey, translated);
    return translated;
  } catch {
    return text;
  }
}

export { translateToFrench, hashCode };
