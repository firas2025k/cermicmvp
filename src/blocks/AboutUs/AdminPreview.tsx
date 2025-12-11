import React from 'react'

export const AboutUsAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-4">
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-white/80" />
          <div className="flex flex-col gap-1">
            <div className="h-1 w-16 rounded bg-white/80" />
            <div className="h-1 w-12 rounded bg-white/60" />
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold">About Us</p>
      </div>
    </div>
  )
}

