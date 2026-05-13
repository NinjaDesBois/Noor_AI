export default function SoliditeBadge({ value }) {
  const map = {
    sahih: { label: '✓ Sahih',   className: 'badge-sahih' },
    hasan: { label: '◈ Hasan',   className: 'badge-hasan' },
    daif:  { label: "⚠ Da'if",   className: 'badge-daif'  },
    mawdu: { label: "✕ Mawdu'",  className: 'badge-mawdu' },
  }
  const b = map[value?.toLowerCase()] || map.hasan
  return <span className={b.className}>{b.label}</span>
}
