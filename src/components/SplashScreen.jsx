import { useEffect } from 'react'

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--ink)',
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', zIndex:9999 }}>
      <div style={{ fontFamily:'var(--font-arabic)', fontSize:96, color:'var(--gold)',
                    lineHeight:1, animation:'splashIn 1.8s ease forwards' }}>
        نور
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:16, color:'var(--w30)',
                    marginTop:16, letterSpacing:'0.12em',
                    animation:'splashSub 1.8s ease 0.4s both' }}>
        Noor AI
      </div>
      <div style={{ width:48, height:1, background:'linear-gradient(90deg,transparent,var(--gold),transparent)',
                    marginTop:16, animation:'splashSub 1.8s ease 0.7s both' }}/>
      <style>{`
        @keyframes splashIn {
          0%   { opacity:0; transform:scale(0.8); }
          60%  { opacity:1; transform:scale(1.04); }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes splashSub {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}
