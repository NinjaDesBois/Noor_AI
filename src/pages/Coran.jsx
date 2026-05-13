import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangContext, useLang } from '../i18n/translations'
import { getAllSurahs } from '../services/quranService'
import { getBookmark, getSurahHifzProgress } from '../utils/storage'
import ErrorMessage from '../components/ErrorMessage'

function Skeleton({ h = 56, style = {} }) {
  return <div style={{ height: h, background: 'var(--raised)', borderRadius: 14, marginBottom: 8, ...style }}/>
}

export default function Coran() {
  const lang     = useContext(LangContext)
  const t        = useLang()
  const navigate = useNavigate()

  const [surahs,  setSurahs]  = useState([])
  const [query,   setQuery]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const bookmark = getBookmark()

  useEffect(() => {
    getAllSurahs(lang).then(setSurahs).catch(() => setError(t('error_quran'))).finally(() => setLoading(false))
  }, [lang])

  function getHifzProgress(surahNumber, versesCount) {
    return getSurahHifzProgress(surahNumber, versesCount).pct
  }

  const filtered = surahs.filter(s =>
    !query ||
    String(s.number).includes(query) ||
    s.nameArabic.includes(query) ||
    s.nameSimple.toLowerCase().includes(query.toLowerCase()) ||
    (s.nameFr || '').toLowerCase().includes(query.toLowerCase())
  )

  if (error) return <ErrorMessage message={error} onRetry={() => { setError(null); setLoading(true); getAllSurahs(lang).then(setSurahs).catch(() => setError(t('error_quran'))).finally(() => setLoading(false)) }}/>

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--w)', marginBottom: 12 }}>
          {t('quran')}
        </div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '10px 14px' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="var(--w30)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4.5"/>
            <line x1="10" y1="10" x2="14" y2="14"/>
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={lang === 'fr' ? 'Nom ou numéro de sourate…' : 'Surah name or number…'}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--w)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }}/>
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--w30)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Resume reading */}
      {bookmark && (
        <div style={{ margin: '0 16px 12px' }}>
          <button onClick={() => navigate(`/coran/${bookmark.surah}`)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--gold-a06)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 16px', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2z"/><line x1="3" y1="6" x2="8" y2="6"/><line x1="3" y1="9" x2="6" y2="9"/>
            </svg>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{t('resume_reading')}</div>
              <div style={{ fontSize: 12, color: 'var(--w60)', marginTop: 2 }}>
                {t('surah')} {bookmark.surah} · {t('verse')} {bookmark.verse}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Surah list */}
      {loading ? (
        <div style={{ padding: '0 16px' }}>
          {Array.from({length: 12}).map((_, i) => <Skeleton key={i}/>)}
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {filtered.map(s => {
            const progress = getHifzProgress(s.number, s.versesCount)
            return (
              <button key={s.number} onClick={() => navigate(`/coran/${s.number}`)}
                style={{ display: 'flex', alignItems: 'center', width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 8, cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                {/* Number */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold-a06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)' }}>{s.number}</span>
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: 14, color: 'var(--w)', fontWeight: 500 }}>{s.nameFr || s.nameSimple}</span>
                    <span className="ar" style={{ fontSize: 16, color: 'var(--gold)', lineHeight: 1 }}>{s.nameArabic}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{s.versesCount} {t('verses')}</span>
                    <span style={{ fontSize: 9, padding: '1px 8px', borderRadius: 20, fontFamily: 'var(--font-mono)',
                                   background: s.revelation === 'makkah' ? 'rgba(201,168,76,.08)' : 'rgba(29,184,142,.08)',
                                   border: `1px solid ${s.revelation === 'makkah' ? 'rgba(201,168,76,.2)' : 'rgba(29,184,142,.2)'}`,
                                   color: s.revelation === 'makkah' ? 'var(--gold)' : 'var(--em)' }}>
                      {s.revelation === 'makkah' ? t('meccan') : t('medinan')}
                    </span>
                  </div>
                  {/* Hifz progress */}
                  {progress > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 3, background: 'var(--raised)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gold)', borderRadius: 2 }}/>
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--gold)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{progress}% {t('memorized')}</div>
                    </div>
                  )}
                </div>
                {/* Arrow */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--w15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4 7h6M7 4l3 3-3 3"/>
                </svg>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--w30)', fontSize: 14 }}>
              {lang === 'fr' ? 'Aucune sourate trouvée.' : 'No surah found.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
