import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useLang, LangContext } from '../i18n/translations'
import ErrorMessage from '../components/ErrorMessage'
import IllustrationSlot from '../components/IllustrationSlot'
import { getSurahVerses } from '../services/quranService'

const PROGRESS_KEY = 'noor_beginner_progress'

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconWater() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  )
}

function IconPrayer() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M4 21V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v12"/>
      <path d="M9 21v-6h6v6"/>
      <path d="M8 8V7a4 4 0 0 1 8 0v1"/>
    </svg>
  )
}

function IconShahada() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-9 9M3 12a9 9 0 0 1 9-9"/>
      <path d="M14.5 9a4.5 4.5 0 1 1-5 7.5"/>
      <polygon points="19,2 20.5,6 24,6 21.2,8.2 22.3,12 19,9.8 15.7,12 16.8,8.2 14,6 17.5,6"/>
    </svg>
  )
}

function IconPillars() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2"  y="8"  width="2.5" height="12" rx="1"/>
      <rect x="6"  y="5"  width="2.5" height="15" rx="1"/>
      <rect x="11" y="2"  width="2.5" height="18" rx="1"/>
      <rect x="16" y="5"  width="2.5" height="15" rx="1"/>
      <rect x="20" y="8"  width="2.5" height="12" rx="1"/>
      <line x1="1" y1="21" x2="23" y2="21"/>
    </svg>
  )
}

function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

function IconScale() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"/>
      <path d="M3 8h18"/>
      <path d="M4 8l2 6a3 3 0 0 0 6 0l2-6"/>
      <path d="M10 8l2 6a3 3 0 0 0 6 0l2-6"/>
      <line x1="9" y1="21" x2="15" y2="21"/>
    </svg>
  )
}

function IconHands() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11V6a2 2 0 0 1 4 0v5"/>
      <path d="M5 14V9a2 2 0 0 1 4 0"/>
      <path d="M13 13V9a2 2 0 0 1 4 0v5"/>
      <path d="M5 14a5 5 0 0 0 10 0v-1"/>
    </svg>
  )
}

// ── Module definitions ────────────────────────────────────────────────────────

const MODULES = [
  { id: 'wudu',        frTitle: 'Les ablutions (Wudu)',    enTitle: 'Ablutions (Wudu)',     frDesc: 'Purification rituelle avant la prière',    enDesc: 'Ritual purification before prayer',     Icon: IconWater   },
  { id: 'prayer',      frTitle: 'La prière (Salat)',       enTitle: 'The Prayer (Salat)',   frDesc: 'Les 5 prières quotidiennes obligatoires',  enDesc: 'The 5 obligatory daily prayers',         Icon: IconPrayer  },
  { id: 'shahada',     frTitle: 'La Chahada',              enTitle: 'The Shahada',          frDesc: 'La déclaration de foi',                    enDesc: 'The declaration of faith',               Icon: IconShahada },
  { id: 'pillars',     frTitle: 'Les 5 piliers',           enTitle: 'The 5 Pillars',        frDesc: "Les fondements de l'islam",                enDesc: 'The foundations of Islam',               Icon: IconPillars },
  { id: 'quran-intro', frTitle: 'Lire le Coran',           enTitle: 'Reading the Quran',   frDesc: 'Structure et lecture du Coran',            enDesc: 'Structure and reading of the Quran',     Icon: IconBook    },
  { id: 'halal',       frTitle: 'Halal & Haram',           enTitle: 'Halal & Haram',        frDesc: "Permis et interdit en islam",              enDesc: 'Permitted and forbidden in Islam',       Icon: IconScale   },
  { id: 'dua',         frTitle: 'Les invocations (Dua)',   enTitle: 'Supplications (Dua)', frDesc: 'Les invocations quotidiennes essentielles', enDesc: 'Essential daily supplications',          Icon: IconHands   },
]

// ── Wudu steps data ───────────────────────────────────────────────────────────

const WUDU_STEPS = [
  { num: 1, ar: 'النِّيَّة', frName: "L'intention", enName: 'Intention', frDesc: "Formuler mentalement l'intention d'accomplir le wudu pour la prière. Dire Bismillah.", enDesc: 'Form the mental intention to perform wudu for prayer. Say Bismillah.' },
  { num: 2, ar: 'غَسْلُ الْيَدَيْنِ', frName: 'Lavage des mains', enName: 'Wash hands', frDesc: 'Laver les deux mains jusqu\'aux poignets, 3 fois, en passant entre les doigts.', enDesc: 'Wash both hands up to the wrists 3 times, running water between the fingers.' },
  { num: 3, ar: 'الْمَضْمَضَة', frName: 'Rinçage de la bouche', enName: 'Rinse the mouth', frDesc: 'Se rincer la bouche en faisant circuler l\'eau, 3 fois.', enDesc: 'Rinse the mouth with water, swirling it around, 3 times.' },
  { num: 4, ar: 'الاسْتِنْشَاق', frName: 'Rinçage du nez', enName: 'Rinse the nose', frDesc: 'Aspirer de l\'eau dans le nez avec la main droite, puis le moucher avec la gauche, 3 fois.', enDesc: 'Inhale water into the nose with the right hand, then blow it out with the left, 3 times.' },
  { num: 5, ar: 'غَسْلُ الْوَجْه', frName: 'Lavage du visage', enName: 'Wash the face', frDesc: 'Laver entièrement le visage 3 fois — du front au menton, d\'une oreille à l\'autre.', enDesc: 'Wash the entire face 3 times — from forehead to chin, ear to ear.' },
  { num: 6, ar: 'غَسْلُ الْيَدَيْنِ إِلَى الْمِرْفَقَيْن', frName: 'Lavage des bras', enName: 'Wash the arms', frDesc: 'Laver le bras droit jusqu\'au coude inclus, 3 fois. Répéter pour le bras gauche.', enDesc: 'Wash the right arm up to and including the elbow 3 times. Repeat for the left arm.' },
  { num: 7, ar: 'مَسْحُ الرَّأْس', frName: 'Essuyage de la tête', enName: 'Wipe the head', frDesc: 'Passer les deux mains mouillées sur la tête une fois, de l\'avant vers l\'arrière, puis de l\'arrière vers l\'avant.', enDesc: 'Pass both wet hands over the head once, front to back, then back to front.' },
  { num: 8, ar: 'مَسْحُ الْأُذُنَيْن', frName: 'Essuyage des oreilles', enName: 'Wipe the ears', frDesc: 'Essuyer les deux oreilles une fois avec les index (à l\'intérieur) et les pouces (à l\'extérieur).', enDesc: 'Wipe both ears once using the index fingers (inside) and thumbs (outside).' },
  { num: 9, ar: 'غَسْلُ الْقَدَمَيْن', frName: 'Lavage des pieds', enName: 'Wash the feet', frDesc: 'Laver le pied droit jusqu\'à la cheville incluse, 3 fois. Répéter pour le pied gauche.', enDesc: 'Wash the right foot up to and including the ankle 3 times. Repeat for the left foot.' },
]

// ── Prayer fard acts ──────────────────────────────────────────────────────────

const PRAYER_FARD = [
  { fr: 'L\'intention (niyyah)',                                      en: 'Intention (niyyah)' },
  { fr: 'Être en état de pureté rituelle (wudu ou ghusl)',           en: 'Being in ritual purity (wudu or ghusl)' },
  { fr: 'Purité des vêtements, du corps et du lieu de prière',       en: 'Purity of clothing, body and prayer place' },
  { fr: "Couvrir l'awra (parties intimes)",                          en: 'Covering the awra' },
  { fr: 'Faire face à la Qibla (direction de La Mecque)',            en: 'Facing the Qibla (direction of Mecca)' },
  { fr: 'Prier aux temps prescrits',                                 en: 'Praying at the prescribed times' },
  { fr: 'La position debout (qiyam) pour ceux qui en ont la capacité', en: 'Standing (qiyam) for those who are able' },
  { fr: 'Le takbir d\'ouverture (Allahu Akbar)',                     en: 'Opening takbir (Allahu Akbar)' },
  { fr: 'La récitation de la Fatiha dans chaque rak\'a',            en: "Recitation of Al-Fatiha in every rak'a" },
  { fr: "L'inclinaison (ruku') avec tranquillité",                  en: "Bowing (ruku') with tranquility" },
  { fr: 'Le redressement complet après le ruku\'',                  en: "Rising fully from ruku'" },
  { fr: 'La prosternation (sujud) deux fois par rak\'a avec tranquillité', en: "Prostration (sujud) twice per rak'a with tranquility" },
  { fr: 'S\'asseoir entre les deux prosternations',                  en: 'Sitting between the two prostrations' },
  { fr: "L'assise finale (qa'da akhira)",                           en: "Final sitting (qa'da akhira)" },
  { fr: 'Le tachahoud dans l\'assise finale',                       en: 'Tashahud in the final sitting' },
  { fr: 'La prière sur le Prophète ﷺ (Allahumma salli)',            en: 'Prayer upon the Prophet ﷺ (Allahumma salli)' },
  { fr: 'Le salut final (taslim) à droite',                         en: 'Final salutation (taslim) to the right' },
]

// ── Five Pillars data ─────────────────────────────────────────────────────────

const FIVE_PILLARS = [
  { id: 'shahada', ar: 'الشَّهَادَة',  frName: 'La Chahada',         enName: 'The Shahada',         frDesc: "Témoigner qu'il n'y a de divinité qu'Allah et que Muhammad ﷺ est Son messager.",            enDesc: 'Bearing witness that there is no god but Allah and that Muhammad ﷺ is His messenger.',       link: null       },
  { id: 'salat',   ar: 'الصَّلَاة',    frName: 'La Prière',          enName: 'The Prayer',          frDesc: 'Accomplir les 5 prières quotidiennes obligatoires aux temps prescrits.',                   enDesc: 'Performing the 5 obligatory daily prayers at their prescribed times.',                       link: '/prayers' },
  { id: 'zakat',   ar: 'الزَّكَاة',    frName: 'La Zakat',           enName: 'Almsgiving',          frDesc: 'Donner 2,5% de son patrimoine zakatable aux nécessiteux, une fois par an.',                enDesc: 'Giving 2.5% of one\'s zakatable wealth to those in need, once per year.',                   link: '/zakat'   },
  { id: 'sawm',    ar: 'الصَّوْم',     frName: 'Le Jeûne (Sawm)',    enName: 'Fasting (Sawm)',      frDesc: 'Jeûner du lever au coucher du soleil pendant tout le mois de Ramadan.',                    enDesc: 'Fasting from dawn to sunset throughout the entire month of Ramadan.',                        link: null       },
  { id: 'hajj',    ar: 'الْحَجّ',      frName: 'Le Pèlerinage (Hajj)', enName: 'Pilgrimage (Hajj)', frDesc: 'Effectuer le pèlerinage à La Mecque au moins une fois dans sa vie, si on en a la capacité.', enDesc: 'Performing the pilgrimage to Mecca at least once in a lifetime, for those who are able.', link: null       },
]

// ── Daily Duas data ───────────────────────────────────────────────────────────

const DUAS = [
  { id: 'eating',    frOcc: 'Avant de manger',         enOcc: 'Before eating',       ar: 'بِسْمِ اللَّهِ',                                       trans: 'Bismillāh',                                     fr: 'Au nom d\'Allah',                               en: 'In the name of Allah' },
  { id: 'after',     frOcc: 'Après avoir mangé',        enOcc: 'After eating',        ar: 'الْحَمْدُ لِلَّهِ',                                    trans: 'Alḥamdu lillāh',                                fr: 'Louange à Allah',                               en: 'Praise be to Allah' },
  { id: 'sleep',     frOcc: 'Avant de dormir',          enOcc: 'Before sleeping',     ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',              trans: 'Bismika Allāhumma amūtu wa-aḥyā',              fr: 'En Ton nom, ô Allah, je meurs et je vis',       en: 'In Your name, O Allah, I die and I live' },
  { id: 'waking',    frOcc: 'Au réveil',                enOcc: 'Upon waking',         ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا',                 trans: 'Alḥamdu lillāhi alladhī aḥyānā',              fr: 'Louange à Allah qui nous a redonné la vie',     en: 'Praise be to Allah who gave us life again' },
  { id: 'home',      frOcc: 'En entrant à la maison',   enOcc: 'When entering home',  ar: 'بِسْمِ اللَّهِ وَلَجْنَا',                             trans: 'Bismillāhi walajna',                           fr: 'Au nom d\'Allah, nous entrons',                 en: 'In the name of Allah, we enter' },
]

// ── Shared UI sub-components ──────────────────────────────────────────────────

function StepBadge({ num }) {
  return (
    <div style={{
      width: 28, height: 28,
      borderRadius: '50%',
      background: 'var(--gold)',
      color: 'white',
      fontWeight: 700,
      fontSize: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {num}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--text-1)',
      marginBottom: 16,
      marginTop: 28,
    }}>
      {children}
    </h2>
  )
}

function InfoCard({ children, accent }) {
  return (
    <div style={{
      background: accent === 'em' ? 'rgba(34,196,138,.06)' : accent === 'warn' ? 'rgba(255,160,0,.06)' : 'rgba(201,168,76,.06)',
      border: `1px solid ${accent === 'em' ? 'rgba(34,196,138,.18)' : accent === 'warn' ? 'rgba(255,160,0,.18)' : 'rgba(201,168,76,.18)'}`,
      borderRadius: 'var(--r-md)',
      padding: '14px 18px',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function DetailHeader({ onBack, title, lang }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-3)',
          fontSize: 13,
          padding: '0 0 18px',
          fontFamily: 'var(--font-body)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {lang === 'fr' ? '← Retour' : '← Back'}
      </button>
      <h1 className="page-title" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
    </div>
  )
}

function MarkLearnedBtn({ done, onMarkLearned, lang }) {
  return (
    <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
      <button
        onClick={!done ? onMarkLearned : undefined}
        style={{
          background: done ? 'rgba(34,196,138,.25)' : 'var(--em)',
          color: done ? '#15a06e' : 'white',
          border: done ? '1px solid rgba(34,196,138,.3)' : 'none',
          borderRadius: 'var(--r-md)',
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 600,
          cursor: done ? 'default' : 'pointer',
          fontFamily: 'var(--font-body)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          transition: 'background 0.2s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {done
          ? (lang === 'fr' ? 'Module complété' : 'Module completed')
          : (lang === 'fr' ? 'Marquer comme appris' : 'Mark as learned')}
      </button>
    </div>
  )
}

// ── Module card ───────────────────────────────────────────────────────────────

function ModuleCard({ mod, lang, done, onClick }) {
  return (
    <div
      className="mod-item"
      onClick={onClick}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {done && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: 'var(--em)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}
      <div className="mod-icon mod-icon-gold">
        <mod.Icon />
      </div>
      <div className="mod-name">{lang === 'fr' ? mod.frTitle : mod.enTitle}</div>
      <div className="mod-sub">{lang === 'fr' ? mod.frDesc : mod.enDesc}</div>
      <button style={{
        marginTop: 4,
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-sm)',
        padding: '5px 12px',
        fontSize: 11,
        color: 'var(--gold)',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        alignSelf: 'flex-start',
        letterSpacing: '0.04em',
      }}>
        {lang === 'fr' ? 'Commencer' : 'Start'}
      </button>
    </div>
  )
}

// ── Wudu detail ───────────────────────────────────────────────────────────────

function WuduDetail({ lang, done, onMarkLearned, onBack }) {
  return (
    <div>
      <DetailHeader onBack={onBack} lang={lang} title={lang === 'fr' ? 'Les ablutions (Wudu)' : 'Ablutions (Wudu)'} />

      <IllustrationSlot label={lang === 'fr' ? 'Illustration à venir' : 'Illustration coming soon'} />

      <SectionTitle>{lang === 'fr' ? 'Les étapes du wudu' : 'Steps of wudu'}</SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {WUDU_STEPS.map(step => (
          <div key={step.num} className="card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <StepBadge num={step.num} />
            <div style={{ flex: 1 }}>
              <p className="ar" style={{ fontSize: 20, marginBottom: 6 }}>{step.ar}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>
                {lang === 'fr' ? step.frName : step.enName}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                {lang === 'fr' ? step.frDesc : step.enDesc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>{lang === 'fr' ? 'Le wudu est invalidé par…' : 'Wudu is invalidated by…'}</SectionTitle>
      <InfoCard accent="warn">
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(lang === 'fr'
            ? ["Toute sortie naturelle (urine, selles, gaz)", "Un sommeil profond (perte de conscience)", "La perte de connaissance ou l'évanouissement", "Le plaisir sexuel ou l'orgasme", "Toucher ses parties intimes directement (selon la majorité des savants)"]
            : ["Any natural discharge (urine, stool, gas)", "Deep sleep (loss of consciousness)", "Fainting or loss of consciousness", "Sexual pleasure or orgasm", "Touching one's private parts directly (per majority of scholars)"]
          ).map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </InfoCard>

      <MarkLearnedBtn done={done} onMarkLearned={onMarkLearned} lang={lang} />
    </div>
  )
}

// ── Prayer detail ─────────────────────────────────────────────────────────────

function PrayerDetail({ lang, done, onMarkLearned, onBack }) {
  const [fatiha, setFatiha] = useState(null)
  const [fatihaErr, setFatihaErr] = useState(null)

  useEffect(() => {
    getSurahVerses(1, lang)
      .then(verses => setFatiha(verses))
      .catch(() => setFatihaErr(
        lang === 'fr'
          ? 'Al-Fatiha indisponible — vérifiez votre connexion'
          : 'Al-Fatiha unavailable — check your connection'
      ))
  }, [lang])

  return (
    <div>
      <DetailHeader onBack={onBack} lang={lang} title={lang === 'fr' ? 'La prière (Salat)' : 'The Prayer (Salat)'} />

      <IllustrationSlot label={lang === 'fr' ? 'Illustration à venir' : 'Illustration coming soon'} />

      <SectionTitle>{lang === 'fr' ? 'Conditions préalables' : 'Prerequisites'}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {(lang === 'fr'
          ? ['Avoir le wudu (ablutions)', 'Être en état de pureté corporelle', 'Porter des vêtements propres qui couvrent l\'awra', 'Se diriger vers la Qibla (direction de La Mecque)']
          : ['Having wudu (ablutions)', 'Being in a state of bodily purity', 'Wearing clean clothing that covers the awra', 'Facing the Qibla (direction of Mecca)']
        ).map((cond, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--em)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {cond}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <Link to="/prayers" style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {lang === 'fr' ? 'Voir les horaires de prière' : 'See prayer times'}
        </Link>
      </div>

      <SectionTitle>{lang === 'fr' ? 'Les 17 actes obligatoires (fard)' : 'The 17 obligatory acts (fard)'}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PRAYER_FARD.map((act, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <StepBadge num={i + 1} />
            <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6, paddingTop: 4 }}>
              {lang === 'fr' ? act.fr : act.en}
            </p>
          </div>
        ))}
      </div>

      <SectionTitle>{lang === 'fr' ? 'Récitation de la Fatiha' : 'Recitation of Al-Fatiha'}</SectionTitle>
      <InfoCard accent="gold">
        <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>
          {lang === 'fr' ? 'Sourate Al-Fatiha (1:1-7) — récitée dans chaque rak\'a' : "Surah Al-Fatiha (1:1-7) — recited in every rak'a"}
        </p>
        {fatihaErr && <ErrorMessage message={fatihaErr} />}
        {!fatihaErr && !fatiha && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-4)', fontSize: 13 }}>
            {lang === 'fr' ? 'Chargement…' : 'Loading…'}
          </div>
        )}
        {fatiha && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {fatiha.map(v => (
              <div key={v.number} style={{ paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(201,168,76,.15)',
                    color: 'var(--gold)',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{v.number}</span>
                </div>
                <p className="ar" style={{ fontSize: 22, marginBottom: 8 }}>{v.arabic}</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, fontStyle: 'italic' }}>{v.translation}</p>
              </div>
            ))}
          </div>
        )}
      </InfoCard>

      <MarkLearnedBtn done={done} onMarkLearned={onMarkLearned} lang={lang} />
    </div>
  )
}

// ── Shahada detail ────────────────────────────────────────────────────────────

function ShahadaDetail({ lang, done, onMarkLearned, onBack }) {
  return (
    <div>
      <DetailHeader onBack={onBack} lang={lang} title={lang === 'fr' ? 'La Chahada' : 'The Shahada'} />

      <div className="card" style={{ textAlign: 'center', padding: '28px 22px' }}>
        <p className="ar" style={{ fontSize: 26, lineHeight: 2.2, color: 'var(--text-1)' }}>
          أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ ٱللَّهِ
        </p>
        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'var(--gold)', marginTop: 16, letterSpacing: '0.04em', lineHeight: 1.8 }}>
          Ash-hadu an lā ilāha illā Allāh,<br/>
          wa-ash-hadu anna Muḥammadan rasūlu Allāh
        </p>
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }}/>
        <p style={{ fontSize: 14, color: 'var(--text-2)', fontStyle: 'italic', lineHeight: 1.7 }}>
          {lang === 'fr'
            ? "Je témoigne qu'il n'y a de divinité qu'Allah, et je témoigne que Muhammad est le messager d'Allah."
            : "I bear witness that there is no god but Allah, and I bear witness that Muhammad is the messenger of Allah."}
        </p>
      </div>

      <SectionTitle>{lang === 'fr' ? 'Les deux parties' : 'The two parts'}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <InfoCard accent="gold">
          <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {lang === 'fr' ? 'Tawhid — L\'unicité d\'Allah' : "Tawhid — Allah's Oneness"}
          </p>
          <p className="ar" style={{ fontSize: 20, marginBottom: 8 }}>لَا إِلَٰهَ إِلَّا ٱللَّهُ</p>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {lang === 'fr'
              ? "Il n'y a de divinité digne d'adoration qu'Allah. Cela affirme l'unicité absolue de Dieu — aucun associé, aucune image, aucun intermédiaire."
              : "There is no deity worthy of worship except Allah. This affirms the absolute oneness of God — no partners, no images, no intermediaries."}
          </p>
        </InfoCard>
        <InfoCard accent="gold">
          <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {lang === 'fr' ? 'Risala — La prophétie de Muhammad ﷺ' : "Risala — Muhammad's ﷺ Prophethood"}
          </p>
          <p className="ar" style={{ fontSize: 20, marginBottom: 8 }}>مُحَمَّدٌ رَسُولُ ٱللَّهِ</p>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {lang === 'fr'
              ? "Muhammad ﷺ est le messager d'Allah et le sceau des prophètes. Accepter ses enseignements et suivre sa sunna fait partie de la foi."
              : "Muhammad ﷺ is the messenger of Allah and the seal of the prophets. Accepting his teachings and following his Sunnah is part of faith."}
          </p>
        </InfoCard>
      </div>

      <SectionTitle>{lang === 'fr' ? 'Prononcer la Chahada' : 'Pronouncing the Shahada'}</SectionTitle>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(lang === 'fr' ? [
          "La Chahada est la porte d'entrée dans l'islam. Prononcée sincèrement et avec compréhension, elle marque le début d'une nouvelle vie.",
          "Elle doit être dite devant témoins, de préférence accompagnée de la ghusl (grande ablution) et de la prière.",
          "La Chahada est renouvelée dans chaque prière (tachahoud) — c'est un rappel constant de l'engagement envers Allah et Son messager ﷺ."
        ] : [
          "The Shahada is the gateway into Islam. Spoken sincerely and with understanding, it marks the beginning of a new life.",
          "It should be said in front of witnesses, preferably accompanied by ghusl (full purification) and prayer.",
          "The Shahada is renewed in every prayer (tashahud) — it is a constant reminder of the commitment to Allah and His messenger ﷺ."
        ]).map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 3 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <p>{text}</p>
          </div>
        ))}
      </div>

      <MarkLearnedBtn done={done} onMarkLearned={onMarkLearned} lang={lang} />
    </div>
  )
}

// ── Pillars detail ────────────────────────────────────────────────────────────

function PillarsDetail({ lang, done, onMarkLearned, onBack }) {
  return (
    <div>
      <DetailHeader onBack={onBack} lang={lang} title={lang === 'fr' ? 'Les 5 piliers de l\'islam' : 'The 5 Pillars of Islam'} />

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="ar" style={{ fontSize: 20, textAlign: 'right', marginBottom: 8 }}>
          بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', fontStyle: 'italic' }}>
          {lang === 'fr'
            ? "« L'islam est bâti sur cinq piliers » — Sahih Al-Bukhari 8, Sahih Muslim 16"
            : "«Islam is built upon five pillars» — Sahih Al-Bukhari 8, Sahih Muslim 16"}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FIVE_PILLARS.map((pillar, i) => (
          <div key={pillar.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 18px' }}>
            <StepBadge num={i + 1} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>
                  {lang === 'fr' ? pillar.frName : pillar.enName}
                </span>
                <span className="ar" style={{ fontSize: 16, color: 'var(--gold)' }}>{pillar.ar}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: pillar.link ? 10 : 0 }}>
                {lang === 'fr' ? pillar.frDesc : pillar.enDesc}
              </p>
              {pillar.link && (
                <Link to={pillar.link} style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {lang === 'fr' ? 'En savoir plus' : 'Learn more'}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <MarkLearnedBtn done={done} onMarkLearned={onMarkLearned} lang={lang} />
    </div>
  )
}

// ── Quran intro detail ────────────────────────────────────────────────────────

function QuranIntroDetail({ lang, done, onMarkLearned, onBack }) {
  return (
    <div>
      <DetailHeader onBack={onBack} lang={lang} title={lang === 'fr' ? 'Lire le Coran' : 'Reading the Quran'} />

      <SectionTitle>{lang === 'fr' ? 'Structure du Coran' : 'Structure of the Quran'}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {[
          { label: lang === 'fr' ? '114 sourates' : '114 surahs', desc: lang === 'fr' ? 'Le Coran est divisé en 114 chapitres (sourates), de longueurs très variables.' : 'The Quran is divided into 114 chapters (surahs) of varying lengths.' },
          { label: lang === 'fr' ? '6 236 versets' : '6,236 verses', desc: lang === 'fr' ? "Chaque sourate est divisée en versets (āyat — littéralement « signes »). Le nombre total est de 6 236." : 'Each surah is divided into verses (āyāt — literally "signs"). The total is 6,236.' },
          { label: lang === 'fr' ? '30 parties (juz\')' : "30 parts (juz')", desc: lang === 'fr' ? "Le Coran est aussi divisé en 30 parties égales (juz') pour faciliter la lecture en un mois." : "The Quran is also divided into 30 equal parts (juz') to facilitate reading in a month." },
          { label: lang === 'fr' ? 'Makkiyya / Madaniyya' : 'Meccan / Medinan', desc: lang === 'fr' ? "Les sourates révélées à La Mecque traitent surtout de la foi et de l'au-delà. Celles de Médine abordent les règles sociales et juridiques." : 'Surahs revealed in Mecca focus mainly on faith and the hereafter. Those from Medina address social and legal rulings.' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 6 }}/>
            <div>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{item.label} — </span>
              <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>{lang === 'fr' ? 'Lire l\'arabe du Coran' : 'Reading Quranic Arabic'}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {(lang === 'fr' ? [
          { t: 'De droite à gauche', d: "L'arabe se lit de droite à gauche, contrairement aux langues occidentales." },
          { t: 'Les voyelles (tashkil)', d: "Les voyelles courtes sont écrites comme petits signes au-dessus ou en dessous des lettres. Dans le Coran, elles sont toujours présentes pour garantir une récitation exacte." },
          { t: 'Le tajwid', d: "Les règles de tajwid définissent la prononciation correcte de chaque lettre et les règles d'élongation. Les apprendre améliore grandement la récitation." },
          { t: 'Commencer par la Fatiha', d: "La première sourate (Al-Fatiha) est un excellent point de départ. Elle est courte, répétée dans chaque prière, et contient les fondements de la foi." },
        ] : [
          { t: 'Right to left', d: 'Arabic is read from right to left, unlike Western languages.' },
          { t: 'Vowels (tashkil)', d: 'Short vowels are written as small marks above or below letters. In the Quran, they are always present to ensure accurate recitation.' },
          { t: 'Tajwid', d: 'Tajwid rules define the correct pronunciation of each letter and elongation rules. Learning them greatly improves recitation.' },
          { t: 'Start with Al-Fatiha', d: 'The first surah (Al-Fatiha) is an excellent starting point. It is short, repeated in every prayer, and contains the foundations of faith.' },
        ]).map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 3 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <p><strong style={{ color: 'var(--text-1)' }}>{item.t} — </strong>{item.d}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/coran" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(201,168,76,.10)',
          border: '1px solid rgba(201,168,76,.22)',
          borderRadius: 'var(--r-md)',
          padding: '12px 24px',
          fontSize: 13,
          color: 'var(--gold)',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          {lang === 'fr' ? 'Ouvrir le Coran' : 'Open the Quran'}
        </Link>
      </div>

      <MarkLearnedBtn done={done} onMarkLearned={onMarkLearned} lang={lang} />
    </div>
  )
}

// ── Halal detail ──────────────────────────────────────────────────────────────

function HalalDetail({ lang, done, onMarkLearned, onBack }) {
  return (
    <div>
      <DetailHeader onBack={onBack} lang={lang} title="Halal & Haram" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(34,196,138,.06)', border: '1px solid rgba(34,196,138,.18)', borderRadius: 'var(--r-md)', padding: 16, textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#15a06e', marginBottom: 6 }}>Halal — حَلَال</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {lang === 'fr' ? 'Permis, licite — ce qu\'Allah a autorisé' : 'Permitted, lawful — what Allah has allowed'}
          </p>
        </div>
        <div style={{ background: 'rgba(220,50,50,.06)', border: '1px solid rgba(220,50,50,.18)', borderRadius: 'var(--r-md)', padding: 16, textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: '#c03030', marginBottom: 6 }}>Haram — حَرَام</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {lang === 'fr' ? 'Interdit — ce qu\'Allah a prohibé' : 'Forbidden — what Allah has prohibited'}
          </p>
        </div>
      </div>

      <SectionTitle>{lang === 'fr' ? 'Alimentation — ce qui est interdit' : 'Food — what is forbidden'}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {(lang === 'fr' ? [
          { item: 'Porc et ses dérivés', ref: 'Coran 2:173' },
          { item: 'Le sang', ref: 'Coran 2:173' },
          { item: 'La charogne (animal mort sans abattage rituel)', ref: 'Coran 2:173' },
          { item: "L'alcool et toutes les substances enivrantes", ref: 'Coran 5:90' },
          { item: "Les prédateurs à crocs (lions, loups, chiens...)", ref: 'Sahih Muslim 1934' },
          { item: "Les oiseaux à serres (aigles, faucons...)", ref: 'Sahih Muslim 1934' },
          { item: "Tout animal abattu sans mentionner le nom d'Allah", ref: 'Coran 6:121' },
        ] : [
          { item: 'Pork and its derivatives', ref: 'Quran 2:173' },
          { item: 'Blood', ref: 'Quran 2:173' },
          { item: 'Carrion (animal not slaughtered ritually)', ref: 'Quran 2:173' },
          { item: 'Alcohol and all intoxicating substances', ref: 'Quran 5:90' },
          { item: 'Predatory animals with fangs (lions, wolves, dogs...)', ref: 'Sahih Muslim 1934' },
          { item: 'Birds of prey with talons (eagles, hawks...)', ref: 'Sahih Muslim 1934' },
          { item: "Any animal slaughtered without mentioning Allah's name", ref: 'Quran 6:121' },
        ]).map((entry, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(220,50,50,.04)', border: '1px solid rgba(220,50,50,.12)', borderRadius: 'var(--r-sm)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c03030" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{entry.item}</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: "'Space Mono', monospace", flexShrink: 0, marginLeft: 8 }}>{entry.ref}</span>
          </div>
        ))}
      </div>

      <SectionTitle>{lang === 'fr' ? 'Finance islamique — le riba (intérêt)' : 'Islamic finance — riba (interest)'}</SectionTitle>
      <InfoCard accent="warn">
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
          {lang === 'fr' ? 'Le riba est strictement interdit (Coran 2:275-278, 3:130)' : 'Riba is strictly forbidden (Quran 2:275-278, 3:130)'}
        </p>
        <p className="ar" style={{ fontSize: 18, marginBottom: 8 }}>وَأَحَلَّ ٱللَّهُ ٱلْبَيْعَ وَحَرَّمَ ٱلرِّبَوٰٓا۟</p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', marginBottom: 12 }}>
          {lang === 'fr' ? '"Allah a rendu le commerce licite et a interdit le riba." — Coran 2:275' : '"Allah has permitted trade and forbidden riba." — Quran 2:275'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
          {lang === 'fr'
            ? "Le riba désigne tout intérêt sur un prêt ou un dépôt bancaire. Les alternatives islamiques (murabaha, ijara, sukuk) permettent des transactions financières conformes à la charia. La banque islamique est disponible en Europe via plusieurs établissements."
            : "Riba refers to any interest on a loan or bank deposit. Islamic alternatives (murabaha, ijara, sukuk) allow financial transactions compliant with sharia. Islamic banking is available in Europe through several institutions."}
        </p>
      </InfoCard>

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.18)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--text-3)' }}>
        {lang === 'fr'
          ? "Pour les situations complexes, consultez un savant qualifié — ECFR : "
          : "For complex situations, consult a qualified scholar — ECFR: "}
        <a href="https://ecfr.eu" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', fontWeight: 600 }}>ecfr.eu</a>
      </div>

      <MarkLearnedBtn done={done} onMarkLearned={onMarkLearned} lang={lang} />
    </div>
  )
}

// ── Dua detail ────────────────────────────────────────────────────────────────

function DuaDetail({ lang, done, onMarkLearned, onBack }) {
  return (
    <div>
      <DetailHeader onBack={onBack} lang={lang} title={lang === 'fr' ? 'Les invocations (Dua)' : 'Supplications (Dua)'} />

      <InfoCard accent="em">
        <p style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 600, marginBottom: 6 }}>
          {lang === 'fr' ? "Qu'est-ce que le dua ?" : 'What is dua?'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
          {lang === 'fr'
            ? "Le dua (دُعَاء) est l'invocation, la prière personnelle adressée directement à Allah. C'est l'acte d'adoration le plus intime — on peut faire du dua à tout moment, dans n'importe quelle langue, pour toute demande licite."
            : "Dua (دُعَاء) is supplication, personal prayer addressed directly to Allah. It is the most intimate act of worship — one can make dua at any time, in any language, for any lawful request."}
        </p>
        <p className="ar" style={{ fontSize: 18, marginTop: 12, marginBottom: 6 }}>وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ</p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
          {lang === 'fr' ? '"Votre Seigneur a dit : Invoquez-Moi, Je vous répondrai." — Coran 40:60' : '"Your Lord said: Call upon Me, I will respond to you." — Quran 40:60'}
        </p>
      </InfoCard>

      <SectionTitle>{lang === 'fr' ? '5 invocations essentielles du quotidien' : '5 essential daily supplications'}</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {DUAS.map((dua, i) => (
          <div key={dua.id} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <StepBadge num={i + 1} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {lang === 'fr' ? dua.frOcc : dua.enOcc}
              </span>
            </div>
            <p className="ar" style={{ fontSize: 24, marginBottom: 10 }}>{dua.ar}</p>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'var(--gold)', letterSpacing: '0.04em', marginBottom: 8 }}>
              {dua.trans}
            </p>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 8 }}/>
            <p style={{ fontSize: 13, color: 'var(--text-2)', fontStyle: 'italic' }}>
              {lang === 'fr' ? dua.fr : dua.en}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(34,196,138,.06)', border: '1px solid rgba(34,196,138,.18)', borderRadius: 'var(--r-md)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
        {lang === 'fr'
          ? "Le meilleur moment pour le dua : dans la dernière partie de la nuit, entre les deux adhan du Fajr, lors de la sajda, et le vendredi entre Asr et Maghrib."
          : "The best times for dua: in the last third of the night, between the two Fajr adhans, during sajda, and on Friday between Asr and Maghrib."}
      </div>

      <MarkLearnedBtn done={done} onMarkLearned={onMarkLearned} lang={lang} />
    </div>
  )
}

// ── Module detail dispatcher ──────────────────────────────────────────────────

function ModuleDetail({ moduleId, lang, done, onMarkLearned, onBack }) {
  const props = { lang, done, onMarkLearned, onBack }
  switch (moduleId) {
    case 'wudu':        return <WuduDetail       {...props} />
    case 'prayer':      return <PrayerDetail     {...props} />
    case 'shahada':     return <ShahadaDetail    {...props} />
    case 'pillars':     return <PillarsDetail    {...props} />
    case 'quran-intro': return <QuranIntroDetail {...props} />
    case 'halal':       return <HalalDetail      {...props} />
    case 'dua':         return <DuaDetail        {...props} />
    default:            return null
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NouveauxMusulmans() {
  const lang = useContext(LangContext)
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState({})

  useEffect(() => {
    try {
      setProgress(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'))
    } catch { setProgress({}) }
  }, [])

  function markLearned(id) {
    const updated = { ...progress, [id]: true }
    setProgress(updated)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated))
  }

  const completedCount = Object.values(progress).filter(Boolean).length

  if (selected) {
    return (
      <ModuleDetail
        moduleId={selected}
        lang={lang}
        done={!!progress[selected]}
        onMarkLearned={() => markLearned(selected)}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div>
      <style>{`
        .nm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 900px) { .nm-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .nm-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="page-topbar">
        <div>
          <h1 className="page-title" style={{ fontFamily: 'var(--font-display)' }}>
            {lang === 'fr' ? 'Pour les nouveaux musulmans' : 'For New Muslims'}
          </h1>
          <p style={{ color: 'var(--text-2)', marginTop: 4, fontSize: 13 }}>
            {lang === 'fr' ? 'Apprenez les bases pas à pas' : 'Learn the basics step by step'}
          </p>
        </div>
        {completedCount > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {lang === 'fr' ? 'Progression' : 'Progress'}
            </span>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--em)' }}>
              {completedCount} / {MODULES.length}
            </span>
          </div>
        )}
      </div>

      {completedCount > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(completedCount / MODULES.length) * 100}%`,
              background: 'var(--em)',
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }}/>
          </div>
        </div>
      )}

      <div className="nm-grid">
        {MODULES.map(mod => (
          <ModuleCard
            key={mod.id}
            mod={mod}
            lang={lang}
            done={!!progress[mod.id]}
            onClick={() => setSelected(mod.id)}
          />
        ))}
      </div>
    </div>
  )
}
