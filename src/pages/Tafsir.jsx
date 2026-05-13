import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LangContext, useLang } from '../i18n/translations'
import { getSingleVerse } from '../services/quranService'
import { getAllTafsirsForVerse, TAFSIRS, translateTafsirText } from '../services/tafsirService'
import ErrorMessage from '../components/ErrorMessage'

const SYSTEM_PROMPT_TAFSIR = `You are a knowledgeable Islamic scholar assistant. Your task is to summarize tafsir (Quranic exegesis) for a given verse in a clear, pedagogical way.
Rules:
- Be factual and cite only what is provided in the tafsir excerpts
- Mention asbab al-nuzul (reasons for revelation) if present in the text
- Do not add opinions not found in the provided tafsirs
- Keep the summary between 150-200 words
- Respond in the language specified`

async function performTranslation(originalText, verseKey, tafsirId, retriesLeft = 2) {
  const result = await translateTafsirText(originalText, verseKey, tafsirId);
  if (result === originalText && retriesLeft > 0) {
    await new Promise(r => setTimeout(r, 1000));
    return performTranslation(originalText, verseKey, tafsirId, retriesLeft - 1);
  }
  return { text: result, failed: result === originalText };
}

export default function Tafsir() {
  const { verseKey }  = useParams()
  const navigate      = useNavigate()
  const lang          = useContext(LangContext)
  const t             = useLang()

  const [verse,             setVerse]             = useState(null)
  const [tafsirs,           setTafsirs]           = useState({})
  const [tafsirErrors,      setTafsirErrors]      = useState({})
  const [activeTab,         setActiveTab]         = useState('ibn_kathir')
  const [aiSummary,         setAiSummary]         = useState(null)
  const [aiLoading,         setAiLoading]         = useState(false)
  const [aiError,           setAiError]           = useState(null)
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState(null)
  const [tafsirLoading,     setTafsirLoading]     = useState({})
  const [translating,       setTranslating]       = useState({})
  const [translatedTafsirs, setTranslatedTafsirs] = useState({})
  const [translationFailed, setTranslationFailed] = useState({})

  useEffect(() => {
    if (!verseKey) return
    setLoading(true)
    getSingleVerse(verseKey, lang)
      .then(setVerse)
      .catch(() => setError(t('error_quran')))
      .finally(() => setLoading(false))
  }, [verseKey, lang])

  function fetchTafsirs() {
    if (!verseKey) return
    setTafsirLoading({ ibn_kathir: true, al_tabari: true, al_sadi: true })
    setTafsirErrors({})
    getAllTafsirsForVerse(verseKey).then(({ results, errors }) => {
      setTafsirs(results)
      setTafsirErrors(errors)
      setTafsirLoading({})
    })
  }

  useEffect(() => { fetchTafsirs() }, [verseKey])

  useEffect(() => {
    let active = true;

    if (lang !== 'fr') {
      setTranslatedTafsirs({});
      setTranslationFailed({});
      return;
    }

    const toTranslate = Object.entries(TAFSIRS).filter(([, meta]) => meta.lang === 'en');

    for (const [key, meta] of toTranslate) {
      const text = tafsirs[key];
      if (!text) continue;

      setTranslating(prev => ({ ...prev, [key]: true }));
      setTranslationFailed(prev => ({ ...prev, [key]: false }));

      performTranslation(text, verseKey, meta.id).then(({ text: translated, failed }) => {
        if (!active) return;
        setTranslatedTafsirs(prev => ({ ...prev, [key]: translated }));
        setTranslationFailed(prev => ({ ...prev, [key]: failed }));
        setTranslating(prev => ({ ...prev, [key]: false }));
      });
    }

    return () => { active = false; };
  }, [tafsirs, lang, verseKey])

  async function loadAiSummary() {
    if (aiSummary || aiLoading) return
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

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMsg }],
          system: SYSTEM_PROMPT_TAFSIR,
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setAiSummary(data.content?.[0]?.text || '')
    } catch {
      setAiError(lang === 'fr' ? 'Résumé IA indisponible — réessayez' : 'AI summary unavailable — retry')
    } finally {
      setAiLoading(false)
    }
  }

  const tabs = [
    { key: 'ibn_kathir', label: 'Ibn Kathir', langs: 'AR / EN' },
    { key: 'al_tabari',  label: 'Al-Tabari',  langs: 'AR'      },
    { key: 'al_sadi',    label: "Al-Sa'di",   langs: 'AR'      },
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
                     boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
                     display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span>{tab.label}</span>
            {tab.langs && (
              <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '.06em',
                             color: activeTab === tab.key ? 'rgba(201,168,76,.65)' : 'var(--text-4)',
                             background: activeTab === tab.key ? 'rgba(201,168,76,.10)' : 'rgba(0,0,0,.05)',
                             borderRadius: 4, padding: '1px 4px' }}>
                {tab.langs}
              </span>
            )}
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
          ) : tafsirErrors[activeTab] ? (
            <ErrorMessage
              message={lang === 'fr' ? 'Ce tafsir n\'est pas disponible pour ce verset' : 'This tafsir is not available for this verse'}
              onRetry={fetchTafsirs}
            />
          ) : tafsirs[activeTab] ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span className="ar" style={{ fontSize: 14, color: 'var(--gold)' }}>{TAFSIRS[activeTab].nameAr}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--w30)' }}>
                  {TAFSIRS[activeTab].langs}
                </span>
              </div>

              {activeTab === 'al_sadi' && lang !== 'ar' && (
                <div style={{ marginBottom: 14, padding: '10px 12px', background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 8, fontSize: 12, color: 'var(--w30)', lineHeight: 1.6 }}>
                  {lang === 'fr'
                    ? 'Ce tafsir est disponible en arabe uniquement. Nous vous affichons le texte original.'
                    : 'This tafsir is available in Arabic only. Displaying the original text.'}
                </div>
              )}

              {lang === 'fr' && TAFSIRS[activeTab].lang === 'en' && translating[activeTab] ? (
                <p style={{ fontSize: 13, color: 'var(--w30)', fontStyle: 'italic', margin: 0 }}>
                  Traduction en cours...
                </p>
              ) : (
                <>
                  {(() => {
                    const isArabic = TAFSIRS[activeTab].lang === 'ar';
                    const display = lang === 'fr' && TAFSIRS[activeTab].lang === 'en'
                      ? (translatedTafsirs[activeTab] || tafsirs[activeTab])
                      : tafsirs[activeTab];
                    const text = display.slice(0, 1200) + (display.length > 1200 ? '…' : '');
                    return isArabic
                      ? <p className="ar" style={{ fontSize: 'var(--font-size-arabic)', color: 'var(--text-1)', lineHeight: 2, margin: 0 }}>{text}</p>
                      : <p style={{ fontSize: 13, color: 'var(--w60)', lineHeight: 1.8, margin: 0 }}>{text}</p>;
                  })()}
                  {translationFailed[activeTab] && lang === 'fr' && (
                    <p style={{ fontSize: 12, color: 'var(--w30)', margin: '10px 0 0' }}>
                      Traduction indisponible — texte en anglais
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--w30)', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
              {lang === 'fr' ? 'Ce tafsir n\'est pas disponible pour ce verset.' : 'This tafsir is not available for this verse.'}
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
