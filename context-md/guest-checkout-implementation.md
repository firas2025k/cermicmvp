# Guest Checkout Implementation Guide

## Executive Summary

**Good news:** Your Payload CMS ecommerce setup already has **most of the guest checkout functionality built-in!** The system is designed to support guest purchases without requiring user accounts. However, there are a few missing pieces that need to be implemented to provide a complete guest checkout experience.

## Current State Analysis

### ✅ What's Already Working

1. **Guest Checkout UI** (`src/components/checkout/CheckoutPage.tsx`)
   - Email input field for guest checkout (lines 160-186)
   - "Continue as guest" button functionality
   - Guest checkout flow is integrated into the payment process
   - Email is passed through the entire checkout flow

2. **Order Schema Support** (`src/payload-types.ts`)
   - Orders have `customerEmail?: string | null` field (line 251)
   - Orders have `customer?: (number | null) | User` field (line 250) - nullable, so orders can exist without a user
   - Shipping address is stored directly on the order (lines 237-249)

3. **Payment Flow Integration** (`src/components/forms/CheckoutForm/index.tsx`)
   - `customerEmail` is passed to Stripe payment intent (line 46)
   - `customerEmail` is included in order confirmation (line 68)
   - Return URL includes email parameter for guest access (line 39)

4. **Order Access for Guests** (`src/app/(app)/(account)/orders/[id]/page.tsx`)
   - Order page supports guest access via email verification (lines 59-67, 83-88)
   - Guests can view orders by providing their email address
   - Security: Orders are only accessible if the email matches

5. **Order Lookup Page** (`src/app/(app)/find-order/page.tsx`)
   - Dedicated page for guests to find their orders
   - Uses email address to locate orders

### ❌ What's Missing

1. **Email Notifications**
   - Email adapter is commented out in `src/payload.config.ts` (line 83)
   - No order confirmation emails are being sent
   - No email templates configured

2. **UI/UX Enhancements** (Optional but recommended)
   - Guest checkout option could be more prominent
   - Could add a "Checkout as Guest" button earlier in the flow
   - Could improve messaging about guest checkout benefits

3. **Order Confirmation Email Template**
   - Need to create email template for order confirmations
   - Should include order details, shipping address, items, etc.

## Implementation Steps

### Step 1: Configure Email Service

**File:** `src/payload.config.ts`

**Current State:**
```typescript
//email: nodemailerAdapter(),
```

**Action Required:**
1. Choose an email service provider (recommended options):
   - **Nodemailer** (SMTP) - Simple, works with any SMTP server
   - **Resend** - Modern, developer-friendly API
   - **SendGrid** - Enterprise-grade
   - **Mailgun** - Reliable transactional emails

2. Install the appropriate adapter:
   ```bash
   # For Nodemailer (SMTP)
   pnpm add nodemailer
   pnpm add -D @types/nodemailer
   
   # OR for Resend (recommended for modern apps)
   pnpm add @payloadcms/email-resend
   ```

3. Configure in `payload.config.ts`:
   ```typescript
   // Example with Nodemailer (SMTP)
   import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
   
   email: nodemailerAdapter({
     defaultFromAddress: 'noreply@yourdomain.com',
     defaultFromName: 'Tunisian Tile Studio',
     transportOptions: {
       host: process.env.SMTP_HOST,
       port: Number(process.env.SMTP_PORT) || 587,
       auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASSWORD,
       },
     },
   }),
   
   // OR with Resend (simpler, recommended)
   import { resendAdapter } from '@payloadcms/email-resend'
   
   email: resendAdapter({
     defaultFromAddress: 'noreply@yourdomain.com',
     defaultFromName: 'Tunisian Tile Studio',
     apiKey: process.env.RESEND_API_KEY,
   }),
   ```

4. Add environment variables to `.env.local`:
   ```env
   # For SMTP (Nodemailer)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   # OR for Resend
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

### Step 2: Create Order Confirmation Email Hook

**File:** `src/collections/Orders/index.ts` (create new file)

**Purpose:** Send email when an order is created/confirmed

**Implementation:**
```typescript
import type { CollectionConfig } from 'payload'
import type { Order } from '@/payload-types'

export const Orders: CollectionConfig = {
  slug: 'orders',
  // ... existing order collection config from ecommerce plugin
  
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Only send email on create or when status changes to 'completed'
        if (operation === 'create' || (operation === 'update' && doc.status === 'completed')) {
          const order = doc as Order
          
          // Only send if customerEmail exists (guest checkout)
          if (order.customerEmail && !order.customer) {
            try {
              await req.payload.sendEmail({
                to: order.customerEmail,
                subject: `Order Confirmation #${order.id} - Tunisian Tile Studio`,
                html: generateOrderConfirmationEmail(order),
              })
            } catch (error) {
              req.payload.logger.error(`Failed to send order confirmation email: ${error}`)
            }
          }
        }
      },
    ],
  },
}

function generateOrderConfirmationEmail(order: Order): string {
  // Generate HTML email template
  // Include: order number, items, shipping address, total, etc.
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body>
        <h1>Thank you for your order!</h1>
        <p>Order #${order.id}</p>
        <!-- Add order details here -->
      </body>
    </html>
  `
}
```

**Note:** You'll need to check if the ecommerce plugin already provides an Orders collection override. If so, extend it instead of creating a new one.

### Step 3: Create Email Template Component

**File:** `src/utilities/emailTemplates/orderConfirmation.tsx` (create new file)

**Purpose:** Reusable email template for order confirmations

**Implementation:**
```typescript
import type { Order } from '@/payload-types'
import { formatCurrency } from '@payloadcms/plugin-ecommerce/client/react'

export function generateOrderConfirmationEmail(order: Order): string {
  const items = order.items || []
  const total = order.amount ? (order.amount / 100).toFixed(2) : '0.00'
  const currency = order.currency || 'EUR'
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${order.id}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2c3e50; margin-top: 0;">Thank you for your order!</h1>
          <p style="margin: 0;">We've received your order and will process it shortly.</p>
        </div>
        
        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-top: 0;">Order Details</h2>
          <p><strong>Order Number:</strong> #${order.id}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</p>
          <p><strong>Status:</strong> ${order.status || 'Processing'}</p>
        </div>
        
        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-top: 0;">Items Ordered</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd;">
                <th style="text-align: left; padding: 10px;">Product</th>
                <th style="text-align: right; padding: 10px;">Quantity</th>
                <th style="text-align: right; padding: 10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item) => {
                const product = typeof item.product === 'object' ? item.product : null
                const variant = typeof item.variant === 'object' ? item.variant : null
                const productName = product?.title || 'Unknown Product'
                const variantName = variant?.title ? ` - ${variant.title}` : ''
                const price = variant?.priceInEUR || product?.priceInEUR || 0
                const priceFormatted = (price / 100).toFixed(2)
                
                return `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${productName}${variantName}</td>
                    <td style="text-align: right; padding: 10px;">${item.quantity}</td>
                    <td style="text-align: right; padding: 10px;">${priceFormatted} ${currency}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #ddd; font-weight: bold;">
                <td colspan="2" style="padding: 10px; text-align: right;">Total:</td>
                <td style="padding: 10px; text-align: right;">${total} ${currency}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        ${order.shippingAddress ? `
          <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Shipping Address</h2>
            <p>
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.addressLine2 ? `${order.shippingAddress.addressLine2}<br>` : ''}
              ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
              ${order.shippingAddress.country}
            </p>
          </div>
        ` : ''}
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px;">
          <p style="margin: 0;">
            <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/shop/order/${order.id}?email=${encodeURIComponent(order.customerEmail || '')}" 
               style="display: inline-block; background-color: #2c3e50; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              View Order Details
            </a>
          </p>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            If you have any questions, please contact us at support@yourdomain.com
          </p>
        </div>
      </body>
    </html>
  `
}
```

### Step 4: Enhance Checkout UI (Optional)

**File:** `src/components/checkout/CheckoutPage.tsx`

**Current State:** Guest checkout is functional but could be more prominent.

**Optional Improvements:**
1. Add a prominent "Checkout as Guest" button at the top of the checkout page
2. Add messaging explaining guest checkout benefits
3. Make the email input more prominent for guests

**Example Enhancement:**
```typescript
// Add near the top of the checkout page, before the contact section
{!user && (
  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
    <h3 className="font-semibold text-lg mb-2">Checkout as Guest</h3>
    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
      You can complete your purchase without creating an account. We'll send your order confirmation to your email address.
    </p>
  </div>
)}
```

### Step 5: Test Guest Checkout Flow

**Testing Checklist:**
1. ✅ Add items to cart without being logged in
2. ✅ Navigate to checkout page
3. ✅ Enter email address as guest
4. ✅ Fill in shipping/billing addresses
5. ✅ Complete payment (use Stripe test mode)
6. ✅ Verify order is created with `customerEmail` but no `customer`
7. ✅ Verify email is sent to guest email address
8. ✅ Verify guest can access order page using email parameter
9. ✅ Verify guest can use "Find Order" page to locate their order

## Technical Considerations

### Cart Management
- **Current:** Carts are stored in the database and can be associated with a user OR exist independently
- **Guest Carts:** The ecommerce plugin supports guest carts via cookies/session
- **No Changes Needed:** The current cart system already supports guest checkout

### Order Access Control
- **Current:** Orders are accessible by:
  - Logged-in users (if order.customer matches user.id)
  - Guests (if order.customerEmail matches provided email)
- **Security:** The order page already implements proper access control (see `src/app/(app)/(account)/orders/[id]/page.tsx` lines 83-99)
- **No Changes Needed:** Security is already properly implemented

### Email Service Provider Recommendations

**For Austrian Market:**
1. **Resend** - Modern, reliable, good deliverability in EU
2. **Mailgun** - Good EU data centers, GDPR compliant
3. **SendGrid** - Enterprise-grade, excellent deliverability
4. **SMTP (Nodemailer)** - Use your own SMTP server (e.g., Gmail, Outlook, or your hosting provider's SMTP)

**Important for GDPR:**
- Ensure your email service provider is GDPR compliant
- Include unsubscribe links in emails
- Store email addresses securely
- Only send transactional emails (order confirmations are transactional, so no opt-in required)

## Estimated Implementation Time

- **Step 1 (Email Configuration):** 30-60 minutes
- **Step 2 (Order Email Hook):** 1-2 hours
- **Step 3 (Email Template):** 1-2 hours
- **Step 4 (UI Enhancements):** 30 minutes (optional)
- **Step 5 (Testing):** 1 hour

**Total:** ~4-6 hours of development time

## Summary

Your Payload CMS ecommerce setup is **already 80% ready for guest checkout**. The main missing piece is **email notifications**. Once you configure the email service and add the order confirmation email hook, guest checkout will be fully functional.

The system is well-designed for this use case:
- ✅ Orders can exist without user accounts
- ✅ Guest checkout UI is already implemented
- ✅ Order access control supports guest access
- ✅ Payment flow handles guest emails
- ❌ Only missing: Email notifications

This is a common pattern in Austrian e-commerce, and your setup is perfectly positioned to support it with minimal additional work.

