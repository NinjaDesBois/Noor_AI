export default function IllustrationSlot({ label, src }) {
  if (src) {
    return (
      <img
        src={src}
        alt={label}
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--r-lg)', display: 'block' }}
      />
    )
  }
  return (
    <div style={{
      width: '100%',
      height: '200px',
      background: 'var(--border)',
      borderRadius: 'var(--r-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 8,
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'var(--font-body)' }}>{label}</span>
    </div>
  )
}
