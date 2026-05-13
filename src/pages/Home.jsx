import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LangContext, useLang } from '../i18n/translations'
import { getUserLocation } from '../services/locationService'
import { getPrayerTimes, getNextPrayer } from '../services/prayerService'
import { getHijriDate } from '../services/hijriService'
import { getVerseOfDay } from '../services/ayahService'
import { getHadithOfDay } from '../services/hadithService'
import { getUpcomingEvents } from '../data/islamicEvents'
import { getHijriOffset, updateStreak, getStreakCount, getTotalMemorizedVerses } from '../utils/storage'
import SoliditeBadge from '../components/SoliditeBadge'
import ErrorMessage from '../components/ErrorMessage'

function Skel({ h = 16, w = '100%', r = 8, mb = 0 }) {
  return (
    <div style={{ height: h, width: w, background: 'var(--border)', borderRadius: r, marginBottom: mb,
                  animation: 'skelPulse 1.4s ease-in-out infinite' }}/>
  )
}

const PRAYER_KEYS = ['fajr', 'shuruk', 'dhuhr', 'asr', 'maghrib', 'isha']

const MONTH_FR = ['janv','févr','mars','avr','mai','juin','juil','août','sept','oct','nov','déc']
const MONTH_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const MODULES = [
  {
    to: '/coran',      iconClass: 'mod-icon-gold',
    nameFr: 'Coran',      nameEn: 'Quran',
    subFr:  '114 sourates', subEn: '114 surahs',
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    to: '/prayers',    iconClass: 'mod-icon-em',
    nameFr: 'Prières',    nameEn: 'Prayers',
    subFr:  'Horaires',   subEn: 'Times',
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--em)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    to: '/assistant',  iconClass: 'mod-icon-gold',
    nameFr: 'Assistant',  nameEn: 'Assistant',
    subFr:  'Noor AI',    subEn: 'Noor AI',
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    to: '/calendrier', iconClass: 'mod-icon-neu',
    nameFr: 'Calendrier', nameEn: 'Calendar',
    subFr:  'Événements', subEn: 'Events',
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    to: '/rappels',    iconClass: 'mod-icon-neu',
    nameFr: 'Rappels',    nameEn: 'Reminders',
    subFr:  'Hadiths',    subEn: 'Hadiths',
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    to: '/zakat',      iconClass: 'mod-icon-em',
    nameFr: 'Zakat',       nameEn: 'Zakat',
    subFr:  'Calculateur', subEn: 'Calculator',
    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--em)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
]

const EV_TAG = {
  obligatory:   { fr: 'Obligatoire', en: 'Obligatory',  cls: 'ev-tag-obl'  },
  recommended:  { fr: 'Recommandé',  en: 'Recommended', cls: 'ev-tag-rec'  },
  commemorative:{ fr: 'Comm.',       en: 'Comm.',        cls: 'ev-tag-comm' },
}

export default function Home() {
  const lang     = useContext(LangContext)
  const t        = useLang()
  const navigate = useNavigate()

  const [location,  setLocation]  = useState(null)
  const [prayers,   setPrayers]   = useState(null)
  const [hijri,     setHijri]     = useState(null)
  const [verse,     setVerse]     = useState(null)
  const [hadith,    setHadith]    = useState(null)
  const [events,    setEvents]    = useState([])
  const [tick,      setTick]      = useState(0)

  const [loadPray,  setLoadPray]  = useState(true)
  const [loadVerse, setLoadVerse] = useState(true)
  const [errPray,   setErrPray]   = useState(null)
  const [errVerse,  setErrVerse]  = useState(null)

  useEffect(() => {
    updateStreak()
    const id = setInterval(() => setTick(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    getUserLocation().then(async loc => {
      setLocation(loc)
      if (!loc) { setLoadPray(false); return }
      try {
        const pt = await getPrayerTimes(loc.lat, loc.lng)
        setPrayers(pt)
      } catch {
        setErrPray(t('error_prayer'))
      } finally {
        setLoadPray(false)
      }
    })
  }, [])

  useEffect(() => {
    getHijriDate().then(async h => {
      const offset   = getHijriOffset()
      const adjusted = { ...h, day: h.day + offset }
      setHijri(adjusted)
      setHadith(getHadithOfDay(adjusted))
      setEvents(getUpcomingEvents(adjusted, 60).slice(0, 3))
      try {
        const v = await getVerseOfDay(adjusted, lang)
        setVerse(v)
      } catch {
        setErrVerse(t('error_quran'))
      } finally {
        setLoadVerse(false)
      }
    }).catch(() => setLoadVerse(false))
  }, [lang])

  const nextPrayer  = prayers ? getNextPrayer(prayers) : null
  const monthNames  = lang === 'fr' ? MONTH_FR : MONTH_EN
  const streak      = getStreakCount()
  const hifzVerses  = getTotalMemorizedVerses()
  const hifzPct     = Math.min(100, Math.round((hifzVerses / 6236) * 100))
  const streakPct   = Math.min(100, Math.round((streak / 30) * 100))

  return (
    <>
      <style>{`@keyframes skelPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>

      {/* Top bar */}
      <div className="page-topbar">
        <div>
          <div className="page-greeting">Assalamu alaykum</div>
          <div className="page-title">{t('home')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hijri && (
            <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>
              {hijri.day} {hijri.monthEn} {hijri.year}
            </span>
          )}
          {location?.city && (
            <div className="city-pill" onClick={() => navigate('/prayers')}>
              <div className="city-dot"/>
              {location.city}
            </div>
          )}
        </div>
      </div>

      {/* 2-column grid */}
      <div className="home-grid">

        {/* ── LEFT COLUMN ── */}
        <div className="home-col-left">

          {/* Prayer hero */}
          {loadPray ? (
            <div style={{ height: 220, background: 'var(--border)', borderRadius: 'var(--r-xl)',
                          animation: 'skelPulse 1.4s ease-in-out infinite' }}/>
          ) : errPray ? (
            <ErrorMessage message={errPray} onRetry={() => window.location.reload()}/>
          ) : nextPrayer && prayers ? (
            <div className="prayer-hero">
              <div className="ph-top">
                <div>
                  <div className="ph-label">{t('next_prayer')}</div>
                  <div className="ph-name">{t(`prayer_${nextPrayer.name}`)}</div>
                  <div className="ph-countdown">
                    <div className="ph-live-dot"/>
                    {t('in')} {nextPrayer.hoursUntil}h {String(nextPrayer.minsUntil).padStart(2, '0')}min
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ph-time">{nextPrayer.time}</div>
                  <div className="ph-source">
                    {prayers.source}{prayers.city ? ` · ${prayers.city}` : ''}
                  </div>
                </div>
              </div>
              <div className="ph-timeline">
                {PRAYER_KEYS.map(key => (
                  <div key={key} className={`ph-t${key === nextPrayer.name ? ' now' : ''}`}>
                    <span className="ph-t-label">{t(`prayer_${key}`).slice(0, 3).toUpperCase()}</span>
                    <span className="ph-t-val">{prayers[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '28px 22px' }}>
              <button onClick={() => navigate('/prayers')}
                style={{ color: 'var(--gold)', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {t('location_unknown')}
              </button>
            </div>
          )}

          {/* Verse of the day */}
          <div className="card">
            <div className="section-head">
              <span className="section-label">{t('verse_of_day')}</span>
              {verse && (
                <Link to={`/tafsir/${verse.key}`} className="section-action">
                  {t('tafsir')} →
                </Link>
              )}
            </div>
            {loadVerse ? (
              <>
                <Skel h={28} mb={10} r={6}/>
                <Skel h={14} mb={6}/>
                <Skel h={14} w="72%"/>
              </>
            ) : errVerse ? (
              <ErrorMessage message={errVerse}/>
            ) : verse ? (
              <>
                <div className="verse-arabic ar">{verse.arabic}</div>
                <div className="verse-divider"/>
                <div className="verse-trans">« {verse.translation} »</div>
                <div className="verse-footer">
                  <span className="verse-ref">{verse.key}</span>
                  <div className="verse-actions">
                    <button className="icon-btn" title="api.quran.com · text_uthmani">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="7" cy="7" r="6"/>
                        <line x1="7" y1="4" x2="7" y2="7"/>
                        <circle cx="7" cy="9.5" r=".6" fill="var(--text-3)" stroke="none"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Hadith of the day */}
          <div className="card">
            <div className="section-head">
              <span className="section-label">{t('hadith_of_day')}</span>
              <Link to="/rappels" className="section-action">
                {lang === 'fr' ? 'Archive →' : 'Archive →'}
              </Link>
            </div>
            {hadith ? (
              <div className="hadith-inner">
                <div className="hadith-bar"/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="hadith-arabic ar">{hadith.arabic}</div>
                  <div className="hadith-trans">« {lang === 'fr' ? hadith.fr : hadith.en} »</div>
                  <div className="hadith-meta">
                    <SoliditeBadge value={hadith.solidity}/>
                    <span className="hadith-src">{hadith.source} · n°{hadith.number}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Skel h={22} mb={12} r={6}/>
                <Skel h={14} mb={6}/>
                <Skel h={14} w="80%"/>
              </>
            )}
          </div>

          {/* Modules */}
          <div className="card">
            <div className="section-head">
              <span className="section-label">{t('modules')}</span>
            </div>
            <div className="mod-grid">
              {MODULES.map(m => (
                <Link key={m.to} to={m.to} className="mod-item">
                  <div className={`mod-icon ${m.iconClass}`}>{m.svg}</div>
                  <div>
                    <div className="mod-name">{lang === 'fr' ? m.nameFr : m.nameEn}</div>
                    <div className="mod-sub">{lang === 'fr' ? m.subFr : m.subEn}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="home-col-right">

          {/* Hifz + Streak stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Hifz</div>
              <div className="stat-val">{hifzVerses} <span>{lang === 'fr' ? 'versets' : 'verses'}</span></div>
              <div className="stat-sub">{lang === 'fr' ? 'mémorisés' : 'memorized'}</div>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: hifzPct + '%' }}/>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Streak</div>
              <div className="stat-val">{streak} <span>{lang === 'fr' ? 'jours' : 'days'}</span></div>
              <div className="stat-sub">{lang === 'fr' ? 'consécutifs' : 'consecutive'}</div>
              <div className="stat-bar">
                <div className="stat-fill-em" style={{ width: streakPct + '%' }}/>
              </div>
            </div>
          </div>

          {/* Upcoming events */}
          {events.length > 0 && (
            <div className="card">
              <div className="section-head">
                <span className="section-label">{t('upcoming_events')}</span>
                <Link to="/calendrier" className="section-action">
                  {lang === 'fr' ? 'Voir tout →' : 'See all →'}
                </Link>
              </div>
              {events.map(ev => {
                const approxDate = new Date()
                approxDate.setDate(approxDate.getDate() + ev.daysUntil)
                const tag = EV_TAG[ev.type] || EV_TAG.commemorative
                return (
                  <div key={ev.id} className="ev-item">
                    <div className="ev-date">
                      {ev.daysUntil === 0 ? (
                        <div className="ev-day" style={{ fontSize: 11, color: 'var(--em)' }}>{t('today')}</div>
                      ) : (
                        <>
                          <div className="ev-day">{approxDate.getDate()}</div>
                          <div className="ev-mon">{monthNames[approxDate.getMonth()]}</div>
                        </>
                      )}
                    </div>
                    <div className="ev-sep"/>
                    <div className="ev-info">
                      <div className="ev-name">{lang === 'fr' ? ev.fr : ev.en}</div>
                      <div className="ev-ar">{ev.ar}</div>
                    </div>
                    <span className={`ev-tag ${tag.cls}`}>
                      {lang === 'fr' ? tag.fr : tag.en}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
