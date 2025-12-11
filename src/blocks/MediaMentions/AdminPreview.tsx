import React from 'react'

export const MediaMentionsAdminPreview: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-400 via-gray-400 to-zinc-400 p-4">
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
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-1 w-12 rounded bg-white/70" />
          <div className="h-1 w-12 rounded bg-white/70" />
          <div className="h-1 w-12 rounded bg-white/70" />
        </div>
        <p className="mt-2 text-xs font-semibold">Media Mentions</p>
      </div>
    </div>
  )
}

