'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Checkbox } from '@/components/ui/checkbox'
import { Address } from '@/payload-types'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { toast } from 'sonner'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

// ── Shared design tokens ────────────────────────────────────────────────────
const LINEN    = '#F8F4EE'
const CHARCOAL = '#2C2A27'
const OLIVE    = '#4A5E3A'
const TERRA    = '#C4714A'
const BORDEAUX = '#6B1F3A'
const WARM_GRAY = '#8C8680'
const WARM_BORDER = '#E2DBD0'

// ── Reusable section card ───────────────────────────────────────────────────
function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      className="mb-6"
      style={{ background: '#fff', border: `1px solid ${WARM_BORDER}`, padding: '2rem' }}
    >
      {title && (
        <h2 className="font-serif text-xl font-light mb-6" style={{ color: CHARCOAL }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

// ── Field helpers ───────────────────────────────────────────────────────────
const fieldLabelClass = 'block font-sans text-[0.7rem] tracking-[0.12em] uppercase mb-1.5'
const fieldInputClass =
  'w-full font-sans text-sm bg-white px-4 py-3 outline-none transition-colors rounded-none border'

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const data = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (data) {
          setPaymentData(data)
        }
      } catch (err) {
        console.error('[checkout] initiatePayment failed:', err)

        let errorMessage = 'An error occurred while initiating payment.'
        if (err instanceof Error) {
          const raw = err.message.trim()
          try {
            const parsed = JSON.parse(raw) as { message?: string; cause?: { code?: string } }
            if (parsed?.cause?.code === 'OutOfStock') {
              errorMessage = 'One or more items in your cart are out of stock.'
            } else if (typeof parsed.message === 'string' && parsed.message.length > 0) {
              errorMessage = parsed.message
            }
          } catch {
            if (raw.length > 0 && raw.length < 500) {
              errorMessage = raw
            }
          }
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [billingAddress, billingAddressSameAsShipping, email, initiatePayment, shippingAddress],
  )

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-24 w-full flex flex-col items-center justify-center gap-6">
        <p className="font-sans text-sm" style={{ color: WARM_GRAY }}>
          Processing your payment…
        </p>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="py-24 w-full flex flex-col items-center gap-4">
        <p className="font-sans text-sm" style={{ color: WARM_GRAY }}>
          Your cart is empty.
        </p>
        <Link
          href="/shop"
          className="font-sans text-xs tracking-[0.14em] uppercase"
          style={{ color: OLIVE }}
        >
          ← Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-14 items-start">

      {/* ── LEFT COLUMN — FORM ──────────────────────────────────────────── */}
      <div>

        {/* Contact section */}
        <SectionCard title="Contact Information">
          {user ? (
            <div className="flex items-center justify-between">
              <p className="font-sans text-sm" style={{ color: CHARCOAL }}>
                {user.email}
              </p>
              <Link
                href="/logout"
                className="font-sans text-xs tracking-[0.12em] uppercase transition-colors"
                style={{ color: WARM_GRAY }}
              >
                Log out
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3" style={{ background: LINEN }}>
                <p className="font-sans text-xs" style={{ color: WARM_GRAY }}>
                  Have an account?
                </p>
                <Link
                  href="/login"
                  className="font-sans text-xs tracking-[0.12em] uppercase font-medium transition-colors"
                  style={{ color: OLIVE }}
                >
                  Log in
                </Link>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className={fieldLabelClass}
                  style={{ color: WARM_GRAY }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sophie@example.com"
                  disabled={!emailEditable}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldInputClass}
                  style={{ borderColor: WARM_BORDER, color: CHARCOAL }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = OLIVE)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = WARM_BORDER)}
                />
              </div>

              {emailEditable ? (
                <button
                  disabled={!email}
                  onClick={(e) => {
                    e.preventDefault()
                    setEmailEditable(false)
                  }}
                  className="w-full py-3.5 font-sans text-[0.8rem] tracking-[0.14em] uppercase transition-colors disabled:opacity-40"
                  style={{ background: BORDEAUX, color: LINEN }}
                  onMouseEnter={(e) =>
                    !e.currentTarget.disabled &&
                    (e.currentTarget.style.background = '#4E1628')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = BORDEAUX)}
                >
                  Continue as Guest
                </button>
              ) : (
                <p className="font-sans text-xs" style={{ color: OLIVE }}>
                  ✓ Checking out as {email}
                </p>
              )}
            </div>
          )}
        </SectionCard>

        {/* Billing address section */}
        <SectionCard title="Billing Address">
          {billingAddress ? (
            <div className="flex items-start justify-between gap-4">
              <AddressItem address={billingAddress} />
              <button
                disabled={Boolean(paymentData)}
                onClick={(e) => {
                  e.preventDefault()
                  setBillingAddress(undefined)
                }}
                className="font-sans text-xs tracking-[0.12em] uppercase transition-colors flex-shrink-0 disabled:opacity-40"
                style={{ color: WARM_GRAY }}
              >
                Change
              </button>
            </div>
          ) : user ? (
            <CheckoutAddresses heading="Select billing address" setAddress={setBillingAddress} />
          ) : (
            <CreateAddressModal
              disabled={!email || Boolean(emailEditable)}
              callback={(address) => setBillingAddress(address)}
              skipSubmission={true}
            />
          )}

          <div className="flex items-center gap-3 mt-5">
            <Checkbox
              id="shippingTheSameAsBilling"
              checked={billingAddressSameAsShipping}
              disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
              onCheckedChange={(state) => setBillingAddressSameAsShipping(state as boolean)}
            />
            <Label
              htmlFor="shippingTheSameAsBilling"
              className="font-sans text-sm cursor-pointer"
              style={{ color: CHARCOAL }}
            >
              Shipping address same as billing
            </Label>
          </div>
        </SectionCard>

        {/* Separate shipping address */}
        {!billingAddressSameAsShipping && (
          <SectionCard title="Shipping Address">
            {shippingAddress ? (
              <div className="flex items-start justify-between gap-4">
                <AddressItem address={shippingAddress} />
                <button
                  disabled={Boolean(paymentData)}
                  onClick={(e) => {
                    e.preventDefault()
                    setShippingAddress(undefined)
                  }}
                  className="font-sans text-xs tracking-[0.12em] uppercase transition-colors flex-shrink-0 disabled:opacity-40"
                  style={{ color: WARM_GRAY }}
                >
                  Change
                </button>
              </div>
            ) : user ? (
              <CheckoutAddresses
                heading="Select shipping address"
                description="Please select a shipping address."
                setAddress={setShippingAddress}
              />
            ) : (
              <CreateAddressModal
                callback={(address) => setShippingAddress(address)}
                disabled={!email || Boolean(emailEditable)}
                skipSubmission={true}
              />
            )}
          </SectionCard>
        )}

        {/* Proceed to payment button */}
        {!paymentData && (
          <button
            disabled={!canGoToPayment}
            onClick={(e) => {
              e.preventDefault()
              void initiatePaymentIntent('stripe')
            }}
            className="w-full py-4 font-sans text-[0.8rem] tracking-[0.14em] uppercase mb-6 transition-colors disabled:opacity-40"
            style={{ background: BORDEAUX, color: LINEN }}
            onMouseEnter={(e) =>
              !e.currentTarget.disabled &&
              (e.currentTarget.style.background = '#4E1628')
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = BORDEAUX)}
          >
            Continue to Payment →
          </button>
        )}

        {/* Error state */}
        {!paymentData?.['clientSecret'] && error && (
          <div className="mb-6">
            <Message error={error} />
            <button
              onClick={(e) => {
                e.preventDefault()
                router.refresh()
              }}
              className="mt-4 font-sans text-xs tracking-[0.12em] uppercase transition-colors"
              style={{ color: OLIVE }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Stripe payment section */}
        <Suspense fallback={<React.Fragment />}>
          {paymentData && paymentData?.['clientSecret'] && (
            <SectionCard title="Payment">
              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: OLIVE }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="font-sans text-xs" style={{ color: WARM_GRAY }}>
                    SSL Encrypted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: OLIVE }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-sans text-xs" style={{ color: WARM_GRAY }}>
                    30-Day Returns
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: OLIVE }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span className="font-sans text-xs" style={{ color: WARM_GRAY }}>
                    Ships in 1–2 Days
                  </span>
                </div>
              </div>

              {error && (
                <p className="font-sans text-sm mb-4" style={{ color: TERRA }}>
                  {error}
                </p>
              )}

              <Elements
                options={{
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      borderRadius: '0px',
                      colorPrimary: OLIVE,
                      colorBackground: '#ffffff',
                      colorText: CHARCOAL,
                      colorTextPlaceholder: '#C5BFB8',
                      colorDanger: TERRA,
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      fontSizeBase: '14px',
                      spacingUnit: '4px',
                    },
                    rules: {
                      '.Input': {
                        border: `1px solid ${WARM_BORDER}`,
                        boxShadow: 'none',
                        padding: '12px 16px',
                      },
                      '.Input:focus': {
                        border: `1px solid ${OLIVE}`,
                        boxShadow: 'none',
                      },
                      '.Label': {
                        fontSize: '0.7rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: WARM_GRAY,
                        marginBottom: '6px',
                      },
                    },
                  },
                  clientSecret: paymentData['clientSecret'] as string,
                }}
                stripe={stripe}
              >
                <CheckoutForm
                  customerEmail={email}
                  billingAddress={billingAddress}
                  setProcessingPayment={setProcessingPayment}
                />
              </Elements>

              <button
                onClick={() => setPaymentData(null)}
                className="mt-4 font-sans text-xs tracking-[0.12em] uppercase transition-colors"
                style={{ color: WARM_GRAY }}
              >
                ← Cancel payment
              </button>
            </SectionCard>
          )}
        </Suspense>
      </div>

      {/* ── RIGHT COLUMN — ORDER SUMMARY ────────────────────────────────── */}
      <aside className="mt-10 lg:mt-0 lg:sticky lg:top-24">
        <div
          style={{ background: '#fff', border: `1px solid ${WARM_BORDER}`, padding: '2rem' }}
        >
          <h2 className="font-serif text-xl font-light mb-6" style={{ color: CHARCOAL }}>
            Order Summary
          </h2>

          {/* Cart items */}
          <div className="space-y-4 mb-6">
            {cart?.items?.map((item, index) => {
              if (typeof item.product !== 'object' || !item.product) return null

              const { product, quantity, variant } = item
              const { title, gallery, meta } = product

              if (!quantity) return null

              let image = gallery?.[0]?.image || meta?.image
              let price = product?.priceInEUR

              const isVariant = Boolean(variant) && typeof variant === 'object'
              if (isVariant) {
                price = variant?.priceInEUR

                const imageVariant = product.gallery?.find((g) => {
                  if (!g.variantOption) return false
                  const variantOptionID =
                    typeof g.variantOption === 'object' ? g.variantOption.id : g.variantOption
                  return variant?.options?.some((opt) =>
                    typeof opt === 'object' ? opt.id === variantOptionID : opt === variantOptionID,
                  )
                })

                if (imageVariant && typeof imageVariant.image !== 'string') {
                  image = imageVariant.image
                }
              }

              const variantLabel =
                isVariant && variant && typeof variant === 'object'
                  ? variant.options
                      ?.map((opt) => (typeof opt === 'object' ? opt.label : null))
                      .filter(Boolean)
                      .join(', ')
                  : null

              return (
                <div key={index} className="flex gap-3 items-start">
                  {/* Image with qty badge */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-16 h-16 relative overflow-hidden"
                      style={{ border: `1px solid ${WARM_BORDER}` }}
                    >
                      {image && typeof image !== 'string' && (
                        <Media fill imgClassName="object-cover" resource={image} />
                      )}
                    </div>
                    <span
                      className="absolute -top-1.5 -right-1.5 w-[1.15rem] h-[1.15rem] rounded-full flex items-center justify-center font-sans text-[0.6rem] font-medium text-white"
                      style={{ background: BORDEAUX }}
                    >
                      {quantity}
                    </span>
                  </div>

                  {/* Name + variant */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium leading-snug" style={{ color: CHARCOAL }}>
                      {title}
                    </p>
                    {variantLabel && (
                      <p className="font-sans text-xs mt-0.5" style={{ color: WARM_GRAY }}>
                        {variantLabel}
                      </p>
                    )}
                  </div>

                  {/* Line price */}
                  {typeof price === 'number' && (
                    <div className="flex-shrink-0">
                      <Price
                        amount={price * quantity}
                        currencyCode="EUR"
                        className="font-sans text-sm font-medium"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div
            className="space-y-2 pt-5"
            style={{ borderTop: `1px solid ${WARM_BORDER}` }}
          >
            <div className="flex justify-between">
              <span className="font-sans text-sm" style={{ color: WARM_GRAY }}>
                Subtotal
              </span>
              <Price
                amount={cart?.subtotal || 0}
                currencyCode="EUR"
                className="font-sans text-sm"
              />
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm" style={{ color: WARM_GRAY }}>
                Shipping
              </span>
              <span className="font-sans text-sm" style={{ color: WARM_GRAY }}>
                Calculated at next step
              </span>
            </div>
            <div
              className="flex justify-between pt-4 mt-4"
              style={{ borderTop: `1px solid ${WARM_BORDER}` }}
            >
              <span className="font-serif text-lg font-light" style={{ color: CHARCOAL }}>
                Total
              </span>
              <Price
                amount={cart?.subtotal || 0}
                currencyCode="EUR"
                className="font-serif text-lg font-light"
              />
            </div>
            <p className="font-sans text-[10px]" style={{ color: WARM_GRAY }}>
              Incl. VAT where applicable
            </p>
          </div>
        </div>

        {/* Delivery estimate card */}
        <div
          className="mt-4"
          style={{ background: '#fff', border: `1px solid ${WARM_BORDER}`, padding: '1.25rem 1.5rem' }}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: OLIVE }}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <div>
              <p className="font-sans text-sm font-medium" style={{ color: CHARCOAL }}>
                Estimated delivery: 3–5 business days
              </p>
              <p className="font-sans text-xs mt-0.5" style={{ color: WARM_GRAY }}>
                Orders placed before 12:00 ship same day
              </p>
            </div>
          </div>
        </div>
      </aside>

    </div>
  )
}
