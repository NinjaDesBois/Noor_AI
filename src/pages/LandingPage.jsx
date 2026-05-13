import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, LangContext } from '../i18n/translations'

// ── Inline SVG icons (stroke-only, no icon library) ──────────────
const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const ScaleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21"/>
    <path d="M5 21h14"/>
    <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/>
    <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7"/>
  </svg>
)

// ── Data ──────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <BookIcon />,     en: { title: 'Quran',        desc: '114 surahs, audio, tafsir'              }, fr: { title: 'Coran',        desc: '114 sourates, audio, tafsir'             } },
  { icon: <ClockIcon />,    en: { title: 'Prayers',      desc: 'Accurate times via geolocation'         }, fr: { title: 'Prières',      desc: 'Horaires précis par géolocalisation'     } },
  { icon: <StarIcon />,     en: { title: 'AI Assistant', desc: 'Fiqh, hadiths, spirituality'            }, fr: { title: 'Assistant IA', desc: 'Fiqh, hadiths, spiritualité'             } },
  { icon: <CalendarIcon />, en: { title: 'Calendar',     desc: 'Hijri dates, Islamic events'            }, fr: { title: 'Calendrier',   desc: 'Dates hijri, événements islamiques'      } },
  { icon: <HeartIcon />,    en: { title: 'Reminders',    desc: 'Hadith of the day, notifications'       }, fr: { title: 'Rappels',      desc: 'Hadith du jour, notifications'           } },
  { icon: <ScaleIcon />,    en: { title: 'Zakat',        desc: 'Real-time nisab calculator'             }, fr: { title: 'Zakat',        desc: 'Calculateur nisab en temps réel'         } },
]

const MOCK_PRAYERS = [
  { name: 'Fajr',    time: '05:12', active: false },
  { name: 'Dhuhr',   time: '13:24', active: false },
  { name: 'Asr',     time: '16:58', active: true  },
  { name: 'Maghrib', time: '20:31', active: false },
  { name: 'Isha',    time: '22:03', active: false },
]

// ── Component ─────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const t = useLang()
  const lang = useContext(LangContext)

  const [verse, setVerse] = useState(null)
  const [verseLoading, setVerseLoading] = useState(true)
  const [verseError, setVerseError] = useState(false)

  const rootRef = useRef(null)

  // Fetch Al-Fatiha 1:1 from api.quran.com
  useEffect(() => {
    const controller = new AbortController()
    fetch(
      'https://api.quran.com/api/v4/verses/by_key/1:1?translations=131&fields=text_uthmani',
      { signal: controller.signal }
    )
      .then(r => { if (!r.ok) throw new Error('API error'); return r.json() })
      .then(data => {
        setVerse({
          arabic: data.verse.text_uthmani,
          translation: data.verse.translations?.[0]?.text?.replace(/<[^>]+>/g, '') || '',
        })
        setVerseLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setVerseError(true)
          setVerseLoading(false)
        }
      })
    return () => controller.abort()
  }, [])

  // IntersectionObserver — add .visible to every .reveal inside this page
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = root.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          obs.unobserve(e.target)
        }
      }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const quranBullets = [t('landing_quran_b1'), t('landing_quran_b2'), t('landing_quran_b3')]

  return (
    <div className="lp-root" ref={rootRef}>

      {/* ── Section 1: Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <p className="lp-noor-ar">نور</p>
          <h1 className="lp-noor-en">Noor</h1>
          <p className="lp-tagline">{t('landing_tagline')}</p>
          <button className="lp-cta-btn" onClick={() => navigate('/home')}>
            {t('landing_cta')}
          </button>
        </div>
        <div className="lp-scroll-indicator" aria-hidden="true">
          <ChevronDownIcon />
        </div>
      </section>

      {/* ── Section 2: Features Grid ── */}
      <section className="lp-features">
        <h2 className="lp-section-title reveal">{t('landing_features_title')}</h2>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="lp-feature-card reveal"
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="lp-feature-icon-wrap">{f.icon}</div>
              <h3 className="lp-feature-name">{lang === 'fr' ? f.fr.title : f.en.title}</h3>
              <p className="lp-feature-desc">{lang === 'fr' ? f.fr.desc : f.en.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Prayer Times Preview ── */}
      <section className="lp-prayer">
        <div className="lp-prayer-inner reveal">
          <div className="lp-prayer-text">
            <h2>{t('landing_prayer_title')}</h2>
            <p>{t('landing_prayer_desc')}</p>
            <button className="lp-text-link" onClick={() => navigate('/prayers')}>
              {t('landing_prayer_cta')} →
            </button>
          </div>
          <div className="lp-prayer-mock">
            <div className="lp-mock-header">
              <div>
                <div className="lp-mock-label">Asr — العصر</div>
                <div className="lp-mock-time">16:58</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="lp-mock-label">
                  {lang === 'fr' ? 'Prochaine' : 'Next'}
                </div>
                <div className="lp-mock-next">Maghrib in 3h 33m</div>
              </div>
            </div>
            <div className="lp-mock-prayers">
              {MOCK_PRAYERS.map(p => (
                <div key={p.name} className={`lp-mock-prayer-row${p.active ? ' active' : ''}`}>
                  <span className="lp-mock-prayer-name">{p.name}</span>
                  <span className="lp-mock-prayer-time">{p.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Quran Feature Highlight ── */}
      <section className="lp-quran">
        <div className="lp-quran-inner">
          <div className="lp-quran-text reveal">
            <h2>{t('landing_quran_title')}</h2>
            <ul className="lp-quran-bullets">
              {quranBullets.map((b, i) => (
                <li key={i} className="lp-quran-bullet">
                  <span className="lp-bullet-dot"><CheckIcon /></span>
                  {b}
                </li>
              ))}
            </ul>
            <button className="lp-text-link" onClick={() => navigate('/coran')}>
              {t('landing_quran_cta')} →
            </button>
          </div>
          <div className="lp-quran-visual reveal" style={{ transitionDelay: '0.12s' }}>
            {verseLoading && !verseError && (
              <>
                <div className="lp-verse-skeleton" style={{ marginBottom: 16 }} />
                <div className="lp-verse-skeleton" style={{ height: 36 }} />
              </>
            )}
            {verseError && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{t('error_quran')}</p>
              </div>
            )}
            {verse && !verseLoading && !verseError && (
              <>
                <p className="lp-verse-arabic ar">{verse.arabic}</p>
                <div className="lp-verse-divider" />
                <p className="lp-verse-trans">{verse.translation}</p>
                <p className="lp-verse-ref">Al-Fatiha 1:1</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Section 5: Final CTA + Footer ── */}
      <section className="lp-final reveal">
        <p className="lp-basmala ar">بسم الله الرحمن الرحيم</p>
        <h2 className="lp-final-title">{t('landing_final_cta')}</h2>
        <button className="lp-cta-btn" onClick={() => navigate('/home')}>
          {t('landing_cta')}
        </button>
      </section>

      <footer className="lp-footer">
        <span className="lp-footer-brand">Noor AI — نور</span>
        <span className="lp-footer-sub">{t('landing_built_for')}</span>
      </footer>

    </div>
  )
}
