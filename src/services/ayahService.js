// Themes by proximity to Islamic events
const CALENDAR_THEMES = [
  { event: 'ramadan',  daysBeforeStart: 21, theme: 'fasting'      },
  { event: 'ramadan',  duringEvent: true,   theme: 'ramadan'      },
  { event: 'eid_fitr', daysBeforeStart: 7,  theme: 'gratitude'    },
  { event: 'eid_adha', daysBeforeStart: 14, theme: 'sacrifice'    },
  { event: 'arafat',   daysBeforeStart: 3,  theme: 'hajj'         },
  { event: 'achoura',  daysBeforeStart: 7,  theme: 'history'      },
  { event: 'mawlid',   daysBeforeStart: 7,  theme: 'prophet'      },
  { event: 'miraj',    daysBeforeStart: 3,  theme: 'spirituality' },
]

// General themes for regular days
const GENERAL_THEMES = [
  'patience', 'gratitude', 'family', 'honesty', 'prayer',
  'generosity', 'dhikr', 'tawakkul', 'knowledge', 'mercy'
]

// Curated verse keys per theme — all fetched live from api.quran.com
const VERSES_BY_THEME = {
  ramadan:     ['2:185', '97:1', '2:183', '44:3', '97:3'],
  fasting:     ['2:183', '2:184', '2:185', '2:187'],
  gratitude:   ['14:7', '31:12', '2:152', '39:66'],
  sacrifice:   ['22:37', '37:107', '108:2'],
  hajj:        ['3:97', '22:27', '2:196'],
  history:     ['14:6', '2:50', '7:141'],
  prophet:     ['33:21', '68:4', '21:107', '3:31'],
  spirituality:['17:79', '73:2', '17:1'],
  patience:    ['2:155', '2:177', '39:10', '3:200'],
  family:      ['4:1', '17:23', '31:14', '46:15'],
  honesty:     ['9:119', '33:70', '5:8'],
  prayer:      ['2:45', '2:238', '20:132', '29:45'],
  generosity:  ['2:261', '2:177', '3:92', '59:9'],
  dhikr:       ['13:28', '33:41', '2:152'],
  tawakkul:    ['65:3', '3:159', '33:3'],
  knowledge:   ['96:1', '20:114', '58:11'],
  mercy:       ['7:156', '21:107', '6:54'],
}

export function getThemeForDate(hijriDate) {
  if (!hijriDate) return 'patience'
  const { month, day } = hijriDate

  // Ramadan (month 9)
  if (month === 9) return 'ramadan'
  if (month === 8 && day >= 10) return 'fasting'       // 20 days before Ramadan
  // Eid Al-Fitr
  if (month === 10 && day <= 3) return 'gratitude'
  // Eid Al-Adha + Arafat
  if (month === 12 && day === 9) return 'hajj'
  if (month === 12 && day >= 10 && day <= 13) return 'sacrifice'
  if (month === 11 && day >= 20) return 'sacrifice'    // pre-Adha
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
  const theme       = getThemeForDate(hijriDate)
  const pool        = VERSES_BY_THEME[theme] || VERSES_BY_THEME.patience
  const daysSinceEpoch = Math.floor(Date.now() / 86400000)
  const verseKey    = pool[daysSinceEpoch % pool.length]

  const { getSingleVerse } = await import('./quranService')
  const verse = await getSingleVerse(verseKey, lang)
  return { ...verse, theme, key: verseKey }
}
