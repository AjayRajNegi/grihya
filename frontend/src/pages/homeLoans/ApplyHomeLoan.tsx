import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://grihya/api";

// -------- Helpers --------
function emi(P: number, annualRate: number, years: number): number {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
const INR = (n: number) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const fmtINR = (n: number) => `₹ ${INR(Math.round(n))}`;

const Kpi: React.FC<{ label: string; value: string; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="rounded-lg border border-slate-200 p-4">
    <div className="text-xs text-slate-600">{label}</div>
    <div className="text-lg font-semibold text-slate-900">{value}</div>
    {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
  </div>
);

const Card: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, className }) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
      className || ""
    }`}
  >
    {(title || subtitle) && (
      <div className="mb-3">
        {title && (
          <div className="text-sm font-semibold text-slate-900">{title}</div>
        )}
        {subtitle && (
          <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
        )}
      </div>
    )}
    {children}
  </div>
);

// LTV meter
const LtvBar: React.FC<{ ltvPct: number }> = ({ ltvPct }) => {
  const pct = Math.max(0, Math.min(100, ltvPct || 0));
  const color =
    pct <= 75 ? "bg-emerald-500" : pct <= 90 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div>
      <div className="text-xs text-slate-700 mb-1 flex items-center gap-1.5">
        LTV (Loan-to-Value)
        <Info className="h-3.5 w-3.5 text-slate-500">
          <title>
            LTV is the loan amount as a % of property value. Many lenders allow
            up to ~90%.
          </title>
        </Info>
      </div>
      <div className="h-3 w-full rounded bg-slate-100 overflow-hidden">
        <div className={`h-3 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-600">
        <span>{pct.toFixed(1)}%</span>
        <span>≤ 90% typical cap</span>
      </div>
    </div>
  );
};

// Partner carousel (same style as EMI/Eligibility pages)
const BANK_CARDS = [
  {
    slug: "hdfc",
    name: "HDFC Ltd",
    tagline: "Fast approvals • Flexible tenure",
    range: "8.40% – 9.40%",
    gradient: "from-indigo-500 via-blue-600 to-blue-700",
  },
  {
    slug: "bank-of-maharashtra",
    name: "Bank of Maharashtra",
    tagline: "Public sector trust • Competitive rates",
    range: "8.35% – 9.35%",
    gradient: "from-emerald-500 via-emerald-600 to-teal-600",
  },
  {
    slug: "nainital-bank",
    name: "Nainital Bank",
    tagline: "Regional strength • Personalized service",
    range: "8.60% – 9.60%",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
  },
  {
    slug: "icici",
    name: "ICICI Bank",
    tagline: "Digital first • Quick processing",
    range: "8.50% – 9.50%",
    gradient: "from-rose-500 via-pink-500 to-orange-500",
  },
];

const CtaCarousel: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % BANK_CARDS.length),
      2000
    );
    return () => clearInterval(id);
  }, [paused]);

  const next = () => setIdx((i) => (i + 1) % BANK_CARDS.length);
  const prev = () =>
    setIdx((i) => (i - 1 + BANK_CARDS.length) % BANK_CARDS.length);
  const card = BANK_CARDS[idx];

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`bg-gradient-to-br ${card.gradient} p-4 sm:p-5 text-white min-h-[140px] flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold opacity-90">
            Partner spotlight
          </div>
          <div className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full">
            {idx + 1} / {BANK_CARDS.length}
          </div>
        </div>

        <div className="mt-2">
          <div className="text-xl font-bold leading-tight text-center">
            {card.name}
          </div>
          <div className="text-xs opacity-90 text-center">{card.tagline}</div>
          <div className="mt-2 text-sm text-center">
            Indicative rates:{" "}
            <span className="font-semibold">{card.range}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 justify-center">
          <Link
            to={`/home-loans/partners/${card.slug}`}
            className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white transition shadow-sm"
          >
            Check Loan Details
          </Link>
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        aria-label="Previous"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANK_CARDS.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to ${i + 1}`}
            onClick={() => setIdx(i)}
            className={[
              "h-1.5 rounded-full transition-all",
              idx === i ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/80",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
};

// FAQ (home-style)
type FaqItem = { q: string; a: React.ReactNode };
const FAQ: React.FC<{ items: FaqItem[]; idPrefix?: string }> = ({
  items,
  idPrefix = "apply",
}) => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#CCF0E1] text-[#2AB09C]">
              <HelpCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="relative inline-block text-2xl md:text-3xl font-bold text-gray-900 pb-1">
              Frequently Asked Questions
              <span
                aria-hidden
                className="absolute left-1/2 -bottom-2 h-1 w-24 md:w-28 -translate-x-1/2 rounded-full bg-[#2AB09C]"
              />
            </h2>
          </div>

          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
            {items.map((item, idx) => {
              const isOpen = open === idx;
              const contentId = `${idPrefix}-faq-panel-${idx}`;
              const btnId = `${idPrefix}-faq-button-${idx}`;
              return (
                <div key={idx} className="group">
                  <button
                    id={btnId}
                    aria-controls={contentId}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className={`w-full flex items-center justify-between text-left px-4 sm:px-6 py-4 sm:py-5 focus:outline-none transition-colors
                      ${isOpen ? "bg-[#CCF0E1]" : "bg-white"} hover:bg-gray-50`}
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-[#2AB09C] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={btnId}
                    aria-hidden={!isOpen}
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
                      ${
                        isOpen
                          ? "max-h-[1000px] opacity-100"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="relative pl-5 sm:pl-6 pr-4 text-gray-700 pb-6 pt-6">
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-0.5 bg-[#2AB09C]"
                      />
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// -------- Page --------
type Employment = "salaried" | "self";
type BankSlug =
  | "any"
  | "hdfc"
  | "bank-of-maharashtra"
  | "nainital-bank"
  | "icici";

const ApplyHomeLoan: React.FC = () => {
  // Contact
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Dehradun");

  // Loan inputs
  const [loanAmount, setLoanAmount] = useState<number>(3000000);
  const [propertyValue, setPropertyValue] = useState<number>(5000000);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [rate, setRate] = useState<number>(8.6);
  const [employment, setEmployment] = useState<Employment>("salaried");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(80000);
  const [existingEmi, setExistingEmi] = useState<number>(0);
  const [preferredBank, setPreferredBank] = useState<BankSlug>("any");

  // Misc
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  // Submitting
  const [submitting, setSubmitting] = useState(false);

  // Derived
  const ltvPct = useMemo(
    () => (propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0),
    [loanAmount, propertyValue]
  );
  const estEmi = useMemo(
    () => Math.round(emi(loanAmount, rate, tenureYears)),
    [loanAmount, rate, tenureYears]
  );
  const pfEst = useMemo(() => Math.round(loanAmount * 0.005), [loanAmount]); // ~0.5% processing fee (illustrative)

  const bankHint = useMemo(() => {
    switch (preferredBank) {
      case "hdfc":
        return "HDFC typical range: 8.40% – 9.40%";
      case "bank-of-maharashtra":
        return "Bank of Maharashtra typical range: 8.35% – 9.35%";
      case "nainital-bank":
        return "Nainital Bank typical range: 8.60% – 9.60%";
      case "icici":
        return "ICICI typical range: 8.50% – 9.50%";
      default:
        return "Select a preferred bank or keep Any";
    }
  }, [preferredBank]);

  function validate(): string | null {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!/^\d{10}$/.test(phone))
      return "Please enter a valid 10-digit phone number.";
    if (!/^\S+@\S+\.\S+$/.test(email))
      return "Please enter a valid email address.";
    if (loanAmount <= 0) return "Please enter a valid loan amount.";
    if (propertyValue <= 0) return "Please enter a valid property value.";
    if (!consent) return "Please accept the consent to proceed.";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrors(err);
      return;
    }
    setErrors(null);
    setSubmitting(true);

    const payload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city,

      loan_amount: loanAmount,
      property_value: propertyValue,
      tenure_years: tenureYears,
      rate,
      employment,
      monthly_income: monthlyIncome || 0,
      existing_emi: existingEmi || 0,
      preferred_bank: preferredBank,

      notes,
      consent,
    };

    fetch(`${API_URL}/home-loans/applications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          let message = "Submission failed";
          try {
            const j = JSON.parse(txt);
            if (j?.errors) {
              const firstErr = Object.values(j.errors)[0] as
                | string[]
                | undefined;
              message = firstErr?.[0] || message;
            } else if (j?.message) {
              message = j.message;
            }
          } catch {}
          throw new Error(message);
        }
        return res.json();
      })
      .then(() => {
        setSubmitted(true);
      })
      .catch((e: any) => {
        setErrors(e.message || "Something went wrong");
      })
      .finally(() => setSubmitting(false));
  }

  const faqs: FaqItem[] = [
    {
      q: "What happens after I submit?",
      a: (
        <p>
          Our team will call you to verify details and match lender offers.
          You’ll get curated options from our partner banks, and we’ll guide you
          on documents and next steps.
        </p>
      ),
    },
    {
      q: "Is my information safe?",
      a: (
        <p>
          Yes. Your data is used only to assist with your loan application and
          is never sold to third parties.
        </p>
      ),
    },
    {
      q: "Can I change my preferred bank later?",
      a: (
        <p>
          Absolutely. You can compare offers and switch your choice during the
          process.
        </p>
      ),
    },
    {
      q: "What is a good LTV?",
      a: (
        <p>
          LTV up to 90% is typical. Lower LTVs (more down payment) may fetch
          better rates and faster approvals.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {!submitted ? (
          <>
            {/* Hero */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Apply Home Loan
              </h1>
              <p className="mt-2 text-slate-600">
                Share your details to get personalized offers from HDFC, Bank of
                Maharastra, Nainital Bank, ICICI and more. Fast, secure, and
                free.
              </p>
            </div>

            {/* Form + KPIs */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
              {/* Left: Contact and Loan details */}
              <div className="lg:col-span-2 space-y-6">
                <Card title="Contact details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Full name
                      </span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Phone (10 digits)
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        required
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        We’ll call to confirm details and share offers.
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Email
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        required
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        For sharing quotes and documentation checklist.
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        City
                      </span>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      >
                        {[
                          "Dehradun",
                          "Bangalore",
                          "Delhi NCR",
                          "Mumbai",
                          "Pune",
                        ].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </Card>

                <Card title="Loan details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Property value (₹)
                      </span>
                      <input
                        type="number"
                        value={propertyValue}
                        onChange={(e) =>
                          setPropertyValue(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        min={0}
                        required
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Stamp duty/registration not included in loan by default.
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Loan amount (₹)
                      </span>
                      <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) =>
                          setLoanAmount(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        min={0}
                        required
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Try to keep LTV ≤ 90% for faster approvals.
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Tenure (years)
                      </span>
                      <input
                        type="number"
                        value={tenureYears}
                        onChange={(e) =>
                          setTenureYears(
                            Math.max(1, parseInt(e.target.value || "1", 10))
                          )
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        min={1}
                        max={35}
                        required
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Longer tenure → lower EMI, but higher total interest.
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Expected rate (p.a.)
                      </span>
                      <input
                        type="number"
                        step={0.1}
                        value={rate}
                        onChange={(e) =>
                          setRate(
                            Math.max(0, parseFloat(e.target.value || "0"))
                          )
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        required
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Most offers are floating (repo‑linked); they can change
                        with RBI moves.
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Employment type
                      </span>
                      <div className="mt-1 flex gap-4">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            checked={employment === "salaried"}
                            onChange={() => setEmployment("salaried")}
                          />
                          Salaried
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            checked={employment === "self"}
                            onChange={() => setEmployment("self")}
                          />
                          Self‑employed
                        </label>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Self‑employed may need additional financials (ITR, P&L).
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Monthly income (₹) (optional)
                      </span>
                      <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) =>
                          setMonthlyIncome(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        min={0}
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Helps us pre‑assess your eligibility and FOIR.
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Ongoing EMIs (₹/mo) (optional)
                      </span>
                      <input
                        type="number"
                        value={existingEmi}
                        onChange={(e) =>
                          setExistingEmi(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        min={0}
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Includes credit cards converted to EMIs, personal loans,
                        etc.
                      </div>
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="text-xs font-medium text-slate-700">
                        Preferred bank
                      </span>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                        {(
                          [
                            "any",
                            "hdfc",
                            "bank-of-maharashtra",
                            "nainital-bank",
                            "icici",
                          ] as BankSlug[]
                        ).map((b) => (
                          <label
                            key={b}
                            className="inline-flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name="preferredBank"
                              checked={preferredBank === b}
                              onChange={() => setPreferredBank(b)}
                            />
                            <span className="capitalize">
                              {b === "any"
                                ? "Any"
                                : b === "bank-of-maharashtra"
                                ? "Bank of Maharashtra"
                                : b === "nainital-bank"
                                ? "Nainital Bank"
                                : b.toUpperCase()}
                            </span>
                          </label>
                        ))}
                        <span className="text-[11px] text-slate-500">
                          ({bankHint})
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Kpi
                      label="Estimated EMI"
                      value={fmtINR(estEmi)}
                      hint={`@ ${rate}% for ${tenureYears} years`}
                    />
                    <Kpi
                      label="LTV"
                      value={`${ltvPct.toFixed(1)}%`}
                      hint={
                        ltvPct > 90
                          ? "May be restricted by lender"
                          : "Within common limits"
                      }
                    />
                    <Kpi
                      label="Processing fee (est.)"
                      value={fmtINR(pfEst)}
                      hint="~0.5% of loan amount (varies by lender)"
                    />
                  </div>

                  <div className="mt-4">
                    <LtvBar ltvPct={ltvPct} />
                  </div>
                </Card>

                <Card title="Additional notes (optional)">
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Any special requirements or info..."
                  />
                </Card>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    I agree to be contacted for loan assistance and offers.
                  </label>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`rounded-md px-4 py-2 text-white ${
                      submitting
                        ? "bg-emerald-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {submitting ? "Submitting…" : "Submit application"}
                  </button>
                </div>

                {errors && (
                  <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {errors}
                  </div>
                )}
              </div>

              {/* Right: Summary + partners carousel */}
              <div className="space-y-4">
                <Card title="Your quick summary">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>
                        Expected EMI:{" "}
                        <span className="font-semibold">
                          {fmtINR(estEmi)}/mo
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>
                        LTV:{" "}
                        <span className="font-semibold">
                          {ltvPct.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>
                        Processing fee (est.):{" "}
                        <span className="font-semibold">{fmtINR(pfEst)}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Estimates are illustrative; final offer depends on profile
                      and lender policy.
                    </div>
                  </div>
                </Card>

                <Card title="Top partner banks">
                  <CtaCarousel />
                </Card>

                <Card title="How it works">
                  <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1.5">
                    <li>Submit your application (1–2 min).</li>
                    <li>Verification call & document list.</li>
                    <li>Offer comparisons from partner banks.</li>
                    <li>Finalise, sign, and disbursal.</li>
                  </ol>
                </Card>

                <Card title="Documents checklist (illustrative)">
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>KYC: PAN, Aadhaar</li>
                    <li>Income: Salary slips/ITR, bank statements</li>
                    <li>Property: Agreement, title, NOC as applicable</li>
                    <li>Employment proof</li>
                  </ul>
                </Card>
              </div>
            </form>

            {/* Eligibility criteria quick reference */}
            <div className="mt-8">
              <Card
                title="Home Loan Eligibility  -  Quick checklist"
                subtitle="Typical benchmarks (vary by lender)"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">Age</div>
                    <div className="text-slate-700 mt-1">18–70 years</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Credit score
                    </div>
                    <div className="text-slate-700 mt-1">
                      650+ considered good
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Monthly income
                    </div>
                    <div className="text-slate-700 mt-1">Min. ₹ 25,000</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Nationality
                    </div>
                    <div className="text-slate-700 mt-1">
                      Indian residents, NRIs, PIOs
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4 md:col-span-2">
                    <div className="font-medium text-slate-900">
                      Loan-to-Value (LTV)
                    </div>
                    <div className="text-slate-700 mt-1">
                      Up to 90% of property value
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Note: Final sanction will be the lower of income‑based
                      eligibility and LTV‑based maximum.
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Glossary / Terms explained */}
            <div className="mt-8">
              <Card
                title="Understand the terms"
                subtitle="Short explanations of common terms"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      LTV (Loan‑to‑Value)
                    </div>
                    <p className="mt-1">
                      Loan amount as a % of property value. Higher LTV = smaller
                      down payment; many lenders cap at ~90%.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">FOIR</div>
                    <p className="mt-1">
                      Fixed Obligations to Income Ratio: portion of income
                      available for EMIs after existing obligations.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Floating vs Fixed Rate
                    </div>
                    <p className="mt-1">
                      Floating (repo‑linked) moves with RBI policy; fixed stays
                      the same for a defined period.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">APR</div>
                    <p className="mt-1">
                      Annual Percentage Rate reflects total cost including fees;
                      helps compare offers beyond the headline rate.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">Pre‑EMI</div>
                    <p className="mt-1">
                      Interest‑only payment before full disbursal (common in
                      under‑construction properties).
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Foreclosure / Prepayment
                    </div>
                    <p className="mt-1">
                      Closing part/all of the loan early. Many lenders allow
                      partial prepayment with minimal or no charges.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Balance Transfer
                    </div>
                    <p className="mt-1">
                      Move loan to another bank at a lower rate; often combined
                      with a top‑up loan.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Sanction vs Disbursal
                    </div>
                    <p className="mt-1">
                      Sanction is approval (limit, rate, tenure). Disbursal is
                      the actual payout to seller/builder.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Co‑applicant
                    </div>
                    <p className="mt-1">
                      Adding a co‑applicant’s income can improve eligibility and
                      rate offers.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Insurance (Credit/Property)
                    </div>
                    <p className="mt-1">
                      Optional loan cover and property insurance may be bundled;
                      not mandatory - compare costs.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Processing Fee
                    </div>
                    <p className="mt-1">
                      One‑time charge (often 0.25%–1%) for processing the loan;
                      negotiate where possible.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="font-medium text-slate-900">
                      Disbursement Linked Plan
                    </div>
                    <p className="mt-1">
                      For under‑construction homes, disbursals are linked to
                      construction stages; EMIs rise as payouts increase.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* FAQ */}
            <FAQ items={faqs} idPrefix="apply" />
          </>
        ) : (
          // Success state
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5" />
                <div>
                  <h2 className="text-xl font-semibold">
                    Thanks, {fullName || "there"}!
                  </h2>
                  <p className="mt-1 text-sm">
                    We’ve received your request. Our loan expert will contact
                    you shortly at {phone || "your number"} and{" "}
                    {email || "your email"}.
                  </p>
                  <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
                    <li>Keep your KYC and income documents handy.</li>
                    <li>
                      We’ll share offers from HDFC, Bank of Maharashtra,
                      Nainital Bank, ICICI and more.
                    </li>
                    <li>No charges for applying via EasyLease.</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to="/home-loans/emi-calculator"
                      className="rounded-md bg-white px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100"
                    >
                      Try EMI Calculator
                    </Link>
                    <Link
                      to="/home-loans/eligibility-calculator"
                      className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-100"
                    >
                      Check Eligibility
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Card title="What happens next?">
                <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1.5">
                  <li>Verification call within business hours.</li>
                  <li>Document checklist and pickup.</li>
                  <li>Offer comparison and selection.</li>
                  <li>Sanction and disbursal.</li>
                </ol>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ApplyHomeLoan;
