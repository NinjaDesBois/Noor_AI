import { useState, useEffect, useContext } from 'react'
import { LangContext, useLang } from '../i18n/translations'
import { getGoldPrice, calculateZakat, calculateZakatFitr } from '../services/zakatService'
import ErrorMessage from '../components/ErrorMessage'

function NumInput({ label, value, onChange, suffix = '€', hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
        <input type="number" min="0" step="any" value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--w)', fontSize: 16, padding: '11px 14px', fontFamily: 'var(--font-body)', outline: 'none' }}/>
        <span style={{ padding: '0 14px', fontSize: 12, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{suffix}</span>
      </div>
      {hint && <div style={{ marginTop: 5, fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{hint}</div>}
    </div>
  )
}

const RECIPIENTS_FR = [
  { ar: 'الفقراء',       label: 'Al-Fuqara — Les pauvres' },
  { ar: 'المساكين',      label: 'Al-Masakin — Les nécessiteux' },
  { ar: 'العاملين عليها',label: 'Al-Amileen — Administrateurs' },
  { ar: 'المؤلفة قلوبهم',label: 'Al-Mu\'allafah — Nouveaux convertis' },
  { ar: 'في الرقاب',     label: 'Ar-Riqab — Affranchissement' },
  { ar: 'الغارمين',      label: 'Al-Gharimeen — Les endettés' },
  { ar: 'في سبيل الله',  label: 'Fi Sabilillah — Voie d\'Allah' },
  { ar: 'ابن السبيل',    label: 'Ibn Al-Sabil — Le voyageur' },
]
const RECIPIENTS_EN = [
  { ar: 'الفقراء',       label: 'Al-Fuqara — The poor' },
  { ar: 'المساكين',      label: 'Al-Masakin — The needy' },
  { ar: 'العاملين عليها',label: 'Al-Amileen — Zakat administrators' },
  { ar: 'المؤلفة قلوبهم',label: 'Al-Mu\'allafah — New Muslims' },
  { ar: 'في الرقاب',     label: 'Ar-Riqab — Freeing captives' },
  { ar: 'الغارمين',      label: 'Al-Gharimeen — Those in debt' },
  { ar: 'في سبيل الله',  label: 'Fi Sabilillah — Cause of Allah' },
  { ar: 'ابن السبيل',    label: 'Ibn Al-Sabil — The wayfarer' },
]

export default function Zakat() {
  const lang = useContext(LangContext)
  const t    = useLang()

  const [step,    setStep]    = useState(0)   // 0=type 1=form 2=result
  const [type,    setType]    = useState(null) // 'mal' | 'fitr'
  const [gold,    setGold]    = useState({ eurPerGram: 85, source: 'indicative', live: false })
  const [goldErr, setGoldErr] = useState(false)

  // Mal inputs
  const [cash,        setCash]        = useState(0)
  const [goldGrams,   setGoldGrams]   = useState(0)
  const [silverGrams, setSilverGrams] = useState(0)
  const [investments, setInvestments] = useState(0)
  const [receivables, setReceivables] = useState(0)
  const [debts,       setDebts]       = useState(0)

  // Fitr input
  const [members, setMembers] = useState(1)

  const [result, setResult] = useState(null)

  useEffect(() => {
    getGoldPrice().then(setGold).catch(() => setGoldErr(true))
  }, [])

  function chooseType(t) {
    setType(t); setStep(1)
  }

  function computeMal() {
    const r = calculateZakat({ cash, goldGrams, silverGrams, investments, receivables, debts, goldPricePerGram: gold.eurPerGram })
    setResult(r); setStep(2)
  }

  function computeFitr() {
    const r = calculateZakatFitr(members)
    setResult(r); setStep(2)
  }

  function reset() { setStep(0); setType(null); setResult(null) }

  const fmtEur = n => `${n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

  const RECIPIENTS = lang === 'fr' ? RECIPIENTS_FR : RECIPIENTS_EN

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--w)', marginBottom: 2 }}>{t('zakat')}</div>
        <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 18, color: 'var(--gold)', direction: 'rtl', textAlign: 'right' }}>الزكاة</div>
      </div>

      {/* Gold price banner */}
      <div style={{ margin: '0 16px 16px', padding: '10px 14px', background: 'var(--gold-a06)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{t('gold_price_source')}</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 14, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{gold.eurPerGram.toFixed(2)} €/g</span>
          <div style={{ fontSize: 9, color: gold.live ? 'var(--em)' : 'var(--w30)', fontFamily: 'var(--font-mono)' }}>{gold.live ? 'LIVE' : t('indicative_price')}</div>
        </div>
      </div>

      {/* STEP 0 — Type selection */}
      {step === 0 && (
        <div style={{ margin: '0 16px' }}>
          {[{ id: 'mal', ar: 'زكاة المال', labelKey: 'zakat_mal', desc_fr: "Sur l'épargne, l'or, les investissements", desc_en: "On savings, gold, investments" },
            { id: 'fitr', ar: 'زكاة الفطر', labelKey: 'zakat_fitr', desc_fr: "Applicable avant l'Aïd Al-Fitr", desc_en: "Due before Eid Al-Fitr" }
          ].map(opt => (
            <button key={opt.id} onClick={() => chooseType(opt.id)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 12, cursor: 'pointer' }}>
              <div className="ar" style={{ fontSize: 20, color: 'var(--gold)', marginBottom: 6 }}>{opt.ar}</div>
              <div style={{ fontSize: 15, color: 'var(--w)', fontWeight: 500 }}>{t(opt.labelKey)}</div>
              <div style={{ fontSize: 12, color: 'var(--w30)', marginTop: 4 }}>{lang === 'fr' ? opt.desc_fr : opt.desc_en}</div>
            </button>
          ))}
        </div>
      )}

      {/* STEP 1a — Mal form */}
      {step === 1 && type === 'mal' && (
        <div style={{ margin: '0 16px' }}>
          <div className="card" style={{ marginBottom: 12 }}>
            <NumInput label={t('cash_savings')}   value={cash}        onChange={setCash}/>
            <NumInput label={t('gold_grams')}      value={goldGrams}   onChange={setGoldGrams}   suffix="g"
              hint={`≈ ${fmtEur(goldGrams * gold.eurPerGram)}`}/>
            <NumInput label={t('silver_grams')}    value={silverGrams} onChange={setSilverGrams}  suffix="g"/>
            <NumInput label={t('investments')}     value={investments} onChange={setInvestments}/>
            <NumInput label={t('receivables')}     value={receivables} onChange={setReceivables}/>
            <NumInput label={t('debts')}           value={debts}       onChange={setDebts}/>
          </div>
          <button onClick={computeMal}
            style={{ width: '100%', padding: '14px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--r-md)', color: 'var(--ink)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {lang === 'fr' ? 'Calculer' : 'Calculate'}
          </button>
        </div>
      )}

      {/* STEP 1b — Fitr form */}
      {step === 1 && type === 'fitr' && (
        <div style={{ margin: '0 16px' }}>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--w60)', marginBottom: 16 }}>
              {lang === 'fr' ? 'Entrez le nombre de membres de votre foyer.' : 'Enter the number of people in your household.'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <button onClick={() => setMembers(m => Math.max(1, m - 1))}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--w)', fontSize: 20, cursor: 'pointer' }}>−</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--gold)' }}>{members}</div>
                <div style={{ fontSize: 11, color: 'var(--w30)' }}>{t('family_members')}</div>
              </div>
              <button onClick={() => setMembers(m => m + 1)}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--w)', fontSize: 20, cursor: 'pointer' }}>+</button>
            </div>
          </div>
          <button onClick={computeFitr}
            style={{ width: '100%', padding: '14px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--r-md)', color: 'var(--ink)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {lang === 'fr' ? 'Calculer' : 'Calculate'}
          </button>
        </div>
      )}

      {/* STEP 2 — Results */}
      {step === 2 && result && type === 'mal' && (
        <div style={{ margin: '0 16px' }}>
          {/* Main result */}
          <div className="card" style={{ textAlign: 'center', marginBottom: 12 }}>
            {result.obligatory ? (
              <>
                <div style={{ fontSize: 12, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{t('zakat_due')}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--gold)' }}>{fmtEur(result.zakatDue)}</div>
                <div style={{ fontSize: 11, color: 'var(--w30)', marginTop: 4 }}>2.5% × {fmtEur(result.totalWealth)}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, color: 'var(--em)', marginBottom: 4 }}>{t('not_obligatory')}</div>
                <div style={{ fontSize: 12, color: 'var(--w30)' }}>{lang === 'fr' ? `Patrimoine ${fmtEur(result.totalWealth)} < Nisab ${fmtEur(result.nisab)}` : `Wealth ${fmtEur(result.totalWealth)} < Nisab ${fmtEur(result.nisab)}`}</div>
              </>
            )}
          </div>

          {/* Breakdown */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>{t('total_wealth')}</div>
            {[
              { label: t('cash_savings'),  val: result.breakdown.totalAssets - result.breakdown.goldValue - result.breakdown.silverValue },
              { label: t('gold_grams'),    val: result.breakdown.goldValue },
              { label: t('silver_grams'),  val: result.breakdown.silverValue },
            ].filter(r => r.val > 0).map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--w60)' }}>{r.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--w)' }}>{fmtEur(r.val)}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--w60)' }}>{t('nisab')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)' }}>{fmtEur(result.nisab)}</span>
            </div>
          </div>

          {/* Recipients Quran 9:60 */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>{lang === 'fr' ? 'Bénéficiaires — Coran 9:60' : 'Recipients — Quran 9:60'}</div>
            {RECIPIENTS.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="ar" style={{ fontSize: 14, color: 'var(--gold)', minWidth: 90 }}>{r.ar}</span>
                <span style={{ fontSize: 12, color: 'var(--w30)' }}>{r.label.split(' — ')[1]}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 14px', background: 'rgba(201,168,76,.05)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 11, color: 'var(--w30)', marginBottom: 12 }}>
            {lang === 'fr' ? 'Ce calculateur est indicatif. Consultez un érudit pour votre situation personnelle.' : 'This calculator is indicative. Consult a scholar for your personal situation.'}
          </div>

          <button onClick={reset}
            style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--w60)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {lang === 'fr' ? 'Nouveau calcul' : 'New calculation'}
          </button>
        </div>
      )}

      {step === 2 && result && type === 'fitr' && (
        <div style={{ margin: '0 16px' }}>
          <div className="card" style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--w30)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{t('zakat_fitr_amount')}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: 'var(--gold)' }}>{fmtEur(result.total)}</div>
            <div style={{ fontSize: 12, color: 'var(--w30)', marginTop: 4 }}>{members} × {fmtEur(result.perPerson)}</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'rgba(201,168,76,.05)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 11, color: 'var(--w30)', marginBottom: 12 }}>
            {lang === 'fr' ? 'Recommandation CECF pour l\'Europe occidentale : 8 €/personne.' : 'ECFR recommendation for Western Europe: €8/person.'}
          </div>
          <button onClick={reset}
            style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--w60)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {lang === 'fr' ? 'Nouveau calcul' : 'New calculation'}
          </button>
        </div>
      )}

      {/* Back button on step 1 */}
      {step === 1 && (
        <button onClick={() => setStep(0)}
          style={{ display: 'block', margin: '12px 16px 0', background: 'transparent', border: 'none', color: 'var(--w30)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          ← {lang === 'fr' ? 'Retour' : 'Back'}
        </button>
      )}
    </div>
  )
}
