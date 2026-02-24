import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Listbox } from "@headlessui/react";
import ReactCountryFlag from "react-country-flag";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

type Role = "tenant" | "owner" | "broker" | "builder";
type CountryOpt = { code: string; label: string; dial: string; flag: string };

const COUNTRY_OPTIONS: CountryOpt[] = [
  { code: "IN", label: "India", dial: "+91", flag: "🇮🇳" },
];

type SignupProps = { onSwitch: () => void };

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://admin.grihya.in/api";

function genStrongPassword(len = 16) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
  const arr = Array.from(crypto.getRandomValues(new Uint32Array(len)));
  return arr.map((x) => chars[x % chars.length]).join("");
}

function SignupForm({ onSwitch }: SignupProps): JSX.Element {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [role, setRole] = useState<Role>("tenant");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<CountryOpt>(COUNTRY_OPTIONS[0]);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");

  const [emailChecking, setEmailChecking] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneTaken, setPhoneTaken] = useState(false);

  const [googleMode, setGoogleMode] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);

  const emailBlocked = useMemo(
    () => /\bemail\b.\b(banned|blocked)\b/i.test(err),
    [err],
  );
  const phoneBlocked = useMemo(
    () => /\b(phone|mobile)\b.\b(banned|blocked)\b/i.test(err),
    [err],
  );

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const isIN = country.code === "IN";
  const validPhone = useMemo(
    () =>
      isIN ? /^[6-9]\d{9}$/.test(phoneDigits) : /^\d{10,15}$/.test(phoneDigits),
    [isIN, phoneDigits],
  );
  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim()),
    [email],
  );
  const fullPhone = useMemo(
    () => `${country.dial}${phoneDigits}`,
    [country, phoneDigits],
  );

  // Email availability
  useEffect(() => {
    setEmailTaken(false);
    const e = email.trim().toLowerCase();
    if (!e) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setEmailChecking(true);
        const res = await fetch(
          `${API_URL}/auth/available?email=${encodeURIComponent(e)}`,
          { signal: controller.signal },
        );
        const json = await res.json().catch(() => null);
        const taken = json?.available === false;
        setEmailTaken(taken);
        if (googleMode) setEmailLocked(!taken);
      } finally {
        setEmailChecking(false);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [email, googleMode]);

  // Phone availability
  useEffect(() => {
    setPhoneTaken(false);
    if (!validPhone) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setPhoneChecking(true);
        const res = await fetch(
          `${API_URL}/auth/available?phone=${encodeURIComponent(fullPhone)}`,
          { signal: controller.signal },
        );
        const json = await res.json().catch(() => null);
        setPhoneTaken(json?.available === false);
      } finally {
        setPhoneChecking(false);
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [validPhone, fullPhone]);

  // Google login
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setErr("");
        setInfo("");
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const profile = await res.json();
        if (profile?.email) setEmail(String(profile.email).toLowerCase());
        if (profile?.name) setName(String(profile.name));
        setGoogleMode(true);
        const autoPwd = genStrongPassword();
        setPassword(autoPwd);
        setConfirm(autoPwd);
        setEmailLocked(true);
        setInfo(
          "Google connected. Please select your role and add your mobile number to complete signup.",
        );
      } catch (e: any) {
        setErr(e?.message || "Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setErr("Google sign-in failed. Please try again."),
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");

    const trimmedEmail = email.trim().toLowerCase();
    const payload = {
      role,
      name: name.trim(),
      email: trimmedEmail,
      phone: fullPhone.trim(),
      password,
      city: city.trim(),
    };

    if (!payload.name || !payload.email || !phoneDigits || !payload.password)
      return setErr("Please fill all required fields");
    if (!validPhone) return setErr("Enter a valid 10-digit mobile number.");
    if (!googleMode && !emailValid)
      return setErr("Please enter a valid email address.");
    if (!googleMode && password !== confirm)
      return setErr("Passwords do not match");
    if (emailTaken) return setErr("This email is already registered.");
    if (phoneTaken) return setErr("This mobile number is already registered.");
    if (!payload.city) return setErr("Please enter your city.");

    try {
      setLoading(true);
      const resp = await signup(payload); // POST /auth/register

      if (resp?.pending_verification) {
        const verifyData = {
          email: resp.email || trimmedEmail,
          resendUrl: resp.resend_url as string,
        };
        sessionStorage.setItem("verifyEmail", JSON.stringify(verifyData));
        navigate("/verify-email", { state: verifyData });
        return;
      }
      setInfo("Account created. Please check your email to verify.");
    } catch (e: any) {
      // Prefer server’s message (works for both fetch- and axios-style errors)
      const serverMsg =
        e?.response?.data?.message || // axios
        e?.data?.message || // fetch (our signup above)
        e?.message ||
        "";

      const lower = String(serverMsg).toLowerCase();

      // Show banned/blocked exactly as backend sends it
      if (lower.includes("banned") || lower.includes("blocked")) {
        setErr(serverMsg);
      } else if (/(email).(already|taken)/i.test(lower)) {
        setErr("This email is already registered.");
      } else if (/((mobile|phone)).(already|used|registered)/i.test(lower)) {
        setErr("This mobile number is already registered.");
      } else if (e?.status === 422 || /unprocessable/i.test(lower)) {
        setErr(serverMsg || "Please check your inputs.");
      } else {
        setErr(serverMsg || "Could not create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled =
    loading ||
    phoneChecking ||
    emailChecking ||
    phoneTaken ||
    emailTaken ||
    !validPhone ||
    (!googleMode && !emailValid);

  const isLister = role === "owner" || role === "broker" || role === "builder";

  return (
    <div className="mx-auto max-w-[500px] md:max-w-[800px]">
      <div className="mx-auto w-full md:px-6 lg:px-8">
        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-md backdrop-blur sm:p-8 xl:col-span-7"
          >
            <div>
              <h2 className="text-center text-2xl font-bold text-gray-900">
                Sign Up
              </h2>
              <p className="mt-1 text-center text-gray-600">
                {isLister
                  ? "Reach more tenants with every listing."
                  : "Find great homes with zero brokerage."}
              </p>
            </div>

            {/* Google sign-in */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => googleLogin()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2.5 hover:bg-gray-50"
                disabled={loading}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="G"
                  className="h-5 w-5"
                />
                <span>{loading ? "Please wait…" : "Continue with Google"}</span>
              </button>
            </div>

            {err && (
              <div className="rounded border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
                {err}
              </div>
            )}
            {info && (
              <div className="rounded border-l-4 border-emerald-500 bg-emerald-50 p-3 text-emerald-700">
                {info}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-700 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
              >
                <option value="tenant">Tenant (looking to rent)</option>
                <option value="owner">Owner</option>
                <option value="broker">Broker/Agent</option>
                <option value="builder">Builder</option>
              </select>
            </div>

            {/* Name + Email */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email{" "}
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly={googleMode && emailLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border px-3 py-2.5 ${
                    emailTaken || (!emailValid && email)
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md outline-none focus:ring-2 focus:ring-[#2DB8D1] ${
                    googleMode && emailLocked ? "bg-gray-100 text-gray-600" : ""
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <div className="mt-1 text-xs">
                  {emailChecking && (
                    <span className="text-gray-500">Checking email…</span>
                  )}
                  {emailTaken && (
                    <div className="flex items-center gap-2 text-red-600">
                      This email is already registered.
                    </div>
                  )}
                  {!emailTaken && !emailChecking && email && !emailValid && (
                    <span className="text-red-600">
                      Please enter a valid email
                    </span>
                  )}
                  {!emailTaken && emailBlocked && (
                    <div className="text-red-600">
                      Your email has been blocked.
                    </div>
                  )}
                  {!emailTaken && googleMode && emailLocked && (
                    <span className="text-gray-500">
                      Using your Google email
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Country + Phone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Country
                </label>
                <Listbox value={country} onChange={setCountry}>
                  <div className="relative w-full">
                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-8 pr-7 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#2DB8D1]">
                      <span className="absolute inset-y-0 left-2 flex items-center">
                        <ReactCountryFlag
                          svg
                          countryCode={country.code}
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: 2,
                          }}
                        />
                      </span>
                      <span className="block truncate">{country.code}</span>
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="text-gray-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none">
                      {COUNTRY_OPTIONS.map((c) => (
                        <Listbox.Option
                          key={c.code}
                          value={c}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-1.5 pl-8 pr-2 ${
                              active ? "bg-gray-100" : ""
                            }`
                          }
                        >
                          <>
                            <span className="absolute inset-y-0 left-2 flex items-center">
                              <ReactCountryFlag
                                svg
                                countryCode={c.code}
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: 2,
                                }}
                              />
                            </span>
                            <span className="truncate">
                              {c.dial} - {c.label}
                            </span>
                          </>
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mobile number{" "}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-700">
                    {country.dial}
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      let digits = e.target.value.replace(/\D/g, "");
                      if (country.code === "IN") digits = digits.slice(0, 10);
                      setPhone(digits);
                    }}
                    className={`w-full rounded-r-md border px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2DB8D1] ${
                      phoneTaken || (!validPhone && phoneDigits.length > 0)
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="10-digit mobile"
                  />
                </div>
                <div className="mt-1 text-xs">
                  {phoneChecking && (
                    <span className="text-gray-500">Checking number…</span>
                  )}
                  {!validPhone && phoneDigits.length > 0 && (
                    <span className="text-red-600">
                      Enter a valid 10-digit mobile number
                    </span>
                  )}
                  {validPhone && phoneTaken && (
                    <span className="text-red-600">
                      This mobile number is already used (registered or pending)
                    </span>
                  )}
                  {validPhone && phoneBlocked && (
                    <span className="text-red-600">
                      Your phone number has been blocked.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
                placeholder="e.g., Dehradun"
              />
            </div>

            {/* Passwords (hidden in Google mode) */}
            {!googleMode && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#2DB8D1]"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitDisabled}
              className="w-full rounded-md bg-[#2DB8D1] py-2.5 text-white hover:bg-[#278b9d] disabled:opacity-70"
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitch}
                className="font-medium text-[#2DB8D1]"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
