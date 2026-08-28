'use client'

import React from 'react'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-black">
      <h2 className="text-xl font-bold">Oh nein!</h2>
      <p className="my-2">
        Im Shop ist ein Fehler aufgetreten. Möglicherweise handelt es sich um ein vorübergehendes
        Problem. Bitte versuche es erneut.
      </p>
      <button
        className="mx-auto mt-4 flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white hover:opacity-90"
        onClick={() => reset()}
        type="button"
      >
        Erneut versuchen
      </button>
    </div>
  )
}
