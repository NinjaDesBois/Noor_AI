import { useState, useEffect, useContext } from 'react'
import { LangContext, useLang } from '../i18n/translations'
import { getUserLocation, getCoordsFromCity } from '../services/locationService'
import { getPrayerTimes, getQiblaAngle, getDistanceToMecca } from '../services/prayerService'
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPT, Madhab } from 'adhan'
import ErrorMessage from '../components/ErrorMessage'

const PRAYER_KEYS    = ['fajr', 'shuruk', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_ARABIC  = { fajr:'الفجر', shuruk:'الشروق', dhuhr:'الظهر', asr:'العصر', maghrib:'المغرب', isha:'العشاء' }

function getCurrentPrayerPeriod(prayers) {
  if (!prayers) return null
  const now     = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const keys    = ['fajr','shuruk','dhuhr','asr','maghrib','isha']
  let last = 'isha'
  for (const key of keys) {
    const [h, m] = prayers[key].split(':').map(Number)
    if (nowMins < h * 60 + m) break
    last = key
  }
  return last
}

function computeWeeklyTimes(lat, lng) {
  const coords  = new Coordinates(lat, lng)
  const params  = CalculationMethod.MuslimWorldLeague()
  params.madhab = Madhab.Hanafi
  const fmt     = d => d.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit', hour12: false })
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const pt = new AdhanPT(coords, date, params)
    return { date, fajr: fmt(pt.fajr), dhuhr: fmt(pt.dhuhr), asr: fmt(pt.asr), maghrib: fmt(pt.maghrib), isha: fmt(pt.isha) }
  })
}

function QiblaCompass({ angle }) {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const theta = (i * 10 - 90) * Math.PI / 180
    const r1    = i % 9 === 0 ? 80 : 86
    return { x1: 100 + 92 * Math.cos(theta), y1: 100 + 92 * Math.sin(theta), x2: 100 + r1 * Math.cos(theta), y2: 100 + r1 * Math.sin(theta) }
  })
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" style={{ display: 'block', margin: '0 auto' }}>
      <circle cx="100" cy="100" r="92" fill="none" stroke="var(--border)" strokeWidth="1.5"/>
      <circle cx="100" cy="100" r="68" fill="none" stroke="var(--border)" strokeWidth="0.5"/>
      {ticks.map((tk, i) => (
        <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2} stroke="var(--w15)" strokeWidth={i % 9 === 0 ? 1.5 : 0.8}/>
      ))}
      <text x="100" y="16" textAnchor="middle" fill="var(--w30)" fontSize="11" fontFamily="var(--font-mono)">N</text>
      <text x="100" y="192" textAnchor="middle" fill="var(--w30)" fontSize="11" fontFamily="var(--font-mono)">S</text>
      <text x="193" y="104" textAnchor="middle" fill="var(--w30)" fontSize="11" fontFamily="var(--font-mono)">E</text>
      <text x="7"   y="104" textAnchor="middle" fill="var(--w30)" fontSize="11" fontFamily="var(--font-mono)">O</text>
      {/* Rotating needle */}
      <g transform={`rotate(${angle}, 100, 100)`}>
        <polygon points="100,24 96,100 104,100"  fill="var(--gold)" opacity="0.9"/>
        <polygon points="100,176 96,100 104,100" fill="var(--w15)"/>
        <circle cx="100" cy="100" r="5" fill="var(--gold)" stroke="var(--ink)" strokeWidth="1.5"/>
      </g>
      <text x="100" y="103" textAnchor="middle" fontSize="9" fill="var(--ink)" fontFamily="var(--font-mono)" style={{ userSelect: 'none' }}>●</text>
    </svg>
  )
}

const WEEK_DAY_FR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const WEEK_DAY_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function PrayerTimes() {
  const lang = useContext(LangContext)
  const t    = useLang()

  const [location,    setLocation]    = useState(null)
  const [cityInput,   setCityInput]   = useState('')
  const [prayers,     setPrayers]     = useState(null)
  const [weeklyTimes, setWeeklyTimes] = useState([])
  const [qibla,       setQibla]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [cityLoading, setCityLoading] = useState(false)
  const [error,       setError]       = useState(null)
  const [cityError,   setCityError]   = useState(null)
  const [editCity,    setEditCity]    = useState(false)

  const currentPeriod = getCurrentPrayerPeriod(prayers)

  async function loadPrayers(loc) {
    setLoading(true); setError(null)
    try {
      const pt = await getPrayerTimes(loc.lat, loc.lng)
      setPrayers(pt)
      setWeeklyTimes(computeWeeklyTimes(loc.lat, loc.lng))
      setQibla({
        angle:    getQiblaAngle(loc.lat, loc.lng),
        distance: getDistanceToMecca(loc.lat, loc.lng),
      })
    } catch {
      setError(t('error_prayer'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUserLocation().then(loc => {
      if (loc) { setLocation(loc); loadPrayers(loc) }
      else     { setLoading(false) }
    })
  }, [])

  async function handleCitySubmit(e) {
    e.preventDefault()
    if (!cityInput.trim()) return
    setCityLoading(true); setCityError(null)
    try {
      const loc = await getCoordsFromCity(cityInput.trim())
      loc.city  = cityInput.trim()
      setLocation(loc); setEditCity(false); setCityInput('')
      await loadPrayers(loc)
    } catch {
      setCityError(lang === 'fr' ? 'Ville introuvable' : 'City not found')
    } finally {
      setCityLoading(false)
    }
  }

  const sourceLabel = prayers
    ? prayers.source === 'mawaqit'    ? `Mawaqit${prayers.mosqueName ? ` · ${prayers.mosqueName}` : ''}`
    : prayers.source === 'aladhan'    ? 'Aladhan API (Muslim World League)'
    : 'Adhan.js (local · MWL)'
    : ''

  const weekDays = lang === 'fr' ? WEEK_DAY_FR : WEEK_DAY_EN

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--w)', marginBottom: 4 }}>{t('prayers')}</div>
      </div>

      {/* Location */}
      {(!location || editCity) ? (
        <div style={{ margin: '0 16px 16px' }}>
          <form onSubmit={handleCitySubmit} style={{ display: 'flex', gap: 8 }}>
            <input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder={t('enter_city')}
              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--w)', fontSize: 14, padding: '11px 14px', outline: 'none', fontFamily: 'var(--font-body)' }}/>
            <button type="submit" disabled={cityLoading}
              style={{ padding: '11px 18px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--r-md)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {cityLoading ? '…' : 'OK'}
            </button>
          </form>
          {cityError && <div style={{ fontSize: 12, color: '#e05050', marginTop: 6 }}>{cityError}</div>}
          {editCity && location && (
            <button onClick={() => setEditCity(false)}
              style={{ marginTop: 8, background: 'transparent', border: 'none', color: 'var(--w30)', fontSize: 13, cursor: 'pointer' }}>
              ← {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ margin: '0 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, color: 'var(--w)', fontWeight: 500 }}>{location.city}{location.country ? `, ${location.country}` : ''}</div>
            <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{location.source === 'gps' ? 'GPS' : location.source === 'ip' ? 'IP' : 'Manuel'}</div>
          </div>
          <button onClick={() => setEditCity(true)}
            style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 20, color: 'var(--w30)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            {lang === 'fr' ? 'Changer' : 'Change'}
          </button>
        </div>
      )}

      {/* Source badge */}
      {prayers && (
        <div style={{ margin: '0 16px 14px' }}>
          <span className="badge-gold">
            <svg width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="var(--gold)"/></svg>
            {t('prayer_source')}: {sourceLabel}
          </span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={() => location && loadPrayers(location)}/>}

      {loading ? (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({length: 6}).map((_, i) => <div key={i} style={{ height: 68, background: 'var(--raised)', borderRadius: 'var(--r-md)' }}/>)}
        </div>
      ) : prayers ? (
        <>
          {/* Prayer cards */}
          <span className="slabel">{lang === 'fr' ? 'Aujourd\'hui' : 'Today'}</span>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRAYER_KEYS.map(key => {
              const isActive = currentPeriod === key
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: isActive ? 'var(--gold-a06)' : 'var(--surface)', border: `1px solid ${isActive ? 'var(--border2)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', gap: 12 }}>
                  {isActive && <div style={{ width: 3, height: 32, background: 'var(--gold)', borderRadius: 2, flexShrink: 0 }}/>}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 15, color: isActive ? 'var(--gold)' : 'var(--w)', fontWeight: isActive ? 600 : 400 }}>
                        {t(`prayer_${key}`)}
                      </span>
                      <span className="ar" style={{ fontSize: 14, color: isActive ? 'var(--gold)' : 'var(--w30)', lineHeight: 1 }}>
                        {PRAYER_ARABIC[key]}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: isActive ? 'var(--gold)' : 'var(--w60)' }}>
                    {prayers[key]}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Weekly table */}
          {weeklyTimes.length > 0 && (
            <>
              <span className="slabel">{lang === 'fr' ? 'Cette semaine' : 'This week'}</span>
              <div style={{ margin: '0 16px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 6px', color: 'var(--w30)', fontWeight: 400, textAlign: 'left' }}>{lang === 'fr' ? 'J' : 'D'}</th>
                      {['fajr','dhuhr','asr','maghrib','isha'].map(k => (
                        <th key={k} style={{ padding: '8px 4px', color: 'var(--w30)', fontWeight: 400, textAlign: 'center' }}>{t(`prayer_${k}`).slice(0,3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyTimes.map((day, i) => {
                      const isToday = i === 0
                      return (
                        <tr key={i} style={{ background: isToday ? 'var(--gold-a06)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 6px', color: isToday ? 'var(--gold)' : 'var(--w30)' }}>
                            {weekDays[day.date.getDay()]}
                          </td>
                          {['fajr','dhuhr','asr','maghrib','isha'].map(k => (
                            <td key={k} style={{ padding: '8px 4px', textAlign: 'center', color: isToday ? 'var(--w)' : 'var(--w60)' }}>{day[k]}</td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Qibla */}
          {qibla && (
            <>
              <span className="slabel">{t('qibla_direction')}</span>
              <div style={{ margin: '0 16px' }} className="card">
                <QiblaCompass angle={qibla.angle}/>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--gold)' }}>{Math.round(qibla.angle)}°</div>
                    <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{lang === 'fr' ? 'depuis le Nord' : 'from North'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--gold)' }}>{qibla.distance.toLocaleString()} km</div>
                    <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{t('distance_mecca')}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : !loading && !location && (
        <div style={{ margin: '40px 16px', textAlign: 'center', color: 'var(--w30)', fontSize: 14 }}>
          {t('location_unknown')}
        </div>
      )}
    </div>
  )
}
