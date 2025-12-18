import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  // Always default to light mode unless user explicitly chooses dark mode
  // This prevents auto-switching based on system preferences
  return 'light'
}
