import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../i18n/translations'

const TABS = [
  {
    path: '/home', key: 'home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--gold)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: '/coran', key: 'quran',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--gold)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    path: '/prayers', key: 'prayers',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--gold)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    path: '/assistant', key: 'assistant',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--gold)' : 'var(--text-3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  { path: null, key: 'more',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="5"  cy="12" r="1.2" fill={active ? 'var(--gold)' : 'var(--text-3)'}/>
        <circle cx="12" cy="12" r="1.2" fill={active ? 'var(--gold)' : 'var(--text-3)'}/>
        <circle cx="19" cy="12" r="1.2" fill={active ? 'var(--gold)' : 'var(--text-3)'}/>
      </svg>
    ),
  },
]

const DRAWER_ITEMS = [
  {
    path: '/rappels', key: 'reminders',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    path: '/nouveaux-musulmans', key: 'getting_started',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    path: '/tafsir/1:1', key: 'tafsir',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    path: '/calendrier', key: 'calendar',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    path: '/zakat', key: 'zakat',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    path: '/settings', key: 'settings',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
]

export default function BottomNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const t         = useLang()
  const [drawer, setDrawer] = useState(false)

  const drawerPaths    = DRAWER_ITEMS.map(i => i.path)
  const isDrawerRoute  = drawerPaths.some(p => location.pathname.startsWith(p.split('/')[1] === '' ? p : '/' + p.split('/')[1]))

  function handleTab(tab) {
    if (!tab.path) { setDrawer(d => !d); return }
    setDrawer(false)
    navigate(tab.path)
  }

  return (
    <>
      {/* Backdrop */}
      {drawer && (
        <div
          onClick={() => setDrawer(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(26,22,20,.3)', backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Slide-up drawer */}
      <div style={{
        position: 'fixed',
        bottom: 70,
        left: 0,
        right: 0,
        transform: drawer ? 'translateY(0)' : 'translateY(110%)',
        background: 'var(--dark)',
        borderTop: '1px solid rgba(255,255,255,.08)',
        borderRadius: '20px 20px 0 0',
        zIndex: 95,
        transition: 'transform 0.26s cubic-bezier(0.32,0.72,0,1)',
        paddingBottom: 8,
      }}>
        <div style={{ width: 32, height: 3, background: 'rgba(255,255,255,.15)', borderRadius: 2, margin: '10px auto 14px' }}/>
        {DRAWER_ITEMS.map(item => {
          const basePath = '/' + item.path.split('/')[1]
          const isActive = location.pathname.startsWith(basePath)
          return (
            <button
              key={item.key}
              onClick={() => { setDrawer(false); navigate(item.path) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                background: isActive ? 'rgba(201,168,76,.10)' : 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,.07)',
                color: isActive ? 'var(--gold)' : 'rgba(255,255,255,.70)',
                padding: '14px 24px',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.icon}
              {t(item.key)}
            </button>
          )
        })}
      </div>

      {/* Bottom tab bar */}
      <nav className="bottom-nav">
        {TABS.map(tab => {
          const isActive = tab.path
            ? location.pathname === tab.path || location.pathname.startsWith(tab.path + '/')
            : (drawer || isDrawerRoute)

          return (
            <button
              key={tab.key}
              className={`bn-item${isActive ? ' active' : ''}`}
              onClick={() => handleTab(tab)}
            >
              {tab.icon(isActive)}
              <span className="bn-label">{t(tab.key)}</span>
              <div className="bn-dot"/>
            </button>
          )
        })}
      </nav>
    </>
  )
}
