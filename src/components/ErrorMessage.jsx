export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{ margin:'20px', padding:'16px 20px', background:'rgba(220,50,50,.08)',
                  border:'1px solid rgba(220,50,50,.2)', borderRadius:'var(--r-md)',
                  textAlign:'center' }}>
      <p style={{ color:'#e05050', fontSize:13, marginBottom: onRetry ? 12 : 0 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          style={{ background:'transparent', border:'1px solid rgba(220,50,50,.3)',
                   color:'#e05050', borderRadius:8, padding:'6px 16px',
                   fontSize:12, cursor:'pointer', fontFamily:'var(--font-mono)' }}>
          Retry
        </button>
      )}
    </div>
  )
}
