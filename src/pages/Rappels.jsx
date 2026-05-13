import { useState, useEffect, useContext } from 'react'
import { LangContext, useLang } from '../i18n/translations'
import { HADITH_POOL, getHadithOfDay } from '../services/hadithService'
import { getHijriDate } from '../services/hijriService'
import { THEME_META } from '../data/calendarThemes'
import { getNotifEnabled, setNotifEnabled, getNotifTime, setNotifTime } from '../utils/storage'
import SoliditeBadge from '../components/SoliditeBadge'

const ALL_THEMES = [...new Set(HADITH_POOL.map(h => h.theme))]

function ThemeBadge({ theme, lang }) {
  const meta = THEME_META[theme]
  if (!meta) return null
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, border: `1px solid ${meta.color}40`, background: `${meta.color}12`, color: meta.color, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>
      {lang === 'fr' ? meta.fr : meta.en}
    </span>
  )
}

function HadithCard({ hadith, lang, expanded }) {
  if (!hadith) return null
  return (
    <div className="card">
      <p className="ar" style={{ fontSize: 22, color: 'var(--w)', marginBottom: 16 }}>{hadith.arabic}</p>
      <p style={{ fontSize: 14, color: 'var(--w60)', lineHeight: 1.7, marginBottom: 14 }}>
        {lang === 'fr' ? hadith.fr : hadith.en}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: expanded ? 14 : 0 }}>
        <SoliditeBadge value={hadith.solidity}/>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--w30)' }}>{hadith.source} #{hadith.number}</span>
        <ThemeBadge theme={hadith.theme} lang={lang}/>
      </div>
      {expanded && (
        <>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>ISNAD</div>
            <div style={{ fontSize: 11, color: 'var(--w30)', lineHeight: 1.7, direction: 'ltr' }}>{hadith.isnad}</div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{lang === 'fr' ? 'RÉFLEXION' : 'REFLECTION'}</div>
            <div style={{ fontSize: 13, color: 'var(--em)', lineHeight: 1.7 }}>
              {lang === 'fr' ? hadith.reflection_fr : hadith.reflection_en}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function Rappels() {
  const lang = useContext(LangContext)
  const t    = useLang()

  const [hijriDate,     setHijriDate]     = useState(null)
  const [todayHadith,   setTodayHadith]   = useState(null)
  const [notifEnabled,  setNotifState]   = useState(getNotifEnabled)
  const [notifTime,     setNotifTimeState] = useState(getNotifTime)
  const [themeFilter,   setThemeFilter]   = useState(null)
  const [archiveOpen,   setArchiveOpen]   = useState(false)

  useEffect(() => {
    getHijriDate().then(h => {
      setHijriDate(h)
      setTodayHadith(getHadithOfDay(h))
    })
  }, [])

  function toggleNotif() {
    const next = !notifEnabled
    setNotifEnabled(next)
    setNotifState(next)
  }

  function handleNotifTime(v) {
    setNotifTime(v)
    setNotifTimeState(v)
  }

  // Build last 30 days of hadiths
  const archive = Array.from({ length: 30 }, (_, i) => {
    const daysSinceEpoch = Math.floor(Date.now() / 86400000) - i
    const pool = HADITH_POOL
    return { ...pool[daysSinceEpoch % pool.length], daysAgo: i }
  })

  const filtered = themeFilter ? archive.filter(h => h.theme === themeFilter) : archive

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--w)', marginBottom: 2 }}>{t('reminders')}</div>
      </div>

      {/* Today's hadith */}
      <span className="slabel">{t('hadith_of_day')}</span>
      <div style={{ margin: '0 16px' }}>
        <HadithCard hadith={todayHadith} lang={lang} expanded/>
      </div>

      {/* Notification settings */}
      <span className="slabel">{lang === 'fr' ? 'Rappel quotidien' : 'Daily reminder'}</span>
      <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: notifEnabled ? 14 : 0 }}>
          <span style={{ fontSize: 14, color: 'var(--w60)' }}>{lang === 'fr' ? 'Notifications' : 'Notifications'}</span>
          <button onClick={toggleNotif}
            style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: notifEnabled ? 'var(--gold)' : 'var(--raised)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
            <span style={{ position: 'absolute', top: 3, left: notifEnabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: notifEnabled ? 'var(--ink)' : 'var(--w30)', transition: 'left .2s' }}/>
          </button>
        </div>
        {notifEnabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--w30)' }}>{lang === 'fr' ? 'Heure' : 'Time'}</span>
            <input type="time" value={notifTime} onChange={e => handleNotifTime(e.target.value)}
              style={{ background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--w)', fontFamily: 'var(--font-mono)', fontSize: 14, padding: '6px 10px', outline: 'none' }}/>
          </div>
        )}
      </div>

      {/* Archive */}
      <span className="slabel">{lang === 'fr' ? 'Archive — 30 derniers jours' : 'Archive — last 30 days'}</span>

      {/* Theme filter */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        <button onClick={() => setThemeFilter(null)}
          style={{ flexShrink: 0, padding: '4px 12px', borderRadius: 20, border: '1px solid', borderColor: !themeFilter ? 'var(--gold)' : 'var(--border)', background: !themeFilter ? 'var(--gold-a12)' : 'transparent', color: !themeFilter ? 'var(--gold)' : 'var(--w30)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer' }}>
          {lang === 'fr' ? 'Tous' : 'All'}
        </button>
        {ALL_THEMES.map(theme => {
          const meta = THEME_META[theme]
          if (!meta) return null
          return (
            <button key={theme} onClick={() => setThemeFilter(themeFilter === theme ? null : theme)}
              style={{ flexShrink: 0, padding: '4px 12px', borderRadius: 20, border: `1px solid`, borderColor: themeFilter === theme ? meta.color : 'var(--border)', background: themeFilter === theme ? `${meta.color}15` : 'transparent', color: themeFilter === theme ? meta.color : 'var(--w30)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer' }}>
              {lang === 'fr' ? meta.fr : meta.en}
            </button>
          )
        })}
      </div>

      <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.slice(0, archiveOpen ? filtered.length : 5).map((h, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <SoliditeBadge value={h.solidity}/>
                <ThemeBadge theme={h.theme} lang={lang}/>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--w30)', flexShrink: 0, marginLeft: 6 }}>
                {h.daysAgo === 0 ? t('today') : `J-${h.daysAgo}`}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--w60)', lineHeight: 1.6, margin: 0 }}>
              {(lang === 'fr' ? h.fr : h.en).slice(0, 120)}{(lang === 'fr' ? h.fr : h.en).length > 120 ? '…' : ''}
            </p>
            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{h.source} #{h.number}</div>
          </div>
        ))}
        {filtered.length > 5 && (
          <button onClick={() => setArchiveOpen(o => !o)}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--w30)', padding: '10px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {archiveOpen ? (lang === 'fr' ? 'Voir moins' : 'Show less') : `${lang === 'fr' ? 'Voir les' : 'Show'} ${filtered.length - 5} ${lang === 'fr' ? 'autres' : 'more'}`}
          </button>
        )}
      </div>
    </div>
  )
}
