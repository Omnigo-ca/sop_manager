'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="Basculer le thème"
    >
      <Sun
        className={`h-5 w-5 transition-all ${
          theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all ${
          theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        }`}
      />
      <span className="sr-only">Basculer le thème</span>
    </button>
  )
} 