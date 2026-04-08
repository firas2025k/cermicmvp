import { AuthProvider } from '@/providers/Auth'
import { CartOpenProvider } from '@/providers/CartOpen'
import { EcommerceProvider, EUR } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
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
          <EcommerceProvider
            currencies={{
              supportedCurrencies: [EUR],
              defaultCurrency: 'EUR',
            }}
            enableVariants={true}
            api={{
              cartsFetchQuery: {
                depth: 2,
                select: {
                  items: true,
                  subtotal: true,
                  currency: true,
                },
                populate: {
                  items: {
                    populate: {
                      product: {
                        slug: true,
                        title: true,
                        gallery: true,
                        inventory: true,
                        priceInEUR: true,
                        meta: true,
                      },
                      variant: {
                        title: true,
                        inventory: true,
                        priceInEUR: true,
                        options: true,
                      },
                    },
                  },
                },
              },
            }}
            paymentMethods={[
              stripeAdapterClient({
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
              }),
            ]}
          >
            <CartOpenProvider>{children}</CartOpenProvider>
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
