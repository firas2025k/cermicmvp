import React from 'react'

export const HeroCarouselAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div className="flex items-center justify-center gap-1">
          <div className="h-2 w-2 rounded-full bg-white" />
          <div className="h-2 w-2 rounded-full bg-white/50" />
          <div className="h-2 w-2 rounded-full bg-white/50" />
        </div>
        <p className="mt-2 text-xs font-semibold">Hero Carousel</p>
      </div>
    </div>
  )
}

