import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/Spinner'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const labelClasses =
  'block text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2'

// pr-12 leaves room for the show/hide eye button on the right
const inputClasses =
  'w-full h-12 pl-12 pr-12 border-2 border-slate-200 rounded-xl bg-slate-50/70 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10'

const inputIconWrapperClasses =
  'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200'

// Password input with its own show/hide toggle.
// Defined outside ProfilePage so it isn't re-created (and the input doesn't lose focus) on every keystroke.
const PasswordField = ({ id, label, value, onChange, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <div className='relative group'>
        <div className={inputIconWrapperClasses}>
          <Lock className='h-5 w-5' strokeWidth={2} />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          autoComplete={autoComplete}
          className={inputClasses}
        />
        <button
          type='button'
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className='absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 focus:outline-none focus-visible:text-emerald-600 transition-colors duration-200'
        >
          {showPassword ? (
            <EyeOff className='h-5 w-5' strokeWidth={2} />
          ) : (
            <Eye className='h-5 w-5' strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  )
}

const ProfilePage = () => {

  const [loading, setLoading] = useState(true)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile()
        setUsername(data.username)
        setEmail(data.email)
      } catch (error) {
        toast.error("Failed to fetch profile data.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.")
      return
    }
    setPasswordLoading(true)
    try {
      await authService.changePassword({ currentPassword, newPassword })
      toast.success("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (error) {
      toast.error(error.error || error.message || "Failed to change password.")
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Spinner />
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
      <PageHeader title="Profile Settings" />

      <div className='space-y-6'>
        {/* User Information Display */}
        <div className='bg-white border border-slate-200 rounded-2xl p-6 sm:p-8'>
          <h3 className='text-base font-semibold text-slate-900 mb-5'>
            User Information
          </h3>
          <div className='space-y-5'>
            <div>
              <label className={labelClasses}>
                Username
              </label>
              <div className='flex items-center gap-3 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200'>
                <div className='flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-emerald-100'>
                  <User className='w-4 h-4 text-emerald-600' strokeWidth={2} />
                </div>
                <p className='text-sm font-medium text-slate-900 truncate'>
                  {username}
                </p>
              </div>
            </div>
            <div>
              <label className={labelClasses}>
                Email Address
              </label>
              <div className='flex items-center gap-3 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200'>
                <div className='flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-emerald-100'>
                  <Mail className='w-4 h-4 text-emerald-600' strokeWidth={2} />
                </div>
                <p className='text-sm font-medium text-slate-900 truncate'>
                  {email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className='bg-white border border-slate-200 rounded-2xl p-6 sm:p-8'>
          <h3 className='text-base font-semibold text-slate-900 mb-5'>
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className='space-y-5'>
            <PasswordField
              id='currentPassword'
              label='Current Password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete='current-password'
            />
            <PasswordField
              id='newPassword'
              label='New Password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete='new-password'
            />
            <PasswordField
              id='confirmNewPassword'
              label='Confirm New Password'
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              autoComplete='new-password'
            />
            <div className='flex justify-end pt-1'>
              <button
                type='submit'
                disabled={passwordLoading}
                className='inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'
              >
                {passwordLoading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage