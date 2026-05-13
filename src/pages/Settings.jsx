import { useState, useContext } from 'react'
import { LangContext, useLang } from '../i18n/translations'
import {
  setLang as saveLang,
  getReciter, setReciter,
  getHijriOffset, setHijriOffset,
  getNotifEnabled, setNotifEnabled, getNotifTime, setNotifTime,
  getStreakCount,
  getTotalMemorizedVerses,
  getLocation, clearLocation,
  clearAllHifz, clearAllAppData,
} from '../utils/storage'

const RECITERS = [
  { id: 'ar.alafasy',    label: 'Mishary Al-Afasy'  },
  { id: 'ar.abdulsamad', label: 'Abdul Basit'        },
  { id: 'ar.husary',     label: 'Al-Husary'          },
]

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <span className="slabel">{label}</span>
      <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, sublabel, children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: last ? 'none' : '1px solid var(--border)', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, color: 'var(--w60)' }}>{label}</span>
        {sublabel && <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: checked ? 'var(--gold)' : 'var(--raised)', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: checked ? 'var(--ink)' : 'var(--w30)', transition: 'left .2s' }}/>
    </button>
  )
}

export default function Settings({ lang, setLang }) {
  const t = useLang()

  const [reciter,      setReciterState]   = useState(getReciter)
  const [offset,       setOffsetState]    = useState(getHijriOffset)
  const [notifEnabled, setNotifState]     = useState(getNotifEnabled)
  const [notifTime,    setNotifTimeState] = useState(getNotifTime)
  const [toast,        setToast]          = useState('')
  const [confirmReset, setConfirmReset]   = useState(false)

  const streak      = getStreakCount()
  const hifzVerses  = getTotalMemorizedVerses()
  const cachedLoc   = getLocation()

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleLang(l) {
    saveLang(l)
    setLang(l)
  }

  function handleReciter(id) {
    setReciter(id)
    setReciterState(id)
  }

  function handleOffset(delta) {
    const next = Math.max(-1, Math.min(1, offset + delta))
    setHijriOffset(next)
    setOffsetState(next)
  }

  function handleNotifToggle() {
    const next = !notifEnabled
    setNotifEnabled(next)
    setNotifState(next)
  }

  function handleNotifTime(v) {
    setNotifTime(v)
    setNotifTimeState(v)
  }

  function handleResetLocation() {
    clearLocation()
    showToast(lang === 'fr' ? 'Localisation effacée.' : 'Location cleared.')
  }

  function handleClearHifz() {
    clearAllHifz()
    showToast(lang === 'fr' ? 'Hifz réinitialisé.' : 'Hifz data cleared.')
  }

  function handleClearAll() {
    if (!confirmReset) { setConfirmReset(true); return }
    clearAllAppData()
    setLang('fr')
    setReciterState('ar.alafasy')
    setOffsetState(0)
    setNotifState(false)
    setNotifTimeState('07:00')
    setConfirmReset(false)
    showToast(lang === 'fr' ? 'Toutes les données effacées.' : 'All data cleared.')
  }

  const pill = (cur, id, label, fn) => (
    <button onClick={() => fn(id)}
      style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid',
               borderColor: cur === id ? 'var(--gold)' : 'var(--border)',
               background: cur === id ? 'var(--gold-a12)' : 'transparent',
               color: cur === id ? 'var(--gold)' : 'var(--w30)',
               fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer' }}>
      {label}
    </button>
  )

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--w)', marginBottom: 4 }}>
          {t('settings')}
        </div>
      </div>

      {/* Stats */}
      <div style={{ margin: '8px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--gold)', lineHeight: 1 }}>{streak}</div>
          <div style={{ fontSize: 11, color: 'var(--w30)', marginTop: 4 }}>{lang === 'fr' ? 'jours consécutifs' : 'day streak'}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--em)', lineHeight: 1 }}>{hifzVerses}</div>
          <div style={{ fontSize: 11, color: 'var(--w30)', marginTop: 4 }}>{lang === 'fr' ? 'versets mémorisés' : 'verses memorized'}</div>
        </div>
      </div>

      {/* Language */}
      <Section label={lang === 'fr' ? 'Langue' : 'Language'}>
        <Row label="Français / English" last>
          <div style={{ display: 'flex', gap: 4 }}>
            {pill(lang, 'fr', 'FR', handleLang)}
            {pill(lang, 'en', 'EN', handleLang)}
          </div>
        </Row>
      </Section>

      {/* Reciter */}
      <Section label={lang === 'fr' ? 'Lecture du Coran' : 'Quran Recitation'}>
        {RECITERS.map((r, i) => (
          <Row key={r.id} label={r.label} last={i === RECITERS.length - 1}>
            <button onClick={() => handleReciter(r.id)}
              style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                       borderColor: reciter === r.id ? 'var(--gold)' : 'var(--w15)',
                       background: reciter === r.id ? 'var(--gold)' : 'transparent',
                       cursor: 'pointer', flexShrink: 0 }}
            />
          </Row>
        ))}
      </Section>

      {/* Translation */}
      <Section label={lang === 'fr' ? 'Traduction Coran' : 'Quran Translation'}>
        <Row label={lang === 'fr' ? 'Français → Hamidullah' : 'English → Khattab'} last>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gold)', background: 'var(--gold-a06)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px' }}>AUTO</span>
        </Row>
      </Section>

      {/* Hijri offset */}
      <Section label={lang === 'fr' ? 'Date Hijri' : 'Hijri Date'}>
        <Row label={lang === 'fr' ? 'Décalage (± 1 jour)' : 'Offset (± 1 day)'} last>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => handleOffset(-1)}
              style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--w)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--gold)', minWidth: 20, textAlign: 'center' }}>
              {offset > 0 ? `+${offset}` : offset}
            </span>
            <button onClick={() => handleOffset(+1)}
              style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--w)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
        </Row>
      </Section>

      {/* Notifications */}
      <Section label={lang === 'fr' ? 'Rappel quotidien' : 'Daily reminder'}>
        <Row label={lang === 'fr' ? 'Notifications' : 'Notifications'} last={!notifEnabled}>
          <Toggle checked={notifEnabled} onClick={handleNotifToggle}/>
        </Row>
        {notifEnabled && (
          <Row label={lang === 'fr' ? 'Heure' : 'Time'} last>
            <input type="time" value={notifTime} onChange={e => handleNotifTime(e.target.value)}
              style={{ background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--w)', fontFamily: 'var(--font-mono)', fontSize: 14, padding: '6px 10px', outline: 'none' }}/>
          </Row>
        )}
      </Section>

      {/* Location */}
      <Section label={lang === 'fr' ? 'Localisation' : 'Location'}>
        <Row
          label={lang === 'fr' ? 'Réinitialiser la localisation' : 'Reset location'}
          sublabel={cachedLoc ? `${cachedLoc.city || ''}${cachedLoc.city ? ', ' : ''}${cachedLoc.country || ''}`.trim() || null : null}
          last>
          <button onClick={handleResetLocation}
            style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid rgba(220,50,50,.3)',
                     background: 'rgba(220,50,50,.08)', color: '#e05050',
                     fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer', flexShrink: 0 }}>
            {lang === 'fr' ? 'Effacer' : 'Clear'}
          </button>
        </Row>
      </Section>

      {/* Data management */}
      <Section label={lang === 'fr' ? 'Données' : 'Data'}>
        <Row label={lang === 'fr' ? 'Réinitialiser le Hifz' : 'Clear Hifz data'}
             sublabel={hifzVerses > 0 ? `${hifzVerses} ${lang === 'fr' ? 'versets' : 'verses'}` : null}>
          <button onClick={handleClearHifz}
            style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid rgba(220,50,50,.3)',
                     background: 'rgba(220,50,50,.08)', color: '#e05050',
                     fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer', flexShrink: 0 }}>
            {lang === 'fr' ? 'Effacer' : 'Clear'}
          </button>
        </Row>
        <Row label={lang === 'fr' ? 'Réinitialiser toutes les données' : 'Reset all app data'} last>
          <button onClick={handleClearAll}
            style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${confirmReset ? 'rgba(220,50,50,.6)' : 'rgba(220,50,50,.3)'}`,
                     background: confirmReset ? 'rgba(220,50,50,.18)' : 'rgba(220,50,50,.08)', color: '#e05050',
                     fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer', flexShrink: 0,
                     fontWeight: confirmReset ? 700 : 400 }}>
            {confirmReset ? (lang === 'fr' ? 'Confirmer ?' : 'Confirm?') : (lang === 'fr' ? 'Tout effacer' : 'Reset all')}
          </button>
        </Row>
      </Section>

      {/* About */}
      <Section label={lang === 'fr' ? 'À propos' : 'About'}>
        <Row label={lang === 'fr' ? 'Horaires de prière' : 'Prayer times'}>
          <span style={{ fontSize: 11, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>Mawaqit · Aladhan · Adhan.js</span>
        </Row>
        <Row label={lang === 'fr' ? 'Texte coranique' : 'Quranic text'}>
          <span style={{ fontSize: 11, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>api.quran.com</span>
        </Row>
        <Row label={lang === 'fr' ? 'Hadiths vérifiés' : 'Verified hadiths'}>
          <span style={{ fontSize: 11, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>sunnah.com isnad</span>
        </Row>
        <Row label="ECFR" last>
          <span style={{ fontSize: 11, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>ecfr.eu</span>
        </Row>
      </Section>

      <div style={{ margin: '16px 16px 0', padding: '14px 18px', background: 'var(--gold-a06)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--w30)', lineHeight: 1.7 }}>
        {t('disclaimer')}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 20px', fontSize: 13, color: 'var(--w)', zIndex: 100, whiteSpace: 'nowrap', boxShadow: '0 4px 24px rgba(0,0,0,.4)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
