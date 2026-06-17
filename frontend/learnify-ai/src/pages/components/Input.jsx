import React from 'react'

export default function Input({ label, name, type = 'text', icon: Icon, autoComplete, value, onChange, placeholder, error }) {
  return (
    <label className="block">
      {label && <div className="mb-2 font-semibold text-white">{label}</div>}
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-white/70" />}
        <input
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-md bg-white/8 border border-white/10 px-3 py-2 text-white placeholder-white/50 focus:outline-none"
        />
      </div>
      {error && <div className="mt-2 text-sm text-rose-200">{error}</div>}
    </label>
  )
}
