import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import SocialLogin from '../components/SocialLogin';
import { useAuth } from '../../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGithub, loginWithGoogle, normalizeAuthError, resetPassword } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: true,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  function updateField(event) {
    const { checked, name, type, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
    }));

    setMessage('');
  }

  function validate() {
    const nextErrors = {};

    if (!emailPattern.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!validate()) return;

    try {
      setLoading(true);
      await login(form.email, form.password, form.remember);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors({ form: normalizeAuthError(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setMessage('');

    if (!emailPattern.test(form.email)) {
      setErrors((current) => ({
        ...current,
        email: 'Enter your email first.',
      }));
      return;
    }

    try {
      setLoading(true);
      await resetPassword(form.email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error) {
      setErrors({ form: normalizeAuthError(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider) {
    setErrors({});
    setMessage('');

    try {
      setLoading(true);

      if (provider === 'google') {
        await loginWithGoogle(form.remember);
      } else {
        await loginWithGithub(form.remember);
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors({ form: normalizeAuthError(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell flex items-center justify-center">
      <section className="glass-card w-full max-w-md rounded-2xl p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-300">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-zinc-800">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-violet-700">
            Access your dashboard with a secure Firebase session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {errors.form && (
            <div className="rounded-lg border border-rose-200/40 bg-rose-500/18 px-4 py-3 text-sm font-semibold text-rose-50">
              {errors.form}
            </div>
          )}

          {message && (
            <div className="rounded-lg border border-emerald-200/40 bg-emerald-500/18 px-4 py-3 text-sm font-semibold text-emerald-50">
              {message}
            </div>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={updateField}
            placeholder="you@example.com"
            error={errors.email}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={updateField}
            placeholder="Enter your password"
            error={errors.password}
          />

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 font-semibold text-white/80">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={updateField}
                className="h-4 w-4 rounded border-white/30 bg-white/10 text-cyan-300 focus:ring-cyan-200"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="self-start font-bold text-cyan-100 transition hover:text-white disabled:opacity-60 sm:self-auto"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" loading={loading}>
            Login
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/20" />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">
            or
          </span>
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <SocialLogin
          disabled={loading}
          onGoogle={() => handleSocialLogin('google')}
          onGithub={() => handleSocialLogin('github')}
        />

        <p className="mt-8 text-center text-sm text-white/70">
          New here?{' '}
          <Link to="/register" className="font-bold text-cyan-100 transition hover:text-white">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}