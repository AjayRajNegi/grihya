import { Footer, Navbar, ScrollToTop } from "@/utils/import";
import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://admin.grihya.in/api";

function ForgotPasswordCard({
  initialEmail = "",
  onClose,
}: {
  initialEmail?: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setErr("");

    if (!email.trim()) {
      setErr("Please enter your email.");
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`${API_URL}/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.warn("forgot response", res.status, data);
      }

      setDone(true);
    } catch (e: any) {
      setErr(e?.message || "Unable to send reset link. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-1 text-gray-600">
            We’ve sent a password reset link to {email || "your email"}. Follow
            the link to set a new password.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-md bg-[#2DB8D1] py-2 text-white hover:bg-[#278b9d]"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 rounded-2xl bg-white p-8 shadow-lg"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Forgot password</h2>
        <p className="mx-auto mt-1 w-[80%] text-center text-gray-600">
          To reset your password, enter the email linked to your account.
        </p>
      </div>

      {err && (
        <div className="rounded border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
          {err}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex-1 rounded-md bg-[#2DB8D1] py-2 text-white hover:bg-[#278b9d] disabled:opacity-70"
        >
          {sending ? "Sending…" : "Continue"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border px-4 py-2 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordModal() {
  const [email, setEmail] = useState("");

  return (
    <>
      <ScrollToTop />

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <ForgotPasswordCard initialEmail={email} onClose={() => {}} />
        </main>

        <Footer />
      </div>
    </>
  );
}
