import React from 'react'

export default function Button({ children, type = 'button', loading = false, ...rest }) {
  return (
    <button
      type={type}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-2 font-semibold text-white hover:bg-cyan-600 disabled:opacity-60"
      {...rest}
    >
      {loading ? 'Loading…' : children}
    </button>
  )
}
