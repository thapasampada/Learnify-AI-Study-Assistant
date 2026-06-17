import React from 'react'

export default function SocialLogin({ disabled, onGoogle, onGithub }) {
  return (
    <div className="flex gap-3">
      <button onClick={onGoogle} disabled={disabled} className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/6 px-4 py-2 text-white hover:bg-white/10">
        Sign in with Google
      </button>
      <button onClick={onGithub} disabled={disabled} className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/6 px-4 py-2 text-white hover:bg-white/10">
        Github
      </button>
    </div>
  )
}
