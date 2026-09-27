import { AuthProvider } from '@/providers/Auth'
import { CartOpenProvider } from '@/providers/CartOpen'
import { CartSessionProvider, useCartSession } from '@/providers/CartSession'
import { EcommerceProvider, EUR } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'

const ecommerceApi = {
  cartsFetchQuery: {
    depth: 2,
    select: {
      items: true,
      subtotal: true,
      currency: true,
      couponCode: true,
      couponDiscountCents: true,
      couponType: true,
      couponValue: true,
      appliedCoupon: true,
    },
    populate: {
      products: {
        slug: true,
        title: true,
        gallery: true,
        inventory: true,
        priceInEUR: true,
        meta: true,
      },
      variants: {
        title: true,
        inventory: true,
        priceInEUR: true,
        options: true,
      },
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
}

function EcommerceWithSession({ children }: { children: React.ReactNode }) {
  const { sessionKey } = useCartSession()

  return (
    <EcommerceProvider
      key={sessionKey}
      currencies={{
        supportedCurrencies: [EUR],
        defaultCurrency: 'EUR',
      }}
      enableVariants={true}
      api={ecommerceApi}
      paymentMethods={[
        stripeAdapterClient({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        }),
      ]}
    >
      {children}
    </EcommerceProvider>
  )
}

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          {/* Cart drawer open state lives outside EcommerceProvider so remounting
              the cart session (after external localStorage cart create) does not
              close the drawer mid-interaction. */}
          <CartOpenProvider>
            <CartSessionProvider>
              <EcommerceWithSession>{children}</EcommerceWithSession>
            </CartSessionProvider>
          </CartOpenProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
