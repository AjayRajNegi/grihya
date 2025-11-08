import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_URL =
import.meta.env.VITE_API_URL ||
import.meta.env.VITE_API_BASE_URL ||
'http://backend.easylease.services/api';

export default function ResetPasswordPage() {
const [search] = useSearchParams();
const navigate = useNavigate();

const token = search.get('token') || '';
const emailParam = search.get('email') || '';

const [password, setPassword] = useState('');
const [confirm, setConfirm] = useState('');
const [err, setErr] = useState('');
const [info, setInfo] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
e.preventDefault();
setErr('');
setInfo('');

if (!token || !emailParam) {
  setErr('Invalid or missing reset token. Please request a new password reset.');
  return;
}
if (!password || !confirm) return setErr('Please fill both password fields.');
if (password !== confirm) return setErr('Passwords do not match.');
if (password.length < 6) return setErr('Password must be at least 6 characters.');

try {
  setLoading(true);
  const res = await fetch(`${API_URL}/auth/password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      email: emailParam,
      password,
      password_confirmation: confirm,
    }),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.message || 'Unable to reset password. Please try again.');

  setInfo('Your password has been updated. You can now sign in.');
  setTimeout(() => navigate('/account?show=login', { replace: true }), 1000);
} catch (e: any) {
  setErr(e?.message || 'Unable to reset password. Please try again.');
} finally {
  setLoading(false);
}
};

return (
<main className="min-h-screen bg-gray-50 py-10">
<div className="mx-auto w-full max-w-md px-4">
<div className="rounded-2xl border bg-white p-6 shadow-sm">
<h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
<p className="text-sm text-gray-600 mt-1">
Set your new password for {emailParam ? <strong>{emailParam}</strong> : 'your account'}.
</p>

      {err && <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 rounded">{err}</div>}
      {info && <div className="mt-3 bg-emerald-50 border-l-4 border-emerald-500 p-3 text-emerald-700 rounded">{info}</div>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enter New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2AB09C] outline-none"
            placeholder="New password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2AB09C] outline-none"
            placeholder="Re-enter new password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2AB09C] text-white py-2 rounded-md hover:bg-[#229882] disabled:opacity-70"
        >
          {loading ? 'Saving…' : 'Update Password'}
        </button>
      </form>
    </div>
  </div>
</main>
);
}