import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://backend.easylease.services/api';

type LoginProps = { onSwitch?: () => void };

function ForgotPasswordCard({
  initialEmail = '',
  onClose,
}: {
  initialEmail?: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email.trim()) {
      setErr('Please enter your email.');
      return;
    }
    try {
      setSending(true);
      const res = await fetch(`${API_URL}/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      // Do not leak if the email exists or not
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.warn('forgot response', res.status, data);
      }
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || 'Unable to send reset link. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-600 mt-1">
            We’ve sent a password reset link to {email || 'your email'}. Follow the link to set a new password.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#2AB09C] text-white py-2 rounded-md hover:bg-[#229882]"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Forgot password</h2>
        <p className="text-gray-600 mt-1">
          To reset your password, enter the email linked to your account.
        </p>
      </div>

      {err && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 rounded">{err}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2AB09C] outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex-1 bg-[#2AB09C] text-white py-2 rounded-md hover:bg-[#229882] disabled:opacity-70"
        >
          {sending ? 'Sending…' : 'Continue'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function LoginForm({ onSwitch }: LoginProps): JSX.Element {
  const { login, loginWithGoogle } = useAuth() as any;
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const redirectTo = search.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [fpOpen, setFpOpen] = useState(false);

  const submit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) return setErr('Please fill in all fields');
    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch {
      setErr('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const goToSignup = (prefill?: { email?: string; name?: string }) => {
    if (onSwitch) return onSwitch();
    const params = new URLSearchParams({ show: 'signup', redirect: redirectTo });
    if (prefill?.email) params.append('email', String(prefill.email));
    if (prefill?.name) params.append('name', String(prefill.name));
    navigate(`/account?${params.toString()}`);
  };

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      setErr('');
      try {
        setLoading(true);
        await loginWithGoogle(tokenResponse.access_token);
        navigate(redirectTo, { replace: true });
      } catch (e: any) {
        setErr(e?.message || 'Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setErr('Google login failed. Please try again.'),
  });

  if (fpOpen) {
    return <ForgotPasswordCard initialEmail={email} onClose={() => setFpOpen(false)} />;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-600 mt-1">Sign in to continue</p>
      </div>

      {err && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 rounded">{err}</div>
      )}

      <button
        type="button"
        onClick={() => googleLogin()}
        disabled={loading}
        className="w-full border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center gap-2 hover:bg-gray-50"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="G"
          className="h-5 w-5"
        />
        <span>{loading ? 'Please wait…' : 'Continue with Google'}</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-gray-400">or</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (err) setErr('');
          }}
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2AB09C] outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <button
            type="button"
            onClick={() => setFpOpen(true)}
            className="text-sm text-[#2AB09C] hover:text-[#1f8a78]"
          >
            Forgot password?
          </button>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (err) setErr('');
          }}
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2AB09C] outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#2AB09C] text-white py-2 rounded-md hover:bg-[#229882] disabled:opacity-70"
      >
        {loading ? 'Logging in…' : 'Login'}
      </button>

      <p className="text-sm text-gray-600 mt-2 text-center">
        Not signed up?{' '}
        <button type="button" onClick={() => goToSignup()} className="text-[#2AB09C] font-medium">
          Create an account
        </button>
      </p>
    </form>
  );
}

export default LoginForm;