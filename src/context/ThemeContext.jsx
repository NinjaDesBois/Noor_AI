import { createContext, useContext, useState, useEffect } from 'react'

;(() => {
  const saved = localStorage.getItem('noor_theme')
  const resolved = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'slate' : 'default')
  document.documentElement.setAttribute('data-theme', resolved)
})()

const ThemeContext = createContext('default')

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('noor_theme')
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'slate' : 'default')
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('noor_theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
