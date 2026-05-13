# NOOR AI — نور — Claude Code Implementation Prompt

## HOW TO USE THIS FILE

You are Claude Code. Your job is to implement the Noor AI application exactly as specified in this document.

Rules:
- Read this entire document before writing a single line of code
- Implement files in the exact order listed in the IMPLEMENTATION ORDER section
- Never hardcode Quran text, hadiths, or prayer times — always fetch from the APIs specified
- After each file, confirm it is complete before moving to the next
- If an API structure is unclear, implement a robust error handler and continue
- When you finish all files, run `npm run dev` and report any errors

---

## PROJECT OVERVIEW

Noor AI is a serious Islamic companion app for French and English-speaking Muslims worldwide.
It will be used by millions of people. A single error in a Quranic verse, a wrong prayer time,
or a fabricated hadith destroys all credibility instantly. Zero tolerance for errors.

---

## TECH STACK

```
Framework:     React 18 + Vite
Routing:       React Router v6
Styling:       Inline CSS + CSS variables (NO Tailwind, NO CSS frameworks)
Icons:         Custom inline SVG only (NO icon libraries, NO emojis)
Fonts:         Google Fonts — Amiri, Playfair Display, DM Sans, Space Mono
Deploy target: Vercel
```

Install dependencies:
```bash
npm install adhan react-router-dom
```

Add to `index.html` `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Amiri:wght@400;700&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

---

## DESIGN SYSTEM

### CSS Variables (put in `src/styles/globals.css`)

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:        #06060e;
  --surface:    #0e0e1c;
  --raised:     #161628;
  --lift:       #1e1e32;
  --gold:       #c9a84c;
  --gold2:      #e8c97a;
  --gold-dim:   #8a6f2e;
  --gold-a06:   rgba(201,168,76,.06);
  --gold-a12:   rgba(201,168,76,.12);
  --gold-a20:   rgba(201,168,76,.20);
  --em:         #1db88e;
  --em-a10:     rgba(29,184,142,.10);
  --w:          #f5f0e8;
  --w60:        rgba(245,240,232,.60);
  --w30:        rgba(245,240,232,.30);
  --w15:        rgba(245,240,232,.15);
  --border:     rgba(201,168,76,.14);
  --border2:    rgba(201,168,76,.28);
  --r-sm:       10px;
  --r-md:       16px;
  --r-lg:       20px;

  --font-display: 'Playfair Display', serif;
  --font-arabic:  'Amiri', serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'Space Mono', monospace;
}

body {
  background: var(--ink);
  color: var(--w);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Arabic text class — use on every Arabic string */
.ar {
  font-family: var(--font-arabic);
  direction: rtl;
  text-align: right;
  font-size: 22px;
  line-height: 1.9;
}

/* Section label */
.slabel {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--w30);
  letter-spacing: .14em;
  text-transform: uppercase;
  padding: 24px 20px 10px;
  display: block;
}

/* Card base */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 22px;
}

/* Gold badge */
.badge-gold {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--gold-a06);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3px 11px;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--gold);
  letter-spacing: .06em;
}

/* Hadith solidity badges */
.badge-sahih   { background:rgba(0,200,100,.08);  border:1px solid rgba(0,200,100,.18);  color:#00c864; border-radius:20px; padding:2px 9px; font-family:var(--font-mono); font-size:9px; font-weight:700; }
.badge-hasan   { background:rgba(0,120,220,.09);  border:1px solid rgba(0,120,220,.18);  color:#4da6ff; border-radius:20px; padding:2px 9px; font-family:var(--font-mono); font-size:9px; font-weight:700; }
.badge-daif    { background:rgba(255,160,0,.09);  border:1px solid rgba(255,160,0,.18);  color:#ffa020; border-radius:20px; padding:2px 9px; font-family:var(--font-mono); font-size:9px; font-weight:700; }
.badge-mawdu   { background:rgba(220,50,50,.09);  border:1px solid rgba(220,50,50,.18);  color:#e05050; border-radius:20px; padding:2px 9px; font-family:var(--font-mono); font-size:9px; font-weight:700; }

/* Madhab badges */
.mb-hanafi  { background:rgba(0,120,220,.10); border:1px solid rgba(0,120,220,.20); color:#5aaff8; border-radius:20px; padding:2px 8px; font-family:var(--font-mono); font-size:8px; font-weight:700; }
.mb-maliki  { background:rgba(0,200,100,.09); border:1px solid rgba(0,200,100,.18); color:#33d17a; border-radius:20px; padding:2px 8px; font-family:var(--font-mono); font-size:8px; font-weight:700; }
.mb-shafii  { background:rgba(230,170,0,.09); border:1px solid rgba(230,170,0,.18); color:#f0c040; border-radius:20px; padding:2px 8px; font-family:var(--font-mono); font-size:8px; font-weight:700; }
.mb-hanbali { background:rgba(220,60,60,.09); border:1px solid rgba(220,60,60,.18); color:#e06060; border-radius:20px; padding:2px 8px; font-family:var(--font-mono); font-size:8px; font-weight:700; }
```

### Design Rules (never break these)
- No emojis anywhere in the UI
- All icons are hand-drawn inline SVG
- Arabic text always uses `.ar` class — minimum 22px, RTL, never truncated mid-word
- Mobile-first, max-width 375px centered — designed for future React Native conversion
- Islamic geometric 8-pointed star SVG pattern as fixed background, opacity 0.028
- Always show data source in UI (prayer times, Quran translation, etc.)
- If any API fails: show a clear error message, never show silent wrong data

---

## LANGUAGE SYSTEM (FR + EN)

The app supports French and English. Default is French.

```javascript
// src/i18n/translations.js

export const T = {
  fr: {
    // Navigation
    home: 'Accueil',
    quran: 'Coran',
    prayers: 'Prières',
    assistant: 'Assistant',
    more: 'Plus',
    tafsir: 'Tafsir',
    reminders: 'Rappels',
    calendar: 'Calendrier',
    zakat: 'Zakat',
    settings: 'Paramètres',

    // Home
    next_prayer: 'Prochaine prière',
    in: 'Dans',
    verse_of_day: 'Verset du jour',
    hadith_of_day: 'Hadith du jour',
    modules: 'Modules',
    upcoming_events: 'Prochains événements',

    // Prayers
    prayer_fajr: 'Fajr',
    prayer_shuruk: 'Shuruk',
    prayer_dhuhr: 'Dhuhr',
    prayer_asr: 'Asr',
    prayer_maghrib: 'Maghrib',
    prayer_isha: 'Isha',
    qibla_direction: 'Direction Qibla',
    distance_mecca: 'Distance de La Mecque',
    prayer_source: 'Source des horaires',
    location_unknown: 'Localisation inconnue — entrez votre ville',
    enter_city: 'Entrez votre ville...',

    // Quran
    surah: 'Sourate',
    verse: 'Verset',
    verses: 'versets',
    meccan: 'Makkiyya',
    medinan: 'Madaniyya',
    resume_reading: 'Reprendre la lecture',
    memorized: 'Mémorisé',
    mark_memorized: 'Marquer comme mémorisé',
    play_audio: 'Écouter',
    reciter: 'Récitateur',
    hifz_progress: 'Progression Hifz',

    // Assistant
    ask_placeholder: 'Pose ta question islamique…',
    disclaimer: 'Noor est un outil d\'aide à la connaissance islamique. Pour des décisions personnelles importantes, consulte un érudit qualifié ou le Conseil Européen de la Fatwa.',
    sources: 'Sources de vérification',
    out_of_scope: 'Je suis Noor, un assistant spécialisé en connaissances islamiques. Je ne peux pas répondre à cette question, mais je serais heureux de t\'aider sur tout sujet lié à l\'islam.',

    // Zakat
    zakat_mal: 'Zakat Al-Mal',
    zakat_fitr: 'Zakat Al-Fitr',
    cash_savings: 'Argent liquide / Épargne',
    gold_grams: 'Or (grammes)',
    silver_grams: 'Argent métal (grammes)',
    investments: 'Investissements / Actions',
    receivables: 'Créances à recevoir',
    debts: 'Dettes à payer',
    nisab: 'Nisab (85g d\'or)',
    zakat_due: 'Zakat due',
    not_obligatory: 'Zakat non obligatoire',
    total_wealth: 'Patrimoine zakatable',
    gold_price_source: 'Prix de l\'or',
    indicative_price: 'Prix indicatif',
    family_members: 'Membres de la famille',
    zakat_fitr_amount: 'Zakat Al-Fitr à payer',

    // Calendar
    recommended: 'Recommandé',
    obligatory: 'Obligatoire',
    commemorative: 'Commémoratif',
    days_until: 'dans',
    days: 'jours',
    today: 'Aujourd\'hui',

    // Errors
    error_location: 'Impossible de détecter votre position',
    error_prayer: 'Horaires indisponibles — réessayez',
    error_quran: 'Coran indisponible — vérifiez votre connexion',
    error_api: 'Données indisponibles — réessayez',
    retry: 'Réessayer',
  },

  en: {
    home: 'Home',
    quran: 'Quran',
    prayers: 'Prayers',
    assistant: 'Assistant',
    more: 'More',
    tafsir: 'Tafsir',
    reminders: 'Reminders',
    calendar: 'Calendar',
    zakat: 'Zakat',
    settings: 'Settings',
    next_prayer: 'Next Prayer',
    in: 'In',
    verse_of_day: 'Verse of the Day',
    hadith_of_day: 'Hadith of the Day',
    modules: 'Modules',
    upcoming_events: 'Upcoming Events',
    prayer_fajr: 'Fajr',
    prayer_shuruk: 'Sunrise',
    prayer_dhuhr: 'Dhuhr',
    prayer_asr: 'Asr',
    prayer_maghrib: 'Maghrib',
    prayer_isha: 'Isha',
    qibla_direction: 'Qibla Direction',
    distance_mecca: 'Distance to Mecca',
    prayer_source: 'Prayer times source',
    location_unknown: 'Location unknown — enter your city',
    enter_city: 'Enter your city...',
    surah: 'Surah',
    verse: 'Verse',
    verses: 'verses',
    meccan: 'Meccan',
    medinan: 'Medinan',
    resume_reading: 'Resume reading',
    memorized: 'Memorized',
    mark_memorized: 'Mark as memorized',
    play_audio: 'Play',
    reciter: 'Reciter',
    hifz_progress: 'Hifz Progress',
    ask_placeholder: 'Ask your Islamic question…',
    disclaimer: 'Noor is an Islamic knowledge tool. For important personal decisions, consult a qualified scholar or the European Council for Fatwa and Research.',
    sources: 'Verification sources',
    out_of_scope: 'I am Noor, an assistant specialized in Islamic knowledge. I cannot answer this question, but I would be happy to help with any Islam-related topic.',
    zakat_mal: 'Zakat Al-Mal',
    zakat_fitr: 'Zakat Al-Fitr',
    cash_savings: 'Cash / Savings',
    gold_grams: 'Gold (grams)',
    silver_grams: 'Silver (grams)',
    investments: 'Investments / Stocks',
    receivables: 'Receivables',
    debts: 'Debts',
    nisab: 'Nisab (85g gold)',
    zakat_due: 'Zakat due',
    not_obligatory: 'Zakat not obligatory',
    total_wealth: 'Zakatable wealth',
    gold_price_source: 'Gold price',
    indicative_price: 'Indicative price',
    family_members: 'Family members',
    zakat_fitr_amount: 'Zakat Al-Fitr total',
    recommended: 'Recommended',
    obligatory: 'Obligatory',
    commemorative: 'Commemorative',
    days_until: 'in',
    days: 'days',
    today: 'Today',
    error_location: 'Could not detect your location',
    error_prayer: 'Prayer times unavailable — please retry',
    error_quran: 'Quran unavailable — check your connection',
    error_api: 'Data unavailable — please retry',
    retry: 'Retry',
  }
};

// Language context
import { createContext, useContext, useState } from 'react';
export const LangContext = createContext('fr');
export const useLang = () => {
  const lang = useContext(LangContext);
  return (key) => T[lang]?.[key] || T['fr'][key] || key;
};
```

---

## FILE STRUCTURE

```
noor-ai/
├── index.html
├── .env                              ← VITE_ANTHROPIC_API_KEY=sk-ant-...
├── vite.config.js
├── public/
│   └── sw.js                         ← Service Worker for push notifications
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── i18n/
    │   └── translations.js
    ├── styles/
    │   └── globals.css
    ├── components/
    │   ├── IslamicPattern.jsx         ← Fixed SVG background
    │   ├── BottomNav.jsx
    │   ├── SplashScreen.jsx
    │   ├── SoliditeBadge.jsx
    │   ├── MadhabRow.jsx
    │   └── ErrorMessage.jsx
    ├── services/
    │   ├── locationService.js
    │   ├── prayerService.js
    │   ├── quranService.js
    │   ├── tafsirService.js
    │   ├── hadithService.js
    │   ├── ayahService.js
    │   ├── hijriService.js
    │   └── zakatService.js
    ├── data/
    │   ├── islamicEvents.js
    │   └── calendarThemes.js
    └── pages/
        ├── Home.jsx
        ├── Coran.jsx
        ├── SourateReader.jsx
        ├── PrayerTimes.jsx
        ├── Assistant.jsx
        ├── Tafsir.jsx
        ├── Rappels.jsx
        ├── Calendrier.jsx
        ├── Zakat.jsx
        └── Settings.jsx
```

---

## IMPLEMENTATION ORDER — FOLLOW EXACTLY

Implement files in this exact order. Complete each file fully before starting the next.

### STEP 1 — Project foundation

**`src/styles/globals.css`**
The full CSS from the DESIGN SYSTEM section above.

**`src/i18n/translations.js`**
The full translations from the LANGUAGE SYSTEM section above.

**`src/main.jsx`**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
```

**`src/App.jsx`**
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { LangContext } from './i18n/translations'
import SplashScreen from './components/SplashScreen'
import IslamicPattern from './components/IslamicPattern'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Coran from './pages/Coran'
import SourateReader from './pages/SourateReader'
import PrayerTimes from './pages/PrayerTimes'
import Assistant from './pages/Assistant'
import Tafsir from './pages/Tafsir'
import Rappels from './pages/Rappels'
import Calendrier from './pages/Calendrier'
import Zakat from './pages/Zakat'
import Settings from './pages/Settings'

export default function App() {
  const [splash, setSplash] = useState(true)
  const [lang, setLang] = useState(
    localStorage.getItem('noor_lang') || 'fr'
  )

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />

  return (
    <LangContext.Provider value={lang}>
      <BrowserRouter>
        <IslamicPattern />
        <div style={{ maxWidth: 375, margin: '0 auto', minHeight: '100vh',
                       paddingBottom: 80, position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/coran" element={<Coran />} />
            <Route path="/coran/:numero" element={<SourateReader />} />
            <Route path="/prayers" element={<PrayerTimes />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/tafsir/:verseKey" element={<Tafsir />} />
            <Route path="/rappels" element={<Rappels />} />
            <Route path="/calendrier" element={<Calendrier />} />
            <Route path="/zakat" element={<Zakat />} />
            <Route path="/settings" element={<Settings lang={lang} setLang={setLang} />} />
          </Routes>
        </div>
        <BottomNav />
      </BrowserRouter>
    </LangContext.Provider>
  )
}
```

---

### STEP 2 — Components

**`src/components/IslamicPattern.jsx`**
SVG 8-pointed Islamic geometric star, tiled as a fixed background pattern.
```jsx
export default function IslamicPattern() {
  return (
    <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%',
                  opacity:0.028, pointerEvents:'none', zIndex:0 }}>
      <defs>
        <pattern id="star" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#c9a84c" strokeWidth="0.6">
            <polygon points="30,4 37,16 50,16 41,24 44,37 30,30 16,37 19,24 10,16 23,16"/>
            <polygon points="30,11 35,19 44,19 38,25 40,34 30,29 20,34 22,25 16,19 25,19"/>
            <circle cx="30" cy="30" r="4"/>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#star)"/>
    </svg>
  )
}
```

**`src/components/SplashScreen.jsx`**
```jsx
import { useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--ink)',
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', zIndex:9999 }}>
      <div style={{ fontFamily:'var(--font-arabic)', fontSize:96, color:'var(--gold)',
                    lineHeight:1, animation:'splashIn 1.8s ease forwards' }}>
        نور
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:16, color:'var(--w30)',
                    marginTop:16, letterSpacing:'0.12em',
                    animation:'splashSub 1.8s ease 0.4s both' }}>
        Noor AI
      </div>
      <div style={{ width:48, height:1, background:'linear-gradient(90deg,transparent,var(--gold),transparent)',
                    marginTop:16, animation:'splashSub 1.8s ease 0.7s both' }}/>
      <style>{`
        @keyframes splashIn {
          0%   { opacity:0; transform:scale(0.8); }
          60%  { opacity:1; transform:scale(1.04); }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes splashSub {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}
```

**`src/components/BottomNav.jsx`**
5 tabs: Home, Quran, Prayers, Assistant, More.
Active state: 2px gold bar at top of tab, gold label.
SVG icons — draw each one inline.
"More" tab opens a drawer with links to: Tafsir, Rappels, Calendrier, Zakat, Settings.

**`src/components/SoliditeBadge.jsx`**
```jsx
export default function SoliditeBadge({ value }) {
  const map = {
    sahih:  { label: '✓ Sahih',  className: 'badge-sahih'  },
    hasan:  { label: '◈ Hasan',  className: 'badge-hasan'  },
    daif:   { label: '⚠ Da\'if', className: 'badge-daif'   },
    mawdu:  { label: '✕ Mawdu\'',className: 'badge-mawdu'  },
  }
  const b = map[value?.toLowerCase()] || map.hasan
  return <span className={b.className}>{b.label}</span>
}
```

**`src/components/MadhabRow.jsx`**
```jsx
export default function MadhabRow({ hanafi, maliki, shafii, hanbali }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
      {hanafi  && <span className="mb-hanafi">🔵 Hanafi — {hanafi}</span>}
      {maliki  && <span className="mb-maliki">🟢 Maliki — {maliki}</span>}
      {shafii  && <span className="mb-shafii">🟡 Shafi'i — {shafii}</span>}
      {hanbali && <span className="mb-hanbali">🔴 Hanbali — {hanbali}</span>}
    </div>
  )
}
```

**`src/components/ErrorMessage.jsx`**
```jsx
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{ margin:'20px', padding:'16px 20px', background:'rgba(220,50,50,.08)',
                  border:'1px solid rgba(220,50,50,.2)', borderRadius:'var(--r-md)',
                  textAlign:'center' }}>
      <p style={{ color:'#e05050', fontSize:13, marginBottom: onRetry ? 12 : 0 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          style={{ background:'transparent', border:'1px solid rgba(220,50,50,.3)',
                   color:'#e05050', borderRadius:8, padding:'6px 16px',
                   fontSize:12, cursor:'pointer', fontFamily:'var(--font-mono)' }}>
          Retry
        </button>
      )}
    </div>
  )
}
```

---

### STEP 3 — Services

**`src/services/locationService.js`**

```javascript
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
```

---

**`src/services/prayerService.js`**

Three-tier cascade. Try Mawaqit first (most accurate, mosque-based), 
then Aladhan API, then local Adhan.js calculation. Never fail silently.

```javascript
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

  // Mawaqit returns calendar array indexed by day-of-year
  const dayIndex = getDayOfYear(new Date()) - 1
  const times = data.calendar?.[dayIndex] ?? data.times
  if (!times || times.length < 6) throw new Error('Invalid Mawaqit times')

  return {
    source: 'mawaqit',
    mosqueName: mosques[0].name,
    city: mosques[0].city || mosques[0].address,
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
    // method=3 = Muslim World League
  )
  if (!res.ok) throw new Error('Aladhan failed')
  const { data } = await res.json()
  const t = data.timings
  return {
    source: 'aladhan',
    city: '',
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
  const pt = new PrayerTimes(coords, new Date(), params)
  const fmt = d => d.toLocaleTimeString('fr-BE', {
    hour: '2-digit', minute: '2-digit', hour12: false
  })
  return {
    source: 'adhan-mwl',
    city: '',
    fajr:    fmt(pt.fajr),
    shuruk:  fmt(pt.sunrise),
    dhuhr:   fmt(pt.dhuhr),
    asr:     fmt(pt.asr),
    maghrib: fmt(pt.maghrib),
    isha:    fmt(pt.isha),
    rawTimes: pt,  // keep for next prayer calculation
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
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const prayers = ['fajr','dhuhr','asr','maghrib','isha']
  const arabicNames = {
    fajr:'الفجر', dhuhr:'الظهر', asr:'العصر', maghrib:'المغرب', isha:'العشاء'
  }
  for (const name of prayers) {
    const [h, m] = times[name].split(':').map(Number)
    const prayerMins = h * 60 + m
    if (prayerMins > nowMins) {
      const diff = prayerMins - nowMins
      return {
        name, arabic: arabicNames[name],
        time: times[name],
        minutesUntil: diff,
        hoursUntil: Math.floor(diff / 60),
        minsUntil: diff % 60,
      }
    }
  }
  // Past Isha — next is Fajr tomorrow
  const [h, m] = times.fajr.split(':').map(Number)
  const fajrMins = h * 60 + m + 1440
  const diff = fajrMins - nowMins
  return {
    name: 'fajr', arabic: 'الفجر',
    time: times.fajr,
    minutesUntil: diff,
    hoursUntil: Math.floor(diff / 60),
    minsUntil: diff % 60,
  }
}

export function getQiblaAngle(lat, lng) {
  const MECCA_LAT = 21.3891 * Math.PI / 180
  const MECCA_LNG = 39.8579 * Math.PI / 180
  const userLat = lat * Math.PI / 180
  const dLng = MECCA_LNG - (lng * Math.PI / 180)
  const y = Math.sin(dLng) * Math.cos(MECCA_LAT)
  const x = Math.cos(userLat) * Math.sin(MECCA_LAT) -
            Math.sin(userLat) * Math.cos(MECCA_LAT) * Math.cos(dLng)
  let angle = Math.atan2(y, x) * 180 / Math.PI
  return (angle + 360) % 360
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date - start) / 86400000)
}
```

---

**`src/services/hijriService.js`**

```javascript
export async function getHijriDate(date = new Date()) {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/gToH?date=${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`
    )
    const { data } = await res.json()
    const h = data.hijri
    return {
      day:      parseInt(h.day),
      month:    parseInt(h.month.number),
      monthAr:  h.month.ar,
      monthEn:  h.month.en,
      year:     parseInt(h.year),
      display:  `${h.day} ${h.month.ar} ${h.year}`,
    }
  } catch {
    return fallbackHijri(date)
  }
}

function fallbackHijri(date) {
  // Simple approximate calculation (use only if API fails)
  const JD = Math.floor((date - new Date('622-07-16')) / 86400000) + 1
  const year = Math.floor((30 * JD + 10646) / 10631)
  const month = Math.min(12, Math.ceil((JD - Math.floor(29.5001 * (year - 1))) / 29.5))
  const day = JD - Math.floor(29.5001 * (month - 1)) - Math.floor(29.5001 * (year - 1) * 12)
  const monthNames = ['Muharram','Safar',"Rabi' I","Rabi' II","Jumada I","Jumada II",
                      'Rajab',"Sha'ban",'Ramadan','Shawwal',"Dhul Qa'da",'Dhul Hijja']
  return { day, month, monthAr: monthNames[month-1], monthEn: monthNames[month-1], year, display: `${day} ${monthNames[month-1]} ${year}` }
}
```

---

**`src/services/quranService.js`**

CRITICAL: All Quran text comes ONLY from api.quran.com with text_uthmani.
Never hardcode Quranic Arabic text in the application code.

```javascript
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

  const { verses: arabicVerses } = await arabicRes.json()
  const { verses: transVerses }  = await translationRes.json()

  return transVerses.map((v, i) => ({
    number:      v.verse_number,
    key:         v.verse_key,           // e.g. "2:255"
    arabic:      arabicVerses[i]?.text_uthmani || '',
    translation: v.translations?.[0]?.text?.replace(/<[^>]*>/g, '') || '',
    audioUrl:    getAudioUrl(v.id || getGlobalVerseNumber(surahNumber, v.verse_number)),
  }))
}

export async function getSingleVerse(verseKey, lang = 'fr') {
  const translationId = TRANSLATIONS[lang] || TRANSLATIONS.fr
  const [arabicRes, transRes] = await Promise.all([
    fetch(`${BASE}/verses/by_key/${verseKey}?fields=text_uthmani`),
    fetch(`${BASE}/verses/by_key/${verseKey}?translations=${translationId}&fields=text_uthmani`)
  ])
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

// Calculate global verse number from surah + verse number
// Needed for audio URL
function getGlobalVerseNumber(surah, verse) {
  // Pre-computed surah starting verse numbers
  const STARTS = [0,1,7,293,493,670,789,954,1160,1235,1364,1473,1596,1707,1750,1802,
    1901,2029,2140,2250,2348,2483,2595,2673,2791,2855,2932,3159,3252,3340,3409,3469,
    3503,3533,3606,3660,3705,3788,3970,4058,4133,4218,4272,4325,4414,4473,4510,4545,
    4583,4612,4630,4675,4735,4784,4846,4901,4979,5075,5104,5126,5150,5163,5177,5188,
    5199,5217,5229,5241,5271,5323,5375,5419,5447,5475,5495,5551,5600,5672,5712,5758,
    5800,5829,5848,5884,5909,5931,5948,5967,5993,6023,6043,6058,6079,6090,6098,6106,
    6125,6130,6138,6146,6157,6168,6176,6179,6188,6193,6197,6204,6207,6213,6216,6221,
    6225,6230,6236]
  return (STARTS[surah - 1] || 0) + verse
}
```

---

**`src/services/tafsirService.js`**

```javascript
const BASE = 'https://api.quran.com/api/v4'

// Available tafsir IDs
export const TAFSIRS = {
  ibn_kathir: { id: 169, name: 'Ibn Kathir', lang: 'en', nameAr: 'ابن كثير' },
  al_tabari:  { id: 1,   name: 'Al-Tabari',  lang: 'ar', nameAr: 'الطبري' },
  al_sadi:    { id: 91,  name: "Al-Sa'di",   lang: 'ar', nameAr: 'السعدي' },
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
```

---

**`src/services/hadithService.js`**

Hadiths come from sunnah.com API for authenticity, with a local fallback pool.
The daily hadith rotates deterministically — same day = same hadith for all users worldwide.
Selection is themed based on the Islamic calendar (pre-Ramadan = fasting hadiths, etc.)

```javascript
import { getThemeForDate } from './ayahService'

// Verified hadith pool — each entry has source + solidity + isnad
// This pool is used as fallback and for offline mode
export const HADITH_POOL = [
  {
    id: 'bukhari-5027',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    fr: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.",
    en: "The best among you are those who learn the Quran and teach it.",
    source: 'Sahih Al-Bukhari',
    book: "Kitab Fadha'il Al-Quran",
    number: 5027,
    narrator: "Uthman ibn Affan رضي الله عنه",
    isnad: "Bukhari ← Hajjaj ← Shu'ba ← Alqama ← Sa'd ibn Ubayda ← Abu Abd Al-Rahman ← Uthman",
    solidity: 'sahih',
    theme: 'quran',
    reflection_fr: "Consacre quelques minutes aujourd'hui à réciter ou apprendre un verset.",
    reflection_en: "Dedicate a few minutes today to reciting or learning a verse.",
  },
  {
    id: 'muslim-2626',
    arabic: 'لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا',
    fr: "Ne méprise aucune bonne action, aussi petite soit-elle.",
    en: "Do not belittle any act of kindness, no matter how small.",
    source: 'Sahih Muslim',
    book: "Kitab Al-Birr wa Al-Sila",
    number: 2626,
    narrator: "Abu Dharr Al-Ghifari رضي الله عنه",
    isnad: "Muslim ← Ibn Abi Umar ← Sufyan ← Abu Ishaq Al-Shaybani ← Abu Bakr ← Abu Dharr",
    solidity: 'sahih',
    theme: 'generosity',
    reflection_fr: "Même un sourire est une sadaqa. Cherche une petite bonté à faire aujourd'hui.",
    reflection_en: "Even a smile is charity. Look for one small act of kindness today.",
  },
  {
    id: 'bukhari-6018',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    fr: "Que celui qui croit en Allah et au Jour dernier dise une bonne parole ou se taise.",
    en: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    source: 'Sahih Al-Bukhari',
    book: "Kitab Al-Adab",
    number: 6018,
    narrator: "Abu Hurayra رضي الله عنه",
    isnad: "Bukhari ← Abd Allah ibn Yusuf ← Malik ← Ibn Shihab ← Abu Salama ← Abu Hurayra",
    solidity: 'sahih',
    theme: 'speech',
    reflection_fr: "Avant de parler, demande-toi : est-ce que ces mots sont bons ?",
    reflection_en: "Before speaking, ask yourself: are these words good?",
  },
  {
    id: 'bukhari-1904',
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    fr: "Celui qui jeûne pendant Ramadan par foi et dans l'espoir de la récompense divine, ses péchés passés lui seront pardonnés.",
    en: "Whoever fasts during Ramadan out of sincere faith and hoping for reward will have his past sins forgiven.",
    source: 'Sahih Al-Bukhari',
    book: "Kitab Al-Iman",
    number: 38,
    narrator: "Abu Hurayra رضي الله عنه",
    isnad: "Bukhari ← Yahya ibn Bukayr ← Al-Layth ← Uqayl ← Ibn Shihab ← Abu Salama ← Abu Hurayra",
    solidity: 'sahih',
    theme: 'ramadan',
    reflection_fr: "Le jeûne de Ramadan est une purification complète pour celui qui le fait avec sincérité.",
    reflection_en: "Ramadan fasting is a complete purification for those who observe it with sincerity.",
  },
  {
    id: 'tirmidhi-2004',
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا',
    fr: "Crains Allah où que tu sois. Fais suivre une mauvaise action d'une bonne, elle l'effacera.",
    en: "Fear Allah wherever you are. Follow a bad deed with a good deed and it will erase it.",
    source: 'Sunan Al-Tirmidhi',
    book: "Kitab Al-Birr wa Al-Sila",
    number: 1987,
    narrator: "Abu Dharr Al-Ghifari رضي الله عنه",
    isnad: "Tirmidhi ← Mahmud ibn Ghaylan ← Abu Dawud Al-Tayalisi ← Shu'ba ← Abu Ishaq ← Abu Juhayna ← Abu Dharr",
    solidity: 'sahih',
    theme: 'tawba',
    reflection_fr: "Après chaque erreur, fais immédiatement une bonne action. C'est la clé du pardon.",
    reflection_en: "After every mistake, immediately do a good deed. That is the key to forgiveness.",
  },
  // Add minimum 20 hadiths here. Each MUST have: arabic, fr, en, source, number, isnad, solidity, theme.
  // Themes to cover: quran, prayer, fasting, generosity, family, honesty, patience,
  //                  gratitude, ramadan, eid, hajj, dhikr, tawba, speech, neighbors, work, zakat
]

export function getHadithOfDay(hijriDate) {
  const theme = getThemeForDate(hijriDate)
  const themed = HADITH_POOL.filter(h => h.theme === theme)
  const pool = themed.length > 0 ? themed : HADITH_POOL
  const daysSinceEpoch = Math.floor(Date.now() / 86400000)
  return pool[daysSinceEpoch % pool.length]
}
```

---

**`src/services/ayahService.js`**

Daily verse selection from api.quran.com — themed by Islamic calendar.
Never hardcode Quranic text. Always fetch from API.

```javascript
// Themes by proximity to Islamic events
const CALENDAR_THEMES = [
  { event: 'ramadan',  daysBeforeStart: 21, theme: 'fasting' },
  { event: 'ramadan',  duringEvent: true,   theme: 'ramadan' },
  { event: 'eid_fitr', daysBeforeStart: 7,  theme: 'gratitude' },
  { event: 'eid_adha', daysBeforeStart: 14, theme: 'sacrifice' },
  { event: 'arafat',   daysBeforeStart: 3,  theme: 'hajj' },
  { event: 'achoura',  daysBeforeStart: 7,  theme: 'history' },
  { event: 'mawlid',   daysBeforeStart: 7,  theme: 'prophet' },
  { event: 'miraj',    daysBeforeStart: 3,  theme: 'spirituality' },
]

// General themes for regular days
const GENERAL_THEMES = [
  'patience','gratitude','family','honesty','prayer',
  'generosity','dhikr','tawakkul','knowledge','mercy'
]

// Curated verse keys per theme — all fetched live from api.quran.com
const VERSES_BY_THEME = {
  ramadan:     ['2:185','97:1','2:183','44:3','97:3'],
  fasting:     ['2:183','2:184','2:185','2:187'],
  gratitude:   ['14:7','31:12','2:152','39:66'],
  sacrifice:   ['22:37','37:107','108:2'],
  hajj:        ['3:97','22:27','2:196'],
  history:     ['14:6','2:50','7:141'],
  prophet:     ['33:21','68:4','21:107','3:31'],
  spirituality:['17:79','73:2','17:1'],
  patience:    ['2:155','2:177','39:10','3:200'],
  family:      ['4:1','17:23','31:14','46:15'],
  honesty:     ['9:119','33:70','5:8'],
  prayer:      ['2:45','2:238','20:132','29:45'],
  generosity:  ['2:261','2:177','3:92','59:9'],
  dhikr:       ['13:28','33:41','2:152'],
  tawakkul:    ['65:3','3:159','33:3'],
  knowledge:   ['96:1','20:114','58:11'],
  mercy:       ['7:156','21:107','6:54'],
}

export function getThemeForDate(hijriDate) {
  if (!hijriDate) return 'patience'
  const { month, day } = hijriDate

  // Ramadan (month 9)
  if (month === 9) return 'ramadan'
  if (month === 8 && day >= 10) return 'fasting'        // 20 days before Ramadan
  // Eid Al-Fitr
  if (month === 10 && day <= 3) return 'gratitude'
  // Eid Al-Adha + Arafat
  if (month === 12 && day === 9) return 'hajj'
  if (month === 12 && day >= 10 && day <= 13) return 'sacrifice'
  if (month === 11 && day >= 20) return 'sacrifice'     // pre-Adha
  // Mawlid
  if (month === 3 && day >= 6 && day <= 14) return 'prophet'
  // Mi'raj
  if (month === 7 && day >= 25) return 'spirituality'
  // Achoura
  if (month === 1 && day >= 5 && day <= 11) return 'history'

  // General: rotate by day of year
  const dayOfYear = Math.floor(Date.now() / 86400000) % GENERAL_THEMES.length
  return GENERAL_THEMES[dayOfYear]
}

export async function getVerseOfDay(hijriDate, lang = 'fr') {
  const theme = getThemeForDate(hijriDate)
  const pool  = VERSES_BY_THEME[theme] || VERSES_BY_THEME.patience
  const daysSinceEpoch = Math.floor(Date.now() / 86400000)
  const verseKey = pool[daysSinceEpoch % pool.length]

  // Fetch live from api.quran.com
  const { getSingleVerse } = await import('./quranService')
  const verse = await getSingleVerse(verseKey, lang)
  return { ...verse, theme, key: verseKey }
}
```

---

**`src/services/zakatService.js`**

```javascript
export async function getGoldPrice() {
  try {
    const res = await fetch('https://api.gold-api.com/price/XAU')
    const data = await res.json()
    // XAU = USD per troy ounce. 1 troy oz = 31.1035g
    const usdPerGram = data.price / 31.1035
    // Get EUR/USD rate
    const fxRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR')
    const fx = await fxRes.json()
    const eurPerGram = usdPerGram * (fx.rates?.EUR || 0.92)
    return { eurPerGram, source: 'gold-api.com', live: true }
  } catch {
    return { eurPerGram: 85, source: 'indicative', live: false }
  }
}

export function calculateZakat({ cash, goldGrams, silverGrams, investments,
                                  receivables, debts, goldPricePerGram }) {
  const NISAB_GRAMS_GOLD = 85
  const NISAB_GRAMS_SILVER = 595
  const SILVER_PRICE_EUR = 0.85  // per gram approximate

  const goldValue    = goldGrams    * goldPricePerGram
  const silverValue  = silverGrams  * SILVER_PRICE_EUR
  const totalAssets  = cash + goldValue + silverValue + investments + receivables
  const totalWealth  = totalAssets - debts

  const nisabGold    = NISAB_GRAMS_GOLD   * goldPricePerGram
  const nisabSilver  = NISAB_GRAMS_SILVER * SILVER_PRICE_EUR
  const nisab        = nisabGold  // Use gold nisab (more common for contemporary scholars)

  const zakatDue     = totalWealth >= nisab ? totalWealth * 0.025 : 0

  return {
    totalWealth: Math.round(totalWealth * 100) / 100,
    nisab:       Math.round(nisab * 100) / 100,
    zakatDue:    Math.round(zakatDue * 100) / 100,
    obligatory:  totalWealth >= nisab,
    breakdown: {
      goldValue:   Math.round(goldValue * 100) / 100,
      silverValue: Math.round(silverValue * 100) / 100,
      totalAssets: Math.round(totalAssets * 100) / 100,
    }
  }
}

export function calculateZakatFitr(familyMembers) {
  // ECFR recommendation for Western Europe: €7-10 per person
  const FITR_AMOUNT_EUR = 8
  return {
    perPerson: FITR_AMOUNT_EUR,
    total: FITR_AMOUNT_EUR * familyMembers,
  }
}
```

---

### STEP 4 — Data files

**`src/data/islamicEvents.js`**

```javascript
// All dates are in Hijri. Gregorian dates are computed dynamically.
// Never hardcode Gregorian dates — the lunar calendar shifts ~11 days/year.

export const ISLAMIC_EVENTS = [
  {
    id: 'new_year',
    fr: "Nouvel An Islamique", en: "Islamic New Year",
    ar: "رأس السنة الهجرية",
    hijriMonth: 1, hijriDay: 1,
    type: 'commemorative',
    fr_desc: "Premier jour de l'année hijri, mois de Muharram.",
    en_desc: "First day of the Hijri year, month of Muharram.",
  },
  {
    id: 'achoura',
    fr: "Achoura", en: "Ashura",
    ar: "عاشوراء",
    hijriMonth: 1, hijriDay: 10,
    type: 'recommended',
    fr_desc: "Jour de jeûne recommandé. Allah a sauvé Moïse ﷺ ce jour-là.",
    en_desc: "Recommended day of fasting. Allah saved Moses ﷺ on this day.",
    hadithRef: 'Muslim 1162',
  },
  {
    id: 'mawlid',
    fr: "Mawlid Al-Nabawi", en: "Mawlid Al-Nabawi",
    ar: "المولد النبوي الشريف",
    hijriMonth: 3, hijriDay: 12,
    type: 'commemorative',
    fr_desc: "Naissance du Prophète Muhammad ﷺ.",
    en_desc: "Birth of the Prophet Muhammad ﷺ.",
  },
  {
    id: 'miraj',
    fr: "Laylat Al-Mi'raj", en: "Laylat Al-Mi'raj",
    ar: "ليلة المعراج",
    hijriMonth: 7, hijriDay: 27,
    type: 'recommended',
    fr_desc: "Nuit du voyage nocturne et de l'ascension du Prophète ﷺ vers les cieux.",
    en_desc: "Night of the Prophet's ﷺ nocturnal journey and ascension to the heavens.",
  },
  {
    id: 'baraa',
    fr: "Laylat Al-Bara'a", en: "Laylat Al-Bara'a",
    ar: "ليلة البراءة",
    hijriMonth: 8, hijriDay: 15,
    type: 'recommended',
    fr_desc: "15ème nuit de Sha'ban. Sa valeur est débattue — certains scholars la recommandent.",
    en_desc: "15th night of Sha'ban. Its merit is debated — some scholars recommend its observance.",
    note: 'scholarly_debate',
  },
  {
    id: 'ramadan_start',
    fr: "Début du Ramadan", en: "Start of Ramadan",
    ar: "بداية شهر رمضان",
    hijriMonth: 9, hijriDay: 1,
    type: 'obligatory',
    fr_desc: "Premier jour du mois béni de Ramadan. Début du jeûne obligatoire.",
    en_desc: "First day of the blessed month of Ramadan. Start of obligatory fasting.",
  },
  {
    id: 'laylat_qadr',
    fr: "Laylat Al-Qadr", en: "Laylat Al-Qadr",
    ar: "ليلة القدر",
    hijriMonth: 9, hijriDay: 27,
    type: 'recommended',
    fr_desc: "La Nuit du Destin, meilleure que 1000 mois. À rechercher dans les nuits impaires des 10 derniers jours.",
    en_desc: "The Night of Power, better than 1000 months. Seek it in the odd nights of the last 10 days.",
    note: 'exact_date_unknown',
  },
  {
    id: 'eid_fitr',
    fr: "Aïd Al-Fitr", en: "Eid Al-Fitr",
    ar: "عيد الفطر",
    hijriMonth: 10, hijriDay: 1,
    type: 'obligatory',
    fr_desc: "Fête de la rupture du jeûne. Salat Al-Aïd, Zakat Al-Fitr.",
    en_desc: "Feast of breaking the fast. Eid prayer, Zakat Al-Fitr.",
  },
  {
    id: 'arafat',
    fr: "Jour d'Arafat", en: "Day of Arafat",
    ar: "يوم عرفة",
    hijriMonth: 12, hijriDay: 9,
    type: 'recommended',
    fr_desc: "Jeûne expirant les péchés de l'année passée et de l'année à venir.",
    en_desc: "Fasting expiates sins of the past year and the coming year.",
    hadithRef: 'Muslim 1162',
  },
  {
    id: 'eid_adha',
    fr: "Aïd Al-Adha", en: "Eid Al-Adha",
    ar: "عيد الأضحى",
    hijriMonth: 12, hijriDay: 10,
    type: 'obligatory',
    fr_desc: "Fête du sacrifice. Commémoration du sacrifice d'Ibrahim ﷺ.",
    en_desc: "Feast of the sacrifice. Commemoration of Ibrahim's ﷺ sacrifice.",
  },
  {
    id: 'tashreeq',
    fr: "Ayyam Al-Tashreeq", en: "Days of Tashreeq",
    ar: "أيام التشريق",
    hijriMonth: 12, hijriDay: 11, hijriDayEnd: 13,
    type: 'recommended',
    fr_desc: "Jours 11, 12, 13 de Dhul Hijja — jours de dhikr, de joie et d'adoration.",
    en_desc: "Days 11, 12, 13 of Dhul Hijja — days of dhikr, joy and worship.",
  },
]

// White days — 13th, 14th, 15th of every Hijri month — fasting recommended
export const WHITE_DAYS = { days: [13, 14, 15], type: 'recommended',
  fr: "Jours Blancs", en: "White Days", ar: "أيام البيض",
  fr_desc: "Jeûne recommandé les 13, 14 et 15 de chaque mois lunaire.",
  en_desc: "Recommended fasting on the 13th, 14th and 15th of each lunar month.",
}

export function getUpcomingEvents(hijriDate, daysAhead = 60) {
  // Returns ISLAMIC_EVENTS sorted by proximity to current hijri date
  // Implementation: convert each event hijriMonth+hijriDay to days from now
  // Use hijriDate.month and hijriDate.day for comparison
  return ISLAMIC_EVENTS
    .map(ev => {
      let monthDiff = ev.hijriMonth - hijriDate.month
      let dayDiff   = ev.hijriDay   - hijriDate.day
      let totalDays = monthDiff * 30 + dayDiff
      if (totalDays < 0) totalDays += 354  // next year
      return { ...ev, daysUntil: totalDays }
    })
    .filter(ev => ev.daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}
```

---

### STEP 5 — Pages

**`src/pages/Home.jsx`**

Dashboard showing:
1. Topbar: "نور" logo left, Hijri + Gregorian date right
2. Next prayer card: prayer name (FR + Arabic), countdown (live, updates every second), 
   time, progress bar between last prayer and next prayer
3. All 5 prayers strip (horizontal scroll): highlight current prayer period
4. Verse of the day card: fetched from api.quran.com, Arabic + French/English translation, 
   reference badge, themed by Islamic calendar
5. Hadith of the day card: from HADITH_POOL, Arabic + translation, source, SoliditeBadge
6. Modules grid: 5 cards linking to Coran, Prayers, Tafsir, Rappels, Zakat
7. Upcoming events: next 3 Islamic events with countdown

All data fetched on mount with useEffect. Show skeleton loaders while loading.
Show ErrorMessage component if any fetch fails.

**`src/pages/PrayerTimes.jsx`**

1. Location display: city name + country, "Change location" button
   If no location: show city input form
2. Prayer source badge: "Via Mawaqit · Mosque Name" or "Via Aladhan" or "Adhan.js (local)"
3. Today's prayers: large cards for Fajr, Shuruk, Dhuhr, Asr, Maghrib, Isha
   Each card: SVG icon, name FR + Arabic, time, "active" highlight for current period
4. Weekly view: compact table 7 days × 5 prayers (no Shuruk in table)
5. Qibla section:
   - Calculate angle using getQiblaAngle(lat, lng)
   - SVG compass rose: outer ring with N/S/E/W marks, rotating needle pointing to Qibla
   - Display angle in degrees + distance to Mecca in km
   - Distance formula: haversine from user coords to Mecca (21.3891°N, 39.8579°E)

**`src/pages/Coran.jsx`**

1. Header with search bar (filter by surah name or number)
2. List of 114 surahs: number (gold circle), Arabic name, French/English name, 
   verse count, Meccan/Medinan badge
3. Hifz progress bar per surah (read from localStorage)
4. "Resume reading" button → navigates to last bookmark
5. Each surah tappable → navigates to /coran/:numero

**`src/pages/SourateReader.jsx`**

1. Header: surah name AR + FR/EN, verse count, Meccan/Medinan
2. Bismillah in Arabic (except surah 9) — fetched from API, displayed with .ar class
3. For each verse:
   - Verse number in gold circle
   - Arabic text (.ar class, 26px, RTL) — from api.quran.com text_uthmani ONLY
   - Translation (FR or EN based on user setting)
   - Row of action buttons: Play audio | Mark memorized | View Tafsir
4. Audio player: play/pause per verse, continuous mode toggle
5. Memorized verses stored in localStorage as `noor_hifz_{surah}_{verse}`
6. Bookmark saved on scroll: `noor_bookmark = { surah, verse }`

**`src/pages/Assistant.jsx`**

Full conversational AI chat. Islamic questions only.

System prompt (use exactly as written, never modify):
```
You are Noor (نور), a knowledgeable and compassionate Islamic assistant.

STRICT SCOPE RULE — ABSOLUTE:
You ONLY answer questions related to Islam: fiqh, Quran, hadith, Islamic history, 
worship, Islamic ethics, Muslim family life, halal/haram, spirituality, 
and the life of a Muslim. 

If a question is not related to Islam in any way, respond ONLY with:
"I am Noor, an assistant specialized in Islamic knowledge. I cannot answer this question, 
but I would be happy to help with any Islam-related topic."

No exceptions. No creative reframing to make non-Islamic questions seem Islamic.

MANDATORY RESPONSE FORMAT for fiqh questions:

1. DIRECT ANSWER (2-3 sentences, clear and accessible)

2. SCHOLARLY POSITIONS (when relevant):
   🔵 Hanafi: [position] — Source: [Al-Hidaya / Radd Al-Muhtar / Al-Mabsut]
   🟢 Maliki: [position] — Source: [Al-Muwatta / Al-Mudawwana / Mukhtasar Khalil]  
   🟡 Shafi'i: [position] — Source: [Al-Umm / Minhaj Al-Talibin / Al-Majmu']
   🔴 Hanbali: [position] — Source: [Al-Mughni / Zad Al-Ma'ad / Al-Insaf]

3. TEXTUAL EVIDENCE:
   For each Quran verse: Arabic text | French/English translation | (Surah Name X:Y)
   For each hadith: Arabic text | Translation | Compiler, Book, №number
   Isnad (chain): Narrator A → Narrator B → ... → Prophet ﷺ
   Solidity: ✅ Sahih | 🟦 Hasan | ⚠️ Da'if | ❌ Mawdu'

4. CONSENSUS OR DIVERGENCE: State if ijma' exists; explain ikhtilaf if it exists

5. CONTEMPORARY RULING (if applicable): ECFR position for European context

ABSOLUTE HONESTY RULES:
- Never invent a hadith number, chain, or scholarly opinion
- If uncertain about a reference: say "I cite this with caution — verify on sunnah.com"
- Never issue personal fatwas — always end sensitive answers with:
  "⚠️ For your personal situation, consult a qualified scholar or ECFR: ecfr.eu"
- Never take sides between madhabs — present positions neutrally
- Start every new conversation with: بسم الله الرحمن الرحيم

LANGUAGE: Respond in the same language the user writes in (French or English).
Arabic terms in italics with explanation on first use.
```

UI:
- Chat bubbles: user right (gold background), Noor left (raised surface)
- Arabic text in responses uses .ar class
- Madhab badges rendered using MadhabRow component
- SoliditeBadge rendered for hadith solidity
- Disclaimer bar fixed at bottom above input
- Suggested questions shown when chat is empty (5-6 common questions)
- Full conversation history kept in useState for multi-turn context

API call:
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: conversationHistory
  })
})
```

**`src/pages/Tafsir.jsx`**

Route: /tafsir/:verseKey (e.g. /tafsir/2:255)

1. Display the verse: Arabic + translation
2. Three tabs: Ibn Kathir | Al-Tabari | Al-Sa'di
3. Fetch each tafsir from api.quran.com using getTafsirForVerse()
4. "AI Summary" tab: call Claude API with this prompt:
   "Verse [key]: [arabic text]. Available tafsir excerpts: [texts].
   Write a clear, pedagogical summary in [lang] (150-200 words max).
   Mention asbab al-nuzul if present. Be factual, cite sources, 
   add nothing not found in the provided tafsirs."
5. Show loading state per tab
6. If tafsir unavailable: show "Not available for this verse"

**`src/pages/Rappels.jsx`**

1. Today's hadith (large card): Arabic + translation + source + SoliditeBadge + isnad
2. Reflection text (how to apply today)
3. Theme badge (e.g. "Patience", "Family")
4. Notification toggle: enable/disable + time picker
5. Archive: last 30 days of hadiths (reconstructed from HADITH_POOL using date seeds)
6. Filter by theme

**`src/pages/Calendrier.jsx`**

1. Current month view (simple grid, not a full calendar library)
   Mark days with Islamic events
2. Upcoming events list (next 60 days): 
   Each event: date box (day + month), AR name + FR/EN name, description, 
   type badge (Recommended/Obligatory/Commemorative), days-until countdown
3. Hijri/Gregorian conversion tool at bottom
4. Note scholarly debates where they exist (e.g. Laylat Al-Bara'a)

**`src/pages/Zakat.jsx`**

Multi-step calculator:

Step 1 — Choose type: Zakat Al-Mal | Zakat Al-Fitr

Step 2a (Zakat Al-Mal) — Input form:
  - Cash/Savings (€)
  - Gold (grams) — show live price below input, fetched from gold-api.com
  - Silver (grams)
  - Investments (€)
  - Receivables (€)
  - Debts (€) — subtracted

Step 2b (Zakat Al-Fitr):
  - Number of family members (stepper input)

Step 3 — Results:
  - Nisab value in € (with gold price source)
  - Total zakatable wealth
  - Zakat amount (large, gold color)
  - Breakdown of assets
  - If below nisab: clear message "Zakat not obligatory"
  - 8 categories of Zakat recipients (Quran 9:60)
  - Disclaimer: "This calculator is indicative. Consult a scholar for your personal situation."

**`src/pages/Settings.jsx`**

- Language toggle: Français / English
- Prayer calculation method display (Muslim World League — not changeable for now)
- Quran reciter selection: Al-Afasy | Abdul Basit | Al-Husary
- Quran translation: Hamidullah (FR) | Khattab (EN)
- Hijri date offset: ±1 day adjustment (moon sighting variation)
- Reset location (clears cache)
- About section: sources used, disclaimer, ECFR link

---

### STEP 6 — localStorage schema

Use these exact keys throughout the app:

```javascript
const STORAGE = {
  lang:           'noor_lang',          // 'fr' | 'en'
  location:       'noor_location',      // { lat, lng, city, country, source, timestamp }
  prayerSource:   'noor_prayer_src',    // 'mawaqit' | 'aladhan' | 'adhan'
  reciter:        'noor_reciter',       // 'ar.alafasy' | 'ar.abdulsamad' | 'ar.husary'
  translation:    'noor_translation',   // 'fr' | 'en'
  notifEnabled:   'noor_notif',         // 'true' | 'false'
  notifTime:      'noor_notif_time',    // 'HH:MM'
  bookmark:       'noor_bookmark',      // JSON: { surah, verse }
  streakLast:     'noor_streak_last',   // ISO date string
  streakCount:    'noor_streak_count',  // integer
  hijriOffset:    'noor_hijri_offset',  // -1 | 0 | 1
  // hifz per verse: 'noor_hifz_{surah}_{verse}' = 'true'
}
```

---

## CRITICAL RULES — NEVER BREAK THESE

1. **Quran text**: Arabic text comes ONLY from `api.quran.com` with `text_uthmani` field.
   Never hardcode a single Arabic Quran character in the source code.

2. **Prayer times**: Always show the data source in the UI. 
   If all APIs fail, show an error — never show invented times.

3. **Hadiths**: Only use hadiths from HADITH_POOL which have verified source + number + isnad.
   Claude AI in the assistant must flag uncertainty rather than invent references.

4. **Errors**: Every API call must have try/catch. 
   Failures show ErrorMessage component with retry button. No silent failures.

5. **Arabic display**: Every Arabic string must use `.ar` CSS class (Amiri font, RTL, min 22px).
   Never clip Arabic text with overflow:hidden without testing full text display.

6. **Assistant scope**: The system prompt is immutable. The assistant refuses all non-Islamic questions.
   Do not soften this rule.

7. **Transparency**: Show calculation method, data source, and solidity for every religious data point.

---

## ENVIRONMENT

```env
VITE_ANTHROPIC_API_KEY=your_key_here
```

---

بسم الله الرحمن الرحيم
This application serves the Ummah. Every line of code carries that responsibility.
