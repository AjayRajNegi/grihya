import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setToken } from "../lib/api";

type VerifyData = { email: string; resendUrl: string };

function loadVerifyFromStorage(): VerifyData | null {
  try {
    const s = sessionStorage.getItem("verifyEmail");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const tokenParam = params.get("token");
  const kind = (params.get("kind") || "").toLowerCase();

  const stateData = (location.state || {}) as Partial<VerifyData>;
  const fallback = loadVerifyFromStorage();

  const email = stateData.email || fallback?.email || "";
  const resendUrl = stateData.resendUrl || fallback?.resendUrl || "";

  const [cooldown, setCooldown] = useState(60);
  const [info, setInfo] = useState(
    email
      ? `We have sent a verification email to ${email}.`
      : "We have sent a verification email.",
  );
  const [err, setErr] = useState("");
  const [verified, setVerified] = useState(false);
  const timerRef = useRef<number | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://admin.grihya.in/api";
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "verified_event" && e.newValue) {
        try {
          const evt = JSON.parse(e.newValue);
          if (evt && (evt.kind === "signup" || evt.kind === "email_change")) {
            window.location.replace("/login");
          }
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    async function confirm() {
      if (!tokenParam) return;
      try {
        setInfo("Verifying your email…");
        setErr("");

        const endpoint =
          kind === "email_change"
            ? "/auth/email-change/confirm"
            : "/auth/pending/confirm";

        const res = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenParam }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Verification failed");

        if (kind === "email_change") {
          setVerified(true);
          setInfo("Email verified! Updating your account…");
          sessionStorage.removeItem("verifyEmail");

          try {
            localStorage.setItem(
              "verified_event",
              JSON.stringify({ kind: "email_change", ts: Date.now() }),
            );
          } catch {}

          window.location.replace("/login");
          return;
        }

        const token = json.token as string;
        localStorage.setItem("token", token);
        setToken(token);
        setVerified(true);
        setInfo("Email verified! Logging you in…");
        sessionStorage.removeItem("verifyEmail");

        try {
          localStorage.setItem(
            "verified_event",
            JSON.stringify({ kind: "signup", ts: Date.now() }),
          );
        } catch {}

        window.location.replace("/login");
      } catch (e: any) {
        setErr(e.message || "Verification failed");
        setInfo("");
      }
    }
    confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenParam, kind]);

  useEffect(() => {
    if (verified || tokenParam) return;
    timerRef.current = window.setInterval(
      () => setCooldown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [verified, tokenParam]);

  async function handleResend() {
    try {
      setErr("");
      setInfo("Sending verification email…");
      const res = await fetch(resendUrl);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403 || res.status === 401)
          throw new Error(
            json?.message || "Link expired. Please initiate it again.",
          );
        throw new Error(json?.message || "Failed to resend. Please try again.");
      }
      setInfo("Verification email sent. Please check your inbox.");
      setCooldown(60);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    if (!tokenParam && (!email || !resendUrl))
      navigate("/login", { replace: true });
  }, [email, resendUrl, tokenParam, navigate]);

  return (
    <div className="mx-auto max-w-md rounded border p-6 text-center">
      <h2 className="mb-2 text-xl font-semibold">Verify your email</h2>
      {info && (
        <div
          className={`mb-3 rounded border p-2 ${
            verified
              ? "border-cyan-200 bg-emerald-50 text-[#2DB8D1]"
              : "border-gray-200 bg-gray-50 text-gray-700"
          }`}
        >
          {info}
        </div>
      )}
      {err && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-red-700">
          {err}
        </div>
      )}

      {!verified && !tokenParam && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Please click the verification link we sent to <b>{email}</b>. You
            can request it again after the timer ends.
          </p>
          <button
            type="button"
            disabled={cooldown > 0}
            onClick={handleResend}
            className="rounded bg-cyan-300 px-4 py-2 text-white disabled:opacity-60"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
          <div className="mt-4 text-xs text-gray-500">
            Didn’t get it? Check spam or promotions.
            {kind === "email_change"
              ? " If the link expires, try updating your email again from your Profile."
              : " If the link expires, sign up again to generate a fresh link."}
          </div>
        </>
      )}
    </div>
  );
}
