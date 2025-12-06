import { Banner } from '@payloadcms/ui'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <section className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your store dashboard</h4>
      </Banner>

      <p className={`${baseClass}__intro`}>
        This screen is meant to be a simple home base. Start by adding products and pages, then
        check the live site to see your changes.
      </p>

      <div className={`${baseClass}__grid`}>
        <div className={`${baseClass}__card`}>
          <h3 className={`${baseClass}__cardTitle`}>Add demo data</h3>
          <p className={`${baseClass}__cardBody`}>
            Quickly seed your database with example products and pages so you can explore the store
            without creating everything from scratch.
          </p>
          <div className={`${baseClass}__actions`}>
            <SeedButton />
          </div>
        </div>

        <div className={`${baseClass}__card`}>
          <h3 className={`${baseClass}__cardTitle`}>Manage products</h3>
          <p className={`${baseClass}__cardBody`}>
            Create, update, and organize the products that appear in your storefront.
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin/collections/products" className={`${baseClass}__link`}>
            Go to products
          </a>
        </div>

        <div className={`${baseClass}__card`}>
          <h3 className={`${baseClass}__cardTitle`}>Edit site pages</h3>
          <p className={`${baseClass}__cardBody`}>
            Update content pages like the homepage, about, or FAQs without touching any code.
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin/collections/pages" className={`${baseClass}__link`}>
            Go to pages
          </a>
        </div>

        <div className={`${baseClass}__card`}>
          <h3 className={`${baseClass}__cardTitle`}>View your store</h3>
          <p className={`${baseClass}__cardBody`}>
            Open the public storefront in a new tab so you can see what customers see.
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={`${baseClass}__link`} target="_blank" rel="noreferrer">
            Open storefront
          </a>
        </div>
      </div>
    </section>
  )
}
