import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = async (email, password, remember) => {
    // minimal stub for local dev: accept any credentials
    return new Promise((resolve) => {
      setTimeout(() => {
        const u = { id: 'local', email }
        setUser(u)
        if (remember) localStorage.setItem('token', 'local-token')
        resolve(u)
      }, 300)
    })
  }

  const loginWithGoogle = async (remember) => login('google@user', 'oauth', remember)
  const loginWithGithub = async (remember) => login('github@user', 'oauth', remember)

  const resetPassword = async (email) => {
    return new Promise((resolve) => setTimeout(resolve, 200))
  }

  const normalizeAuthError = (err) => {
    if (!err) return 'An error occurred'
    if (err.message) return err.message
    return String(err)
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, loginWithGithub, resetPassword, normalizeAuthError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthProvider