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

export const WHITE_DAYS = {
  days: [13, 14, 15], type: 'recommended',
  fr: "Jours Blancs", en: "White Days", ar: "أيام البيض",
  fr_desc: "Jeûne recommandé les 13, 14 et 15 de chaque mois lunaire.",
  en_desc: "Recommended fasting on the 13th, 14th and 15th of each lunar month.",
}

export function getUpcomingEvents(hijriDate, daysAhead = 60) {
  if (!hijriDate) return []
  return ISLAMIC_EVENTS
    .map(ev => {
      let monthDiff = ev.hijriMonth - hijriDate.month
      let dayDiff   = ev.hijriDay   - hijriDate.day
      let totalDays = monthDiff * 30 + dayDiff
      if (totalDays < 0) totalDays += 354
      return { ...ev, daysUntil: totalDays }
    })
    .filter(ev => ev.daysUntil <= daysAhead)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}
