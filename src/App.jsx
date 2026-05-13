import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { LangContext } from './i18n/translations'
import { getLang } from './utils/storage'
import SplashScreen from './components/SplashScreen'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Coran from './pages/Coran'
import SourateReader from './pages/SourateReader'
import PrayerTimes from './pages/PrayerTimes'
import Assistant from './pages/Assistant'
import Tafsir from './pages/Tafsir'
import Rappels from './pages/Rappels'
import Calendrier from './pages/Calendrier'
import Zakat from './pages/Zakat'
import Settings from './pages/Settings'
import NouveauxMusulmans from './pages/NouveauxMusulmans'

export default function App() {
  const [splash, setSplash] = useState(true)
  const [lang, setLang] = useState(getLang)

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />

  return (
    <LangContext.Provider value={lang}>
      <BrowserRouter>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/coran" element={<Coran />} />
              <Route path="/coran/:numero" element={<SourateReader />} />
              <Route path="/prayers" element={<PrayerTimes />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/tafsir/:verseKey" element={<Tafsir />} />
              <Route path="/rappels" element={<Rappels />} />
              <Route path="/calendrier" element={<Calendrier />} />
              <Route path="/zakat" element={<Zakat />} />
              <Route path="/settings" element={<Settings lang={lang} setLang={setLang} />} />
              <Route path="/nouveaux-musulmans" element={<NouveauxMusulmans />} />
            </Routes>
          </div>
        </div>
        <BottomNav />
      </BrowserRouter>
    </LangContext.Provider>
  )
}
