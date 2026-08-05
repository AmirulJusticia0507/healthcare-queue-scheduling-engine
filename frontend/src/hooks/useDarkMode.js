import { useState, useEffect } from 'react'

const DARK_KEY = 'hq-dark-mode'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(DARK_KEY)
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem(DARK_KEY, String(isDark))
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  function toggle() {
    setIsDark(d => !d)
  }

  return { isDark, toggle }
}
