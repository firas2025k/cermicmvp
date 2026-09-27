import { AuthProvider } from '@/providers/Auth'
import { StorefrontEcommerceProviders } from '@/providers/EcommerceWithSession'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <StorefrontEcommerceProviders>{children}</StorefrontEcommerceProviders>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
