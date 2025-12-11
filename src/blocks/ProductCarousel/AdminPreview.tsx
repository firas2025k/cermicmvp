import React from 'react'

export const ProductCarouselAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-4">
      <div className="text-center text-white">
        <svg
          className="mx-auto mb-2 h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="h-1 w-8 rounded bg-white" />
          <div className="h-1 w-8 rounded bg-white" />
          <div className="h-1 w-8 rounded bg-white" />
        </div>
        <p className="mt-2 text-xs font-semibold">Product Carousel</p>
      </div>
    </div>
  )
}

