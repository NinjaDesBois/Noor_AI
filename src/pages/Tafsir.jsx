import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LangContext, useLang } from '../i18n/translations'
import { getSingleVerse } from '../services/quranService'
import { getAllTafsirsForVerse, TAFSIRS } from '../services/tafsirService'
import ErrorMessage from '../components/ErrorMessage'

const SYSTEM_PROMPT_TAFSIR = `You are a knowledgeable Islamic scholar assistant. Your task is to summarize tafsir (Quranic exegesis) for a given verse in a clear, pedagogical way.
Rules:
- Be factual and cite only what is provided in the tafsir excerpts
- Mention asbab al-nuzul (reasons for revelation) if present in the text
- Do not add opinions not found in the provided tafsirs
- Keep the summary between 150-200 words
- Respond in the language specified`

export default function Tafsir() {
  const { verseKey }  = useParams()
  const navigate      = useNavigate()
  const lang          = useContext(LangContext)
  const t             = useLang()

  const [verse,       setVerse]       = useState(null)
  const [tafsirs,     setTafsirs]     = useState({})
  const [activeTab,   setActiveTab]   = useState('ibn_kathir')
  const [aiSummary,   setAiSummary]   = useState(null)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [aiError,     setAiError]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [tafsirLoading, setTafsirLoading] = useState({})

  useEffect(() => {
    if (!verseKey) return
    setLoading(true)
    getSingleVerse(verseKey, lang)
      .then(setVerse)
      .catch(() => setError(lang === 'fr' ? t('error_quran') : t('error_quran')))
      .finally(() => setLoading(false))
  }, [verseKey, lang])

  useEffect(() => {
    if (!verseKey) return
    setTafsirLoading({ ibn_kathir: true, al_tabari: true, al_sadi: true })
    getAllTafsirsForVerse(verseKey).then(results => {
      setTafsirs(results)
      setTafsirLoading({})
    })
  }, [verseKey])

  async function loadAiSummary() {
    if (aiSummary || aiLoading) return
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) { setAiError('API key not configured'); return }
    setAiLoading(true); setAiError(null)
    try {
      const tafsirTexts = Object.entries(TAFSIRS)
        .map(([k, meta]) => tafsirs[k] ? `[${meta.name}]: ${tafsirs[k].slice(0, 600)}` : null)
        .filter(Boolean).join('\n\n')

      const userMsg = `Verse ${verseKey}: ${verse?.arabic || ''}
Translation: ${verse?.translation || ''}
Available tafsir excerpts:
${tafsirTexts}
Write a clear, pedagogical summary in ${lang === 'fr' ? 'French' : 'English'} (150-200 words max). Mention asbab al-nuzul if present. Be factual, cite sources, add nothing not found in the provided tafsirs.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 600,
          system: SYSTEM_PROMPT_TAFSIR,
          messages: [{ role: 'user', content: userMsg }],
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setAiSummary(data.content?.[0]?.text || '')
    } catch (e) {
      setAiError(lang === 'fr' ? 'Résumé IA indisponible — réessayez' : 'AI summary unavailable — retry')
    } finally {
      setAiLoading(false)
    }
  }

  const tabs = [
    { key: 'ibn_kathir', label: 'Ibn Kathir' },
    { key: 'al_tabari',  label: 'Al-Tabari'  },
    { key: 'al_sadi',    label: "Al-Sa'di"   },
    { key: 'ai',         label: lang === 'fr' ? 'Résumé IA' : 'AI Summary' },
  ]

  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()}/>

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--w30)', fontSize: 20, cursor: 'pointer', padding: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4L6 10l6 6"/>
          </svg>
        </button>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--w)' }}>
            {t('tafsir')}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)' }}>{verseKey}</div>
        </div>
      </div>

      {/* Verse card */}
      {loading ? (
        <div style={{ margin: '16px', height: 100, background: 'var(--raised)', borderRadius: 'var(--r-lg)' }}/>
      ) : verse ? (
        <div style={{ margin: '16px 16px 0' }} className="card">
          <p className="ar" style={{ fontSize: 24, color: 'var(--w)', marginBottom: 14 }}>{verse.arabic}</p>
          <p style={{ fontSize: 13, color: 'var(--w60)', lineHeight: 1.7, margin: 0 }}>{verse.translation}</p>
        </div>
      ) : null}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, margin: '16px 16px 0', background: 'var(--raised)', borderRadius: 'var(--r-md)', padding: 3, overflow: 'hidden' }}>
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === 'ai') loadAiSummary() }}
            style={{ flex: 1, padding: '8px 4px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)', transition: 'all .15s',
                     background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                     color: activeTab === tab.key ? 'var(--gold)' : 'var(--w30)',
                     boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,.3)' : 'none' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ margin: '12px 16px 0' }}>
        {activeTab !== 'ai' && (
          tafsirLoading[activeTab] ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--w30)', fontSize: 13 }}>
              {lang === 'fr' ? 'Chargement…' : 'Loading…'}
            </div>
          ) : tafsirs[activeTab] ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span className="ar" style={{ fontSize: 14, color: 'var(--gold)' }}>{TAFSIRS[activeTab].nameAr}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--w30)' }}>
                  {TAFSIRS[activeTab].lang.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--w60)', lineHeight: 1.8, margin: 0 }}>
                {tafsirs[activeTab].slice(0, 1200)}{tafsirs[activeTab].length > 1200 ? '…' : ''}
              </p>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--w30)', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              {lang === 'fr' ? 'Non disponible pour ce verset.' : 'Not available for this verse.'}
            </div>
          )
        )}

        {activeTab === 'ai' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
            {aiLoading && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}/>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            {aiError && <ErrorMessage message={aiError} onRetry={loadAiSummary}/>}
            {aiSummary && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--gold)', background: 'var(--gold-a06)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px' }}>NOOR AI</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--w30)' }}>claude-sonnet-4-5</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--w60)', lineHeight: 1.8, margin: 0 }}>{aiSummary}</p>
                <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(201,168,76,.05)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--w30)' }}>
                  {lang === 'fr' ? 'Ce résumé est basé uniquement sur les tafsirs affichés. Consultez un érudit pour tout usage religieux.' : 'This summary is based only on the tafsirs shown. Consult a scholar for religious guidance.'}
                </div>
              </>
            )}
            {!aiLoading && !aiSummary && !aiError && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <button onClick={loadAiSummary}
                  style={{ padding: '10px 24px', background: 'var(--gold-a12)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--gold)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {lang === 'fr' ? 'Générer le résumé' : 'Generate summary'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
