import React from 'react'

export const InquiryAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-4">
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-xs font-semibold">Inquiry</p>
      </div>
    </div>
  )
}
