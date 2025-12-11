'use client'

import React from 'react'
import { BlocksFieldClientComponent } from '@payloadcms/ui'

// Custom preview images/icons for each block
const blockPreviews: Record<string, React.ReactNode> = {
  heroCarousel: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Hero</p>
      </div>
    </div>
  ),
  productCarousel: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Products</p>
      </div>
    </div>
  ),
  categoryBanner: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Category</p>
      </div>
    </div>
  ),
  brandStory: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Story</p>
      </div>
    </div>
  ),
  featureCircles: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 p-2">
      <div className="text-center text-white">
        <div className="mb-1 flex items-center justify-center gap-1">
          <div className="h-3 w-3 rounded-full border border-white/30 bg-white/20" />
          <div className="h-3 w-3 rounded-full border border-white/30 bg-white/20" />
          <div className="h-3 w-3 rounded-full border border-white/30 bg-white/20" />
        </div>
        <p className="text-[10px] font-semibold">Features</p>
      </div>
    </div>
  ),
  mediaMentions: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-400 via-gray-400 to-zinc-400 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Media</p>
      </div>
    </div>
  ),
  partnerLogos: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Partners</p>
      </div>
    </div>
  ),
  customerReviews: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Reviews</p>
      </div>
    </div>
  ),
  productUsage: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">Usage</p>
      </div>
    </div>
  ),
  aboutUs: (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-2">
      <div className="text-center text-white">
        <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="mt-1 text-[10px] font-semibold">About</p>
      </div>
    </div>
  ),
}

// This is a placeholder - Payload's block selector is not easily customizable
// The previews will show when editing blocks, not in the selector
export const CustomBlocksField: React.FC<any> = (props) => {
  return <BlocksFieldClientComponent {...props} />
}

