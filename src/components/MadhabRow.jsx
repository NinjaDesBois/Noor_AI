function Dot({ color }) {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" style={{ flexShrink:0 }}>
      <circle cx="3.5" cy="3.5" r="3.5" fill={color}/>
    </svg>
  )
}

export default function MadhabRow({ hanafi, maliki, shafii, hanbali }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
      {hanafi  && (
        <span className="mb-hanafi" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
          <Dot color="#5aaff8"/> Hanafi — {hanafi}
        </span>
      )}
      {maliki  && (
        <span className="mb-maliki" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
          <Dot color="#33d17a"/> Maliki — {maliki}
        </span>
      )}
      {shafii  && (
        <span className="mb-shafii" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
          <Dot color="#f0c040"/> Shafi'i — {shafii}
        </span>
      )}
      {hanbali && (
        <span className="mb-hanbali" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
          <Dot color="#e06060"/> Hanbali — {hanbali}
        </span>
      )}
    </div>
  )
}
