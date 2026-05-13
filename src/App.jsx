import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { LangContext } from './i18n/translations'
import { getLang } from './utils/storage'
import { ThemeProvider } from './context/ThemeContext'
import { FontSizeProvider } from './context/FontSizeContext'
import { ContrastProvider } from './context/ContrastContext'
import SplashScreen from './components/SplashScreen'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import LandingPage from './pages/LandingPage'
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
    <ThemeProvider>
    <FontSizeProvider>
    <ContrastProvider>
    <LangContext.Provider value={lang}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/*" element={
            <>
              <div className="app-shell">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="home" element={<div className="page-enter"><Home /></div>} />
                    <Route path="coran" element={<div className="page-enter"><Coran /></div>} />
                    <Route path="coran/:numero" element={<div className="page-enter"><SourateReader /></div>} />
                    <Route path="prayers" element={<div className="page-enter"><PrayerTimes /></div>} />
                    <Route path="assistant" element={<div className="page-enter"><Assistant /></div>} />
                    <Route path="tafsir/:verseKey" element={<div className="page-enter"><Tafsir /></div>} />
                    <Route path="rappels" element={<div className="page-enter"><Rappels /></div>} />
                    <Route path="calendrier" element={<div className="page-enter"><Calendrier /></div>} />
                    <Route path="zakat" element={<div className="page-enter"><Zakat /></div>} />
                    <Route path="settings" element={<div className="page-enter"><Settings lang={lang} setLang={setLang} /></div>} />
                    <Route path="nouveaux-musulmans" element={<div className="page-enter"><NouveauxMusulmans /></div>} />
                  </Routes>
                </div>
              </div>
              <BottomNav />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </LangContext.Provider>
    </ContrastProvider>
    </FontSizeProvider>
    </ThemeProvider>
  )
}
