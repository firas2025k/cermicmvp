import React from 'react'

export const FeatureCirclesAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 p-4">
      <div className="text-center text-white">
        <div className="mb-2 flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-white/30 bg-white/20" />
          <div className="h-10 w-10 rounded-full border-2 border-white/30 bg-white/20" />
          <div className="h-10 w-10 rounded-full border-2 border-white/30 bg-white/20" />
        </div>
        <svg
          className="mx-auto mb-1 h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="mt-1 text-xs font-semibold">Feature Circles</p>
      </div>
    </div>
  )
}

