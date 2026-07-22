import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authService.login(email, password)
      login(user, token)
      toast.success('Logged in successfully!')
      navigate('/dashboard')
    } catch (error) {
      setError(error.message || 'Failed to login. Please check your credentials.')
      toast.error(error.message || 'Failed to login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-[#F7FAFB] via-white to-[#EAF2F2]'>
      <div className='absolute inset-0 bg-[radial-gradient(#DCE6E8_1px,transparent_1px)] bg-size-[16px_16px] opacity-40' />
      <div className='relative w-full max-w-md px-6'>
        <div className='bg-white/80 backdrop-blur-xl border border-[#DCE6E8] rounded-3xl shadow-xl shadow-[#4F9DA6]/10 p-10'>
          {/* Header */}
          <div className='text-center mb-10'>
            <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-[#4F9DA6] to-[#3D7F87] shadow-lg shadow-[#4F9DA6]/25 mb-6'>
              <BrainCircuit className='w-7 h-7 text-white' strokeWidth={2} />
            </div>
            <h1 className='text-2xl font-medium text-[#2A3439] tracking-tight mb-2'>Welcome back!</h1>
            <p className='text-[#647278] text-sm'>Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <div className='space-y-5'>
            {/* Email Field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-[#2A3439] uppercase tracking-wide'>Email</label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-[#4F9DA6]' : 'text-[#9CB0B4]'
                }`}>
                  <Mail className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full h-12 pl-12 pr-4 border-2 border-[#DCE6E8] rounded-xl bg-[#F7FAFB]/70 text-[#2A3439] placeholder-[#9CB0B4] text-sm font-medium transition-all duration-200 focus:outline-none focus:border-[#4F9DA6] focus:bg-white focus:shadow-lg focus:shadow-[#4F9DA6]/10'
                  placeholder='johndoe@email.com'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-[#2A3439] uppercase tracking-wide'>Password</label>
              <div className='relative group'>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-[#4F9DA6]' : 'text-[#9CB0B4]'
                }`}>
                  <Lock className='h-5 w-5' strokeWidth={2} />
                </div>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className='w-full h-12 pl-12 pr-4 border-2 border-[#DCE6E8] rounded-xl bg-[#F7FAFB]/70 text-[#2A3439] placeholder-[#9CB0B4] text-sm font-medium transition-all duration-200 focus:outline-none focus:border-[#4F9DA6] focus:bg-white focus:shadow-lg focus:shadow-[#4F9DA6]/10'
                  placeholder='********'
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='rounded-lg bg-[#FBEEEC] border border-[#F0CFC8] p-3'>
                <p className='text-xs text-[#B8543F] font-medium text-center'>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='group relative w-full h-12 bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] hover:from-[#468D95] hover:to-[#356E75] active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#4F9DA6]/20 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-[#4F9DA6]/25 overflow-hidden'
            >
              <span className='relative z-10 flex items-center justify-center gap-2'>
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2.5} />
                  </>
                )}
              </span>
              <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700' />
            </button>
          </div>

          {/* Footer */}
          <div className='mt-8 pt-6 border-t border-[#DCE6E8]'>
            <p className='text-center text-sm text-[#647278]'>
              Don't have an account?{' '}
              <Link to='/register' className='font-semibold text-[#3D7F87] hover:text-[#2E6167] transition-colors duration-200'>Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Subtle footer text */}
        <p className='text-center text-xs text-[#9CB0B4] mt-6'>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default LoginPage
