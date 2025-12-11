import React from 'react'

export const CategoryBannerAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-4">
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <div className="h-4 w-4 rounded bg-white/80" />
          <div className="h-4 w-4 rounded bg-white/80" />
          <div className="h-4 w-4 rounded bg-white/80" />
          <div className="h-4 w-4 rounded bg-white/80" />
        </div>
        <p className="mt-2 text-xs font-semibold">Category Banner</p>
      </div>
    </div>
  )
}

