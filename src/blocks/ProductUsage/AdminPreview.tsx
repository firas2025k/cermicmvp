import React from 'react'

export const ProductUsageAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 p-4">
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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/80" />
          <div className="h-8 w-8 rounded-lg bg-white/80" />
          <div className="h-8 w-8 rounded-lg bg-white/80" />
        </div>
        <p className="mt-2 text-xs font-semibold">Product Usage</p>
      </div>
    </div>
  )
}

