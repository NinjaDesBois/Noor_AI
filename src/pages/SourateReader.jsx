import { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LangContext, useLang } from '../i18n/translations'
import { getSurahVerses, getAllSurahs } from '../services/quranService'
import { getReciter, isVerseMemorized, setVerseMemorized, setBookmark } from '../utils/storage'
import ErrorMessage from '../components/ErrorMessage'

function Skeleton({ h = 80, style = {} }) {
  return <div style={{ height: h, background: 'var(--raised)', borderRadius: 14, marginBottom: 12, ...style }}/>
}

export default function SourateReader() {
  const { numero }  = useParams()
  const navigate    = useNavigate()
  const lang        = useContext(LangContext)
  const t           = useLang()
  const surahNum    = parseInt(numero, 10)

  const [verses,      setVerses]      = useState([])
  const [surahInfo,   setSurahInfo]   = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [playing,     setPlaying]     = useState(null) // verse key
  const [memorized,   setMemorized]   = useState({})
  const [continuous,  setContinuous]  = useState(false)

  const audioRef    = useRef(null)
  const playingRef  = useRef(null)   // mirrors `playing` state; safe to read inside onEnded
  const versesRef   = useRef([])     // mirrors `verses` state; avoids stale closure in onEnded
  const reciter     = getReciter()

  // Keep refs in sync with state (runs synchronously in render, before effects)
  versesRef.current = verses

  // Load memorized state
  useEffect(() => {
    const m = {}
    for (let v = 1; v <= 300; v++) {
      if (isVerseMemorized(surahNum, v)) m[v] = true
    }
    setMemorized(m)
  }, [surahNum])

  // Fetch surah info + verses
  useEffect(() => {
    setLoading(true); setError(null); setVerses([])
    Promise.all([
      getSurahVerses(surahNum, lang),
      getAllSurahs(lang),
    ]).then(([vrs, surahs]) => {
      setVerses(vrs)
      setSurahInfo(surahs.find(s => s.number === surahNum) || null)
    }).catch(() => setError(t('error_quran'))).finally(() => setLoading(false))
  }, [surahNum, lang])

  // Save bookmark on scroll
  const onScroll = useCallback(() => {
    const cards = document.querySelectorAll('[data-verse]')
    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
        const verseNum = parseInt(card.getAttribute('data-verse'), 10)
        setBookmark(surahNum, verseNum)
        break
      }
    }
  }, [surahNum])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  // Stop and clear audio when navigating to a different surah
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.src = ''
      audio.load()
    }
    playingRef.current = null
    setPlaying(null)
  }, [surahNum])

  function toggleMemorized(verseNum) {
    const next = !memorized[verseNum]
    setVerseMemorized(surahNum, verseNum, next)
    setMemorized(m => ({ ...m, [verseNum]: next }))
  }

  function playVerse(verse) {
    if (playingRef.current === verse.key) {
      audioRef.current?.pause()
      playingRef.current = null
      setPlaying(null)
      return
    }
    const url = verse.audioUrl.replace('ar.alafasy', reciter)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = url
      audioRef.current.play().catch(() => {})
    }
    playingRef.current = verse.key
    setPlaying(verse.key)
  }

  function onAudioEnded() {
    if (!continuous) { playingRef.current = null; setPlaying(null); return }
    const vss = versesRef.current
    const idx = vss.findIndex(v => v.key === playingRef.current)
    if (idx >= 0 && idx < vss.length - 1) {
      const next = vss[idx + 1]
      const url  = next.audioUrl.replace('ar.alafasy', reciter)
      audioRef.current.src = url
      audioRef.current.play().catch(() => {})
      playingRef.current = next.key
      setPlaying(next.key)
    } else {
      playingRef.current = null
      setPlaying(null)
    }
  }

  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()}/>

  return (
    <div style={{ paddingBottom: 24 }}>
      <audio ref={audioRef} onEnded={onAudioEnded} style={{ display: 'none' }}/>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--ink)', borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <button onClick={() => navigate('/coran')}
            style={{ background: 'transparent', border: 'none', color: 'var(--w30)', cursor: 'pointer', padding: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4L6 10l6 6"/>
            </svg>
          </button>
          {surahInfo ? (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--w)' }}>{surahInfo.nameFr || surahInfo.nameSimple}</div>
                <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{surahInfo.versesCount} {t('verses')} · {surahInfo.revelation === 'makkah' ? t('meccan') : t('medinan')}</div>
              </div>
              <div className="ar" style={{ fontSize: 22, color: 'var(--gold)', lineHeight: 1 }}>{surahInfo.nameArabic}</div>
            </div>
          ) : <div style={{ flex: 1, height: 36, background: 'var(--raised)', borderRadius: 8 }}/>}
        </div>
        {/* Continuous toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setContinuous(c => !c)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${continuous ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 20, padding: '4px 10px', cursor: 'pointer', color: continuous ? 'var(--gold)' : 'var(--w30)', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 5h8M6 2l3 3-3 3"/>
            </svg>
            {lang === 'fr' ? 'Lecture continue' : 'Continuous play'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '16px' }}>
          {Array.from({length: 5}).map((_, i) => <Skeleton key={i} h={120}/>)}
        </div>
      ) : (
        <>
          {/* Bismillah — all surahs except Al-Tawbah (9) */}
          {surahNum !== 9 && (
            <div style={{ padding: '24px 20px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
              <div className="ar" style={{ fontSize: 26, color: 'var(--gold)' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            </div>
          )}

          {/* Verses */}
          {verses.map((verse) => (
            <div key={verse.key} data-verse={verse.number}
              style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', background: playing === verse.key ? 'var(--gold-a06)' : 'transparent', transition: 'background .2s' }}>
              {/* Verse number + Arabic */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, direction: 'rtl' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: memorized[verse.number] ? 'var(--em-a10)' : 'var(--gold-a06)', border: `1px solid ${memorized[verse.number] ? 'var(--em)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: memorized[verse.number] ? 'var(--em)' : 'var(--gold)' }}>{verse.number}</span>
                </div>
                <p className="ar" style={{ fontSize: 26, color: 'var(--w)', lineHeight: 1.9, flex: 1, margin: 0 }}>{verse.arabic}</p>
              </div>

              {/* Translation */}
              <p style={{ fontSize: 13, color: 'var(--w60)', lineHeight: 1.7, margin: '0 0 14px', paddingRight: 4 }}>{verse.translation}</p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                {/* Play */}
                <button onClick={() => playVerse(verse)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: '1px solid', borderColor: playing === verse.key ? 'var(--gold)' : 'var(--border)', background: playing === verse.key ? 'var(--gold-a12)' : 'transparent', color: playing === verse.key ? 'var(--gold)' : 'var(--w30)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                  {playing === verse.key ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="3" height="8"/><rect x="6" y="1" width="3" height="8"/></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg>
                  )}
                  {t('play_audio')}
                </button>

                {/* Memorized */}
                <button onClick={() => toggleMemorized(verse.number)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: '1px solid', borderColor: memorized[verse.number] ? 'var(--em)' : 'var(--border)', background: memorized[verse.number] ? 'var(--em-a10)' : 'transparent', color: memorized[verse.number] ? 'var(--em)' : 'var(--w30)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {memorized[verse.number] ? <path d="M1 4.5l2.5 2.5L8 1.5"/> : <circle cx="4.5" cy="4.5" r="3.5"/>}
                  </svg>
                  {memorized[verse.number] ? t('memorized') : t('mark_memorized')}
                </button>

                {/* Tafsir */}
                <button onClick={() => navigate(`/tafsir/${verse.key}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--w30)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="4.5" cy="4.5" r="3.5"/><line x1="4.5" y1="3" x2="4.5" y2="4.5"/><circle cx="4.5" cy="6" r=".5" fill="currentColor" stroke="none"/>
                  </svg>
                  {t('tafsir')}
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
