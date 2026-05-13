import { useState, useEffect, useContext } from 'react'
import { LangContext, useLang } from '../i18n/translations'
import { getHijriDate } from '../services/hijriService'
import { ISLAMIC_EVENTS, WHITE_DAYS, getUpcomingEvents } from '../data/islamicEvents'
import { EVENT_TYPE_META } from '../data/calendarThemes'
import ErrorMessage from '../components/ErrorMessage'

const MONTH_NAMES_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam']
const DAY_NAMES_EN   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function TypeBadge({ type, lang }) {
  const meta = EVENT_TYPE_META[type]
  if (!meta) return null
  return (
    <span style={{ padding: '2px 9px', borderRadius: 20, border: `1px solid ${meta.color}35`, background: `${meta.color}10`, color: meta.color, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>
      {lang === 'fr' ? meta.fr : meta.en}
    </span>
  )
}

export default function Calendrier() {
  const lang = useContext(LangContext)
  const t    = useLang()

  const [hijriDate,  setHijriDate]  = useState(null)
  const [events,     setEvents]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  // Conversion tool
  const [convInput,  setConvInput]  = useState('')
  const [convResult, setConvResult] = useState(null)
  const [convLoading,setConvLoading]= useState(false)

  const today = new Date()

  useEffect(() => {
    getHijriDate().then(h => {
      setHijriDate(h)
      setEvents(getUpcomingEvents(h, 120))
    }).catch(() => setError(t('error_api'))).finally(() => setLoading(false))
  }, [])

  // Build month grid for current gregorian month
  const firstDay   = new Date(today.getFullYear(), today.getMonth(), 1)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const startDow   = firstDay.getDay() // 0=Sun

  // Estimate hijri day for a gregorian day offset from today
  function estimateHijriDay(gregDay) {
    if (!hijriDate) return null
    const offset = gregDay - today.getDate()
    let d = hijriDate.day + offset
    let m = hijriDate.month
    if (d > 30) { d -= 30; m = (m % 12) + 1 }
    if (d < 1)  { d += 30; m = m === 1 ? 12 : m - 1 }
    return { day: d, month: m }
  }

  function hasEvent(gregDay) {
    const h = estimateHijriDay(gregDay)
    if (!h) return false
    if (WHITE_DAYS.days.includes(h.day)) return true
    return ISLAMIC_EVENTS.some(ev => ev.hijriMonth === h.month && ev.hijriDay === h.day)
  }

  async function convertDate() {
    if (!convInput) return
    setConvLoading(true); setConvResult(null)
    try {
      const d  = new Date(convInput)
      const h  = await getHijriDate(d)
      setConvResult(h)
    } catch {
      setConvResult(null)
    } finally {
      setConvLoading(false)
    }
  }

  const dayNames  = lang === 'fr' ? DAY_NAMES_FR : DAY_NAMES_EN
  const monthName = lang === 'fr' ? MONTH_NAMES_FR[today.getMonth()] : MONTH_NAMES_EN[today.getMonth()]

  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()}/>

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--w)', marginBottom: 2 }}>{t('calendar')}</div>
        {hijriDate && (
          <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 14, color: 'var(--gold)', direction: 'rtl', textAlign: 'right' }}>
            {hijriDate.display}
          </div>
        )}
      </div>

      {/* Month grid */}
      <span className="slabel">{monthName} {today.getFullYear()}</span>
      <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 12px' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--w30)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        {/* Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`}/>)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day     = i + 1
            const isToday = day === today.getDate()
            const event   = hasEvent(day)
            return (
              <div key={day} style={{ textAlign: 'center', padding: '6px 2px', borderRadius: 8, position: 'relative',
                                      background: isToday ? 'var(--gold-a12)' : 'transparent',
                                      border: isToday ? '1px solid var(--gold)' : '1px solid transparent' }}>
                <div style={{ fontSize: 13, color: isToday ? 'var(--gold)' : 'var(--w60)', fontFamily: isToday ? 'var(--font-mono)' : 'var(--font-body)' }}>{day}</div>
                {event && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', margin: '2px auto 0' }}/>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming events */}
      <span className="slabel">{t('upcoming_events')}</span>
      {loading ? (
        <div style={{ margin: '0 16px', height: 120, background: 'var(--raised)', borderRadius: 'var(--r-lg)' }}/>
      ) : (
        <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--w30)', fontSize: 13, padding: 20 }}>
              {lang === 'fr' ? 'Aucun événement imminent.' : 'No upcoming events.'}
            </div>
          ) : events.map(ev => (
            <div key={ev.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div className="ar" style={{ fontSize: 18, color: 'var(--gold)', marginBottom: 4 }}>{ev.ar}</div>
                  <div style={{ fontSize: 14, color: 'var(--w)', fontWeight: 500 }}>{lang === 'fr' ? ev.fr : ev.en}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                  {ev.daysUntil === 0 ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--em)', background: 'var(--em-a10)', border: '1px solid var(--em)', borderRadius: 20, padding: '2px 8px' }}>{t('today')}</span>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)' }}>{t('days_until')} {ev.daysUntil}j</span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--w30)', lineHeight: 1.6, margin: '0 0 8px' }}>
                {lang === 'fr' ? ev.fr_desc : ev.en_desc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TypeBadge type={ev.type} lang={lang}/>
                {ev.note === 'scholarly_debate' && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--w30)' }}>{lang === 'fr' ? '* débat savant' : '* scholarly debate'}</span>
                )}
                {ev.note === 'exact_date_unknown' && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--w30)' }}>{lang === 'fr' ? '* date exacte inconnue' : '* exact date unknown'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* White Days note */}
      <div style={{ margin: '12px 16px 0', padding: '12px 14px', background: 'var(--gold-a06)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
        <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 500, marginBottom: 4 }}>
          <span className="ar" style={{ fontSize: 14 }}>{WHITE_DAYS.ar}</span> — {lang === 'fr' ? WHITE_DAYS.fr : WHITE_DAYS.en}
        </div>
        <div style={{ fontSize: 11, color: 'var(--w30)' }}>{lang === 'fr' ? WHITE_DAYS.fr_desc : WHITE_DAYS.en_desc}</div>
      </div>

      {/* Hijri/Gregorian conversion */}
      <span className="slabel">{lang === 'fr' ? 'Conversion de date' : 'Date conversion'}</span>
      <div style={{ margin: '0 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px' }}>
        <div style={{ fontSize: 12, color: 'var(--w30)', marginBottom: 10 }}>
          {lang === 'fr' ? 'Convertir une date grégorienne en hijri' : 'Convert a Gregorian date to Hijri'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={convInput} onChange={e => setConvInput(e.target.value)}
            style={{ flex: 1, background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--w)', fontSize: 14, padding: '10px 12px', outline: 'none', fontFamily: 'var(--font-mono)' }}/>
          <button onClick={convertDate} disabled={!convInput || convLoading}
            style={{ padding: '10px 16px', background: 'var(--gold-a12)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'var(--gold)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-mono)', opacity: !convInput ? 0.5 : 1 }}>
            {lang === 'fr' ? 'OK' : 'OK'}
          </button>
        </div>
        {convResult && (
          <div style={{ marginTop: 12, padding: '12px', background: 'var(--gold-a06)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
            <div className="ar" style={{ fontSize: 20, color: 'var(--gold)' }}>{convResult.display}</div>
            <div style={{ fontSize: 12, color: 'var(--w30)', marginTop: 4 }}>{convResult.monthEn} {convResult.day}, {convResult.year} AH</div>
          </div>
        )}
      </div>
    </div>
  )
}
