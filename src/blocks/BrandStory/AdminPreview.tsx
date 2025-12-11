import React from 'react'

export const BrandStoryAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-4">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="h-1 w-16 rounded bg-white" />
        </div>
        <p className="mt-2 text-xs font-semibold">Brand Story</p>
      </div>
    </div>
  )
}

