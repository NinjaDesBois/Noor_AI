import { createContext, useContext, useState, useEffect } from 'react'

;(() => {
  if (localStorage.getItem('noor_high_contrast') === 'true') {
    document.documentElement.setAttribute('data-contrast', 'high')
  }
})()

const ContrastContext = createContext(false)

export function ContrastProvider({ children }) {
  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem('noor_high_contrast') === 'true'
  })

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high')
    } else {
      document.documentElement.removeAttribute('data-contrast')
    }
    localStorage.setItem('noor_high_contrast', String(highContrast))
  }, [highContrast])

  return (
    <ContrastContext.Provider value={{ highContrast, setHighContrast: setHighContrastState }}>
      {children}
    </ContrastContext.Provider>
  )
}

export const useContrast = () => useContext(ContrastContext)
