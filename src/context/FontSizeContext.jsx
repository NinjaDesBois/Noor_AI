import { createContext, useContext, useState, useEffect } from 'react'

;(() => {
  const saved = localStorage.getItem('noor_font_size') || 'M'
  document.documentElement.setAttribute('data-font', saved)
})()

const FontSizeContext = createContext('M')

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('noor_font_size') || 'M'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontSize)
    localStorage.setItem('noor_font_size', fontSize)
  }, [fontSize])

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize: setFontSizeState }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => useContext(FontSizeContext)
