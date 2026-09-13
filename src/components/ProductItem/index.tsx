import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Product, Variant } from '@/payload-types'
import Link from 'next/link'

type Props = {
  product: Product
  style?: 'compact' | 'default'
  variant?: Variant
  quantity?: number
  /**
   * Force all formatting to a particular currency.
   */
  currencyCode?: string
}

export const ProductItem: React.FC<Props> = ({
  product,
  style = 'default',
  quantity,
  variant,
  currencyCode,
}) => {
  const { title } = product

  const metaImage =
    product.meta?.image && typeof product.meta?.image !== 'string' ? product.meta.image : undefined

  const firstGalleryImage =
    typeof product.gallery?.[0]?.image !== 'string' ? product.gallery?.[0]?.image : undefined

  let image = firstGalleryImage || metaImage

  const isVariant = Boolean(variant) && typeof variant === 'object'

  if (isVariant) {
    const imageVariant = product.gallery?.find((item) => {
      if (!item.variantOption) return false
      const variantOptionID =
        typeof item.variantOption === 'object' ? item.variantOption.id : item.variantOption

      const hasMatch = variant?.options?.some((option) => {
        if (typeof option === 'object') return option.id === variantOptionID
        else return option === variantOptionID
      })

      return hasMatch
    })

    if (imageVariant && typeof imageVariant.image !== 'string') {
      image = imageVariant.image
    }
  }

  const itemPrice = variant?.priceInEUR || product.priceInEUR
  const itemURL = `/products/${product.slug}${variant ? `?variant=${variant.id}` : ''}`

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-stretch justify-stretch border border-warm-border bg-[#EDE8DD] p-1.5">
        <div className="relative h-full w-full">
          {image && typeof image !== 'string' && (
            <Media className="" fill imgClassName="object-cover" resource={image} />
          )}
        </div>
      </div>
      <div className="flex grow items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-serif text-lg text-charcoal">
            <Link href={itemURL} className="transition-colors hover:text-olive">
              {title}
            </Link>
          </p>
          {variant && (
            <p className="font-sans text-xs tracking-[0.08em] text-warm-gray">
              {variant.options
                ?.map((option) => {
                  if (typeof option === 'object') return option.label
                  return null
                })
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          {quantity != null ? (
            <p className="font-sans text-xs text-warm-gray">× {quantity}</p>
          ) : null}
        </div>

        {itemPrice && quantity ? (
          <div className="text-right">
            <p className="mb-0.5 font-sans text-[10px] tracking-[0.12em] text-warm-gray uppercase">
              Zwischensumme
            </p>
            <Price
              className="font-serif text-base text-charcoal"
              amount={itemPrice * quantity}
              currencyCode={currencyCode}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
