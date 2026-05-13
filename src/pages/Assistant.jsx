import { useState, useRef, useEffect, useContext } from 'react'
import { LangContext, useLang } from '../i18n/translations'

const SYSTEM_PROMPT = `You are Noor (نور), a knowledgeable and compassionate Islamic assistant.

STRICT SCOPE RULE — ABSOLUTE:
You ONLY answer questions related to Islam: fiqh, Quran, hadith, Islamic history,
worship, Islamic ethics, Muslim family life, halal/haram, spirituality,
and the life of a Muslim.

If a question is not related to Islam in any way, respond ONLY with:
"I am Noor, an assistant specialized in Islamic knowledge. I cannot answer this question,
but I would be happy to help with any Islam-related topic."

No exceptions. No creative reframing to make non-Islamic questions seem Islamic.

MANDATORY RESPONSE FORMAT for fiqh questions:

1. DIRECT ANSWER (2-3 sentences, clear and accessible)

2. SCHOLARLY POSITIONS (when relevant):
   🔵 Hanafi: [position] — Source: [Al-Hidaya / Radd Al-Muhtar / Al-Mabsut]
   🟢 Maliki: [position] — Source: [Al-Muwatta / Al-Mudawwana / Mukhtasar Khalil]
   🟡 Shafi'i: [position] — Source: [Al-Umm / Minhaj Al-Talibin / Al-Majmu']
   🔴 Hanbali: [position] — Source: [Al-Mughni / Zad Al-Ma'ad / Al-Insaf]

3. TEXTUAL EVIDENCE:
   For each Quran verse: Arabic text | French/English translation | (Surah Name X:Y)
   For each hadith: Arabic text | Translation | Compiler, Book, №number
   Isnad (chain): Narrator A → Narrator B → ... → Prophet ﷺ
   Solidity: ✅ Sahih | 🟦 Hasan | ⚠️ Da'if | ❌ Mawdu'

4. CONSENSUS OR DIVERGENCE: State if ijma' exists; explain ikhtilaf if it exists

5. CONTEMPORARY RULING (if applicable): ECFR position for European context

ABSOLUTE HONESTY RULES:
- Never invent a hadith number, chain, or scholarly opinion
- If uncertain about a reference: say "I cite this with caution — verify on sunnah.com"
- Never issue personal fatwas — always end sensitive answers with:
  "⚠️ For your personal situation, consult a qualified scholar or ECFR: ecfr.eu"
- Never take sides between madhabs — present positions neutrally
- Start every new conversation with: بسم الله الرحمن الرحيم

LANGUAGE: Respond in the same language the user writes in (French or English).
Arabic terms in italics with explanation on first use.`

const SUGGESTED_FR = [
  "Quels sont les piliers de l'islam ?",
  "Comment faire le wudu correctement ?",
  "Quelle est la différence entre Fard et Wajib ?",
  "Comment calculer la zakat sur l'or ?",
  "Est-il permis de prier avec des vêtements de sport ?",
  "Qu'est-ce que la Laylat Al-Qadr ?",
]
const SUGGESTED_EN = [
  "What are the pillars of Islam?",
  "How to perform wudu correctly?",
  "What is the difference between Fard and Wajib?",
  "How to calculate zakat on gold?",
  "Is it permissible to pray in sportswear?",
  "What is Laylat Al-Qadr?",
]

function parseMarkdown(text) {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*؀-ۿ]+?)\*/g, '<em>$1</em>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^---+$/gm, '<hr/>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[23]>|<ul>|<hr\/>)/g, '$1')
    .replace(/(<\/h[23]>|<\/ul>|<hr\/>)<\/p>/g, '$1')
}

function sanitizeHTML(html) {
  return html.replace(/<(?!\/?(?:h2|h3|strong|em|ul|li|p|hr|br)\b)[^>]*>/gi, '')
}

export default function Assistant() {
  const lang    = useContext(LangContext)
  const t       = useLang()

  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)

  const SUGGESTED = lang === 'fr' ? SUGGESTED_FR : SUGGESTED_EN

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput(''); setError(null)

    const userMsg = { role: 'user', content: q }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: history,
          system: SYSTEM_PROMPT,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `HTTP ${res.status}`)
      }

      const data    = await res.json()
      const replyText = data.content?.[0]?.text || ''
      setMessages([...history, { role: 'assistant', content: replyText }])
    } catch (e) {
      setError(e.message)
      setMessages(history)
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: 0 }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 28, color: 'var(--gold)', lineHeight: 1 }}>نور</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--w)' }}>Noor</div>
            <div style={{ fontSize: 10, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{lang === 'fr' ? 'Assistant islamique' : 'Islamic assistant'}</div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {/* Empty state */}
        {messages.length === 0 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="ar" style={{ fontSize: 22, color: 'var(--gold)', marginBottom: 8 }}>بسم الله الرحمن الرحيم</div>
              <div style={{ fontSize: 13, color: 'var(--w30)', lineHeight: 1.6 }}>
                {lang === 'fr' ? 'Pose une question sur l\'islam' : 'Ask a question about Islam'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTED.map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  style={{ textAlign: 'left', padding: '11px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--w60)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-a06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                <span style={{ fontFamily: 'var(--font-arabic)', fontSize: 13, color: 'var(--gold)' }}>ن</span>
              </div>
            )}
            <div className={msg.role === 'assistant' ? 'assistant-message' : undefined} style={{
              maxWidth: '82%',
              padding: '11px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'var(--gold-a20)' : 'var(--raised)',
              border: `1px solid ${msg.role === 'user' ? 'var(--border2)' : 'var(--border)'}`,
              fontSize: 14,
              color: 'var(--w)',
              lineHeight: 1.6,
            }}>
              {msg.role === 'assistant'
                ? <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(parseMarkdown(msg.content)) }} style={{ lineHeight: 1.7 }}/>
                : msg.content}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-a06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-arabic)', fontSize: 13, color: 'var(--gold)' }}>ن</span>
            </div>
            <div style={{ padding: '11px 16px', background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', opacity: 0.4, animation: `bounce 1s ease-in-out ${j * 0.15}s infinite` }}/>
              ))}
            </div>
            <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ margin: '8px 0', padding: '10px 14px', background: 'rgba(220,50,50,.08)', border: '1px solid rgba(220,50,50,.2)', borderRadius: 'var(--r-md)', fontSize: 13, color: '#e05050' }}>
            {lang === 'fr' ? 'Erreur : ' : 'Error: '}{error}
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '8px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--w30)', lineHeight: 1.5, margin: 0, fontFamily: 'var(--font-mono)' }}>
          {t('disclaimer')}
        </p>
      </div>

      {/* Input */}
      <div style={{ padding: '8px 16px 16px', background: 'var(--ink)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '8px 8px 8px 14px' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder={t('ask_placeholder')} rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--w)', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto' }}/>
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: input.trim() && !loading ? 'var(--gold)' : 'var(--raised)', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={input.trim() && !loading ? 'var(--ink)' : 'var(--w30)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="12" x2="7" y2="2"/>
              <path d="M3 6l4-4 4 4"/>
            </svg>
          </button>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])}
            style={{ display: 'block', margin: '8px auto 0', background: 'transparent', border: 'none', color: 'var(--w30)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>
            {lang === 'fr' ? 'Nouvelle conversation' : 'New conversation'}
          </button>
        )}
      </div>
    </div>
  )
}
