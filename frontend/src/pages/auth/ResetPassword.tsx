import { ScrollToTop } from "@/utils/import";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://grihya.in/api";

export default function ResetPasswordPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const token = search.get("token") || "";
  const emailParam = search.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");

    if (!token || !emailParam) {
      setErr(
        "Invalid or missing reset token. Please request a new password reset.",
      );
      return;
    }
    if (!password || !confirm)
      return setErr("Please fill both password fields.");
    if (password !== confirm) return setErr("Passwords do not match.");
    if (password.length < 6)
      return setErr("Password must be at least 6 characters.");

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email: emailParam,
          password,
          password_confirmation: confirm,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok)
        throw new Error(
          data?.message || "Unable to reset password. Please try again.",
        );

      setInfo("Your password has been updated. You can now sign in.");
      setTimeout(
        () => navigate("/account?show=login", { replace: true }),
        1000,
      );
    } catch (e: any) {
      setErr(e?.message || "Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollToTop />
      <main className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="mt-1 text-sm text-gray-600">
              Set your new password for{" "}
              {emailParam ? <strong>{emailParam}</strong> : "your account"}.
            </p>

            {err && (
              <div className="mt-3 rounded border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
                {err}
              </div>
            )}
            {info && (
              <div className="mt-3 rounded border-l-4 border-cyan-500 bg-emerald-50 p-3 text-[2DB8D1]">
                {info}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Enter New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
                  placeholder="New password"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
                  placeholder="Re-enter new password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#2DB8D1] py-2 text-white hover:bg-[#2498ad] disabled:opacity-70"
              >
                {loading ? "Saving…" : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
