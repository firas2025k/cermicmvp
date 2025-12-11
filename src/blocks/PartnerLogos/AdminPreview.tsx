import React from 'react'

export const PartnerLogosAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 p-4">
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
          <div className="h-1 w-1 rounded-full bg-white" />
        </div>
        <p className="mt-2 text-xs font-semibold">Partner Logos</p>
      </div>
    </div>
  )
}

