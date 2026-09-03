import { STATIC_CARE_AND_SHIPPING } from '@/components/product/staticFaq'
import type { Category, Product, ProductFaqSection } from '@/payload-types'

import { absoluteUrl } from './absoluteUrl'
import { lexicalToPlainText } from './lexicalToPlainText'

type BreadcrumbArgs = {
  product: Product
  category: Category | null
}

type FaqPageArgs = {
  product: Product
  generalFaq?: ProductFaqSection | null
}

type FaqPair = {
  question: string
  answer: string
}

function answerToPlainText(answer: unknown): string {
  if (typeof answer === 'string') return answer.trim()
  return lexicalToPlainText(answer)
}

function getProductFaqPairs(product: Product): FaqPair[] {
  if (product.faqItems && product.faqItems.length > 0) {
    return product.faqItems
      .filter((item) => item.question && item.answer)
      .filter((item) => item.question.trim().toLowerCase() !== 'description')
      .map((item) => ({
        question: item.question.trim(),
        answer: answerToPlainText(item.answer),
      }))
      .filter((item) => item.question.length > 0 && item.answer.length > 0)
  }

  return STATIC_CARE_AND_SHIPPING.map((item) => ({
    question: item.title.trim(),
    answer: answerToPlainText(item.body),
  })).filter((item) => item.question.length > 0 && item.answer.length > 0)
}

function getGeneralFaqPairs(generalFaq: ProductFaqSection | null | undefined): FaqPair[] {
  if (!generalFaq?.items?.length) return []

  return generalFaq.items
    .filter((item) => item.question && item.answer)
    .map((item) => ({
      question: item.question.trim(),
      answer: answerToPlainText(item.answer),
    }))
    .filter((item) => item.question.length > 0 && item.answer.length > 0)
}

export function buildProductBreadcrumbJsonLd({ product, category }: BreadcrumbArgs) {
  const productPath = product.slug ? `/products/${product.slug}` : '/'
  const middle =
    category?.slug
      ? {
          name: category.title,
          path: `/shop?category=${category.slug}`,
        }
      : {
          name: 'Shop',
          path: '/shop',
        }

  const items = [
    { name: 'Startseite', path: '/' },
    middle,
    { name: product.title, path: productPath },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  }
}

export function buildProductFaqPageJsonLd({ product, generalFaq }: FaqPageArgs) {
  const pairs = [...getProductFaqPairs(product), ...getGeneralFaqPairs(generalFaq)]

  if (!pairs.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map((pair) => ({
      '@type': 'Question',
      acceptedAnswer: {
        '@type': 'Answer',
        text: pair.answer,
      },
      name: pair.question,
    })),
  }
}
