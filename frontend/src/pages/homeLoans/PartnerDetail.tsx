import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://grihya/api";

// -------------------- Helpers --------------------
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

// -------------------- UI atoms --------------------
const Badge: React.FC<{
  children: React.ReactNode;
  color?: "green" | "gray" | "blue";
}> = ({ children, color = "gray" }) => {
  const map: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gray: "bg-slate-50 text-slate-700 border-slate-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] ${map[color]}`}
    >
      {children}
    </span>
  );
};

// Slim visual band for interest range scaled to global min/max
const RateRangeBar: React.FC<{
  min: number;
  max: number;
  globalMin: number;
  globalMax: number;
}> = ({ min, max, globalMin, globalMax }) => {
  const toPct = (v: number) =>
    ((v - globalMin) / Math.max(0.0001, globalMax - globalMin)) * 100;
  const left = Math.max(0, Math.min(100, toPct(min)));
  const width = Math.max(1, Math.min(100, toPct(max) - left));

  return (
    <div>
      <div className="relative h-2 rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 rounded-full bg-emerald-500/80"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      <div className="mt-1 text-[11px] text-slate-600">
        {min.toFixed(2)}% – {max.toFixed(2)}%
      </div>
    </div>
  );
};

// -------------------- Partner data --------------------
type PartnerInfo = {
  name: string;
  range: string;
  minRate: number;
  maxRate: number;
  site?: string;
  snapshot: {
    maxLtv: string;
    foir: string;
    tenure: string;
    prepayment: string;
    processingFee: string;
    legalTech?: string;
  };
};

const PARTNERS: Record<string, PartnerInfo> = {
  hdfc: {
    name: "HDFC Ltd",
    range: "8.40% – 9.40%",
    minRate: 8.4,
    maxRate: 9.4,
    site: "https://www.hdfc.com",
    snapshot: {
      maxLtv: "Up to 90% of property value",
      foir: "Typically ~40–55%",
      tenure: "Up to 30–35 years",
      prepayment: "Generally allowed; check latest charges",
      processingFee: "~0.25%–1% (offer dependent)",
      legalTech: "Legal + technical charges may apply (varies by case)",
    },
  },
  "bank-of-maharashtra": {
    name: "Bank of Maharashtra",
    range: "8.35% – 9.35%",
    minRate: 8.35,
    maxRate: 9.35,
    site: "https://bankofmaharashtra.in",
    snapshot: {
      maxLtv: "Up to 90% of property value",
      foir: "Typically ~40–50%",
      tenure: "Up to 30–35 years",
      prepayment: "Generally allowed; check latest charges",
      processingFee: "~0.25%–1% (offer dependent)",
      legalTech: "Legal + technical appraisal charges (as applicable)",
    },
  },
  "nainital-bank": {
    name: "Nainital Bank",
    range: "8.60% – 9.60%",
    minRate: 8.6,
    maxRate: 9.6,
    site: "https://www.nainitalbank.co.in",
    snapshot: {
      maxLtv: "Up to 85%–90% of property value",
      foir: "Typically ~40–55%",
      tenure: "Up to 25–30 years",
      prepayment: "Generally allowed; check latest charges",
      processingFee: "~0.25%–1% (offer dependent)",
      legalTech: "Legal scrutiny + technical evaluation (varies)",
    },
  },
  icici: {
    name: "ICICI Bank",
    range: "8.50% – 9.50%",
    minRate: 8.5,
    maxRate: 9.5,
    site: "https://www.icicibank.com",
    snapshot: {
      maxLtv: "Up to 90% of property value",
      foir: "Typically ~40–55%",
      tenure: "Up to 30–35 years",
      prepayment: "Generally allowed; check latest charges",
      processingFee: "~0.25%–1% (offer dependent)",
      legalTech: "Legal + technical charges as per case",
    },
  },
};

type FaqItem = { q: string; a: React.ReactNode };
const FAQ: React.FC<{ items: FaqItem[]; idPrefix?: string }> = ({
  items,
  idPrefix = "partner",
}) => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-12 bg-white rounded-xl border border-slate-200 px-4 sm:px-6 mt-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#CCF0E1] text-[#2AB09C]">
            <HelpCircle className="h-6 w-6" />
          </div>
        </div>
        <div className="text-center mb-6">
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

        <p className="mt-4 text-xs text-slate-500">
          Disclaimer: Content is illustrative. Please confirm the latest
          policies/charges with the lender before applying.
        </p>
      </div>
    </section>
  );
};

// -------------------- Carousel (Explore other banks) - CTA style --------------------
type BankPreview = {
  slug: string;
  name: string;
  range: string;
  minRate: number;
  maxRate: number;
};

const CtaCarousel: React.FC<{
  items: BankPreview[];
  partners: Record<string, PartnerInfo>;
}> = ({ items, partners }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const safeItems = items.length
    ? items
    : Object.keys(partners).map((slug) => ({
        slug,
        name: partners[slug].name,
        range: partners[slug].range,
        minRate: partners[slug].minRate,
        maxRate: partners[slug].maxRate,
      }));
  const clampedIdx = idx % safeItems.length;
  const active = safeItems[clampedIdx];
  const gradients: Record<string, string> = {
    hdfc: "from-indigo-500 via-blue-600 to-blue-700",
    "bank-of-maharashtra": "from-emerald-500 via-emerald-600 to-teal-600",
    "nainital-bank": "from-yellow-500 via-amber-500 to-orange-500",
    icici: "from-rose-500 via-pink-500 to-orange-500",
    default: "from-slate-700 via-slate-700 to-slate-800",
  };
  const taglines: Record<string, string> = {
    hdfc: "Fast approvals • Flexible tenure",
    "bank-of-maharashtra": "Public sector trust • Competitive rates",
    "nainital-bank": "Regional strength • Personalized service",
    icici: "Digital first • Quick processing",
    default: "Trusted lender • Tailored options",
  };
  const gradient = gradients[active?.slug] || gradients.default;
  const tagline = taglines[active?.slug] || taglines.default;

  useEffect(() => {
    if (paused || safeItems.length <= 1) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % safeItems.length),
      3000
    );
    return () => clearInterval(id);
  }, [paused, safeItems.length]);

  const next = () => setIdx((i) => (i + 1) % safeItems.length);
  const prev = () =>
    setIdx((i) => (i - 1 + safeItems.length) % safeItems.length);

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`bg-gradient-to-br ${gradient} p-4 sm:p-5 text-white min-h-[160px] flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold opacity-90">
            Partner spotlight
          </div>
          <div className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full">
            {clampedIdx + 1} / {safeItems.length}
          </div>
        </div>

        <div className="mt-2">
          <div className="text-xl font-bold leading-tight text-center">
            {partners[active.slug]?.name || active.name}
          </div>
          <div className="text-xs opacity-90 text-center">{tagline}</div>
          <div className="mt-2 text-sm text-center">
            Indicative rates:{" "}
            <span className="font-semibold">
              {partners[active.slug]?.range || active.range}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 justify-center">
          <Link
            to={`/home-loans/partners/${active.slug}`}
            className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white transition shadow-sm"
          >
            Check Loan Details
          </Link>
        </div>
      </div>

      {/* Controls */}
      {safeItems.length > 1 && (
        <>
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
            {safeItems.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to ${i + 1}`}
                onClick={() => setIdx(i)}
                className={[
                  "h-1.5 rounded-full transition-all",
                  clampedIdx === i
                    ? "w-5 bg-white"
                    : "w-2 bg-white/60 hover:bg-white/80",
                ].join(" ")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// -------------------- Compare Offers (less congested) --------------------
type SortKey = "emi" | "rate" | "ltv" | "name";
type ViewMode = "cards" | "table";
const parseLtv = (s: string) => {
  const m = s.match(/(\d+)\s*%/g);
  if (!m) return 0;
  const first = m[0].match(/(\d+)/);
  return first ? Number(first[1]) : 0;
};

const CompareOffers: React.FC<{
  partners: Record<string, PartnerInfo>;
  selectedSlug: string;
  sampleAmount?: number;
  sampleYears?: number;
}> = ({ partners, selectedSlug, sampleAmount = 2500000, sampleYears = 20 }) => {
  const rows = Object.entries(partners).map(([slug, p]) => {
    const typicalRate = (p.minRate + p.maxRate) / 2;
    return {
      slug,
      name: p.name,
      range: p.range,
      minRate: p.minRate,
      maxRate: p.maxRate,
      typicalRate,
      processingFee: p.snapshot.processingFee,
      maxLtv: p.snapshot.maxLtv,
      prepayment: p.snapshot.prepayment,
      emi: Math.round(emi(sampleAmount, typicalRate, sampleYears)),
    };
  });

  const globalMin = Math.min(...rows.map((r) => r.minRate));
  const globalMax = Math.max(...rows.map((r) => r.maxRate));

  const [sortKey, setSortKey] = useState<SortKey>("emi");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("cards");

  const sorted = useMemo(() => {
    const filtered = rows.filter((r) =>
      r.name.toLowerCase().includes(query.toLowerCase())
    );
    const dir = sortDir === "asc" ? 1 : -1;
    const cmp = (a: (typeof rows)[number], b: (typeof rows)[number]) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "ltv")
        return (parseLtv(a.maxLtv) - parseLtv(b.maxLtv)) * dir;
      if (sortKey === "rate") return (a.typicalRate - b.typicalRate) * dir;
      return (a.emi - b.emi) * dir;
    };
    return filtered.sort(cmp);
  }, [rows, sortKey, sortDir, query]);

  const setSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  return (
    <Card
      title="Compare bank offers"
      subtitle={`Sorted by ${
        sortKey === "emi"
          ? "EMI"
          : sortKey === "rate"
          ? "Typical rate"
          : sortKey === "ltv"
          ? "Max LTV"
          : "Name"
      } (${sortDir}) • EMI based on ₹${(sampleAmount / 1e5).toFixed(
        1
      )}L for ${sampleYears} yrs`}
      className="mt-2"
    >
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-slate-200 overflow-hidden">
            {[
              { key: "emi", label: "EMI" },
              { key: "rate", label: "Rate" },
              { key: "ltv", label: "LTV" },
              { key: "name", label: "Name" },
            ].map(({ key, label }) => {
              const active = sortKey === (key as SortKey);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSort(key as SortKey)}
                  className={`px-3 py-1.5 text-sm ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="inline-flex rounded-md border border-slate-200 overflow-hidden ml-1">
            {(["cards", "table"] as ViewMode[]).map((v) => {
              const active = view === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {v === "cards" ? "Cards" : "Table"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search banks..."
            className="w-full lg:w-64 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Cards view (default): relaxed, airy */}
      {view === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((r) => {
            const isActive = r.slug === selectedSlug;
            return (
              <div
                key={r.slug}
                className={`rounded-xl border p-4 hover:shadow-sm transition ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{r.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Typical: {r.range}
                    </div>
                  </div>
                  {isActive && <Badge color="green">You’re here</Badge>}
                </div>

                <div className="mt-3">
                  <div className="text-xs font-medium text-slate-700 mb-1">
                    Interest band vs market
                  </div>
                  <RateRangeBar
                    min={r.minRate}
                    max={r.maxRate}
                    globalMin={globalMin}
                    globalMax={globalMax}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-600">Est. EMI</div>
                    <div className="text-lg font-semibold">
                      {fmtINR(r.emi)}/mo
                    </div>
                  </div>
                  <Link
                    to={`/home-loans/emi-calculator`}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                  >
                    View →
                  </Link>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="rounded border border-slate-200 p-2">
                    <div className="font-medium text-slate-900">Processing</div>
                    <div className="mt-0.5">{r.processingFee}</div>
                  </div>
                  <div className="rounded border border-slate-200 p-2">
                    <div className="font-medium text-slate-900">Max LTV</div>
                    <div className="mt-0.5">{r.maxLtv}</div>
                  </div>
                  <div className="rounded border border-slate-200 p-2 col-span-2">
                    <div className="font-medium text-slate-900">Prepayment</div>
                    <div className="mt-0.5">{r.prepayment}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view (simplified to reduce clutter) */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 mt-1">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Bank</th>
                <th className="px-3 py-2 text-left font-medium">Interest</th>
                <th className="px-3 py-2 text-left font-medium">Max LTV</th>
                <th className="px-3 py-2 text-right font-medium">Est. EMI</th>
                <th className="px-3 py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const isActive = r.slug === selectedSlug;
                return (
                  <tr
                    key={r.slug}
                    className={`odd:bg-white even:bg-slate-50 ${
                      isActive ? "ring-1 ring-emerald-200 bg-emerald-50/40" : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Processing: {r.processingFee}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Prepayment: {r.prepayment}
                      </div>
                    </td>
                    <td className="px-3 py-2 w-[260px] align-top">
                      <RateRangeBar
                        min={r.minRate}
                        max={r.maxRate}
                        globalMin={globalMin}
                        globalMax={globalMax}
                      />
                    </td>
                    <td className="px-3 py-2 align-top">{r.maxLtv}</td>
                    <td className="px-3 py-2 text-right font-semibold align-top">
                      {fmtINR(r.emi)}
                    </td>
                    <td className="px-3 py-2 text-right align-top">
                      <Link
                        to={`/home-loans/emi-calculator`}
                        className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-[11px] text-slate-500 mt-3">
        Note: Policies/fees can change; confirm with the lender.
      </div>
    </Card>
  );
};

// -------------------- Page --------------------
const PartnerDetail: React.FC = () => {
  const { slug = "" } = useParams();
  const k = String(slug).toLowerCase();
  const partner = PARTNERS[k];
  const navigate = useNavigate();

  // Personalized offer form state
  const [fName, setFName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Dehradun");
  const [pLoanAmt, setPLoanAmt] = useState(3000000);
  const [pTenure, setPTenure] = useState(20);
  const [pIncome, setPIncome] = useState(80000);
  const [pEmiObl, setPEmiObl] = useState(0);
  const [consent, setConsent] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [formDone, setFormDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quick EMI Preview inside overview
  const defaultRate = partner ? (partner.minRate + partner.maxRate) / 2 : 9;
  const [qAmount, setQAmount] = useState(2500000);
  const [qRate, setQRate] = useState(defaultRate);
  const [qYears, setQYears] = useState(20);
  const qEmi = useMemo(
    () => Math.round(emi(qAmount, qRate, qYears)),
    [qAmount, qRate, qYears]
  );

  // Comparison list of other partners
  const others: BankPreview[] = Object.entries(PARTNERS)
    .filter(([key]) => key !== k)
    .map(([key, p]) => ({
      slug: key,
      name: p.name,
      range: p.range,
      minRate: p.minRate,
      maxRate: p.maxRate,
    }));

  function validateForm(): string | null {
    if (!fName.trim()) return "Please enter your full name.";
    if (!/^\d{10}$/.test(phone))
      return "Please enter a valid 10-digit phone number.";
    if (!/^\S+@\S+\.\S+$/.test(email))
      return "Please enter a valid email address.";
    if (pLoanAmt <= 0) return "Please enter a valid loan amount.";
    if (!consent) return "Please accept the consent to proceed.";
    return null;
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormErr(err);
      return;
    }
    setFormErr(null);
    setSubmitting(true);

    const payload = {
      full_name: fName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city,
      partner_slug: k, // from useParams()
      loan_amount: pLoanAmt,
      tenure_years: pTenure,
      monthly_income: pIncome || 0,
      existing_emi: pEmiObl || 0,

      consent,
      notes: "", // optional
    };

    fetch(`${API_URL}/home-loans/partner-leads`, {
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
        setFormDone(true);
      })
      .catch((e: any) => {
        setFormErr(e.message || "Something went wrong");
      })
      .finally(() => setSubmitting(false));
  }

  if (!partner) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            Unknown partner.{" "}
            <Link to="/" className="text-rose-700 underline">
              Go home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const faqs: FaqItem[] = [
    {
      q: "Are rates fixed or floating?",
      a: (
        <>
          Most offers are floating (repo‑linked) and can change with RBI moves;
          fixed rate options may be available for specific durations.
        </>
      ),
    },
    {
      q: "Can I prepay without charges?",
      a: (
        <>
          Many lenders allow part‑prepayment with minimal or no charges for
          floating‑rate loans. Always check your sanction letter.
        </>
      ),
    },
    {
      q: "What is a good LTV?",
      a: (
        <>
          Up to 90% is typical. A lower LTV (higher down payment) can help you
          negotiate better terms and faster approvals.
        </>
      ),
    },
  ];

  const globalMinRate = Math.min(
    ...Object.values(PARTNERS).map((p) => p.minRate)
  );
  const globalMaxRate = Math.max(
    ...Object.values(PARTNERS).map((p) => p.maxRate)
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="mb-6">
          <div className="mb-6 flex items-center gap-2">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 w-9 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95 cursor-pointer"
              title="Back"
            >
              <span className="text-2xl md:text-3xl font-extrabold leading-none">
                <img src="/less_than_icon.png" alt="Back-Icon" />
              </span>
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {partner.name} - Home Loans
            </h1>
          </div>
          <p className="mt-2 text-slate-600">
            Indicative interest rate range: {partner.range}. Final rates depend
            on your profile and lender policy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Overview of the bank">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Quick EMI preview
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Amount (₹)
                      </span>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={qAmount}
                        min={0}
                        onChange={(e) =>
                          setQAmount(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Rate (%)
                      </span>
                      <input
                        type="number"
                        step={0.05}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={qRate}
                        onChange={(e) =>
                          setQRate(
                            Math.max(0, parseFloat(e.target.value || "0"))
                          )
                        }
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Typical: {partner.minRate}–{partner.maxRate}%
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Tenure (years)
                      </span>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={qYears}
                        onChange={(e) =>
                          setQYears(
                            Math.max(1, parseInt(e.target.value || "1", 10))
                          )
                        }
                        min={1}
                        max={35}
                      />
                    </label>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Kpi label="Monthly EMI" value={fmtINR(qEmi)} />
                    <Kpi
                      label="Approx. Interest"
                      value={fmtINR(qEmi * 12 * qYears - qAmount)}
                    />
                    <Kpi
                      label="Processing fee (est.)"
                      value={fmtINR(qAmount * 0.005)}
                      hint="~0.5% of loan amount"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="text-xs font-medium text-slate-700 mb-1">
                      Interest band vs market
                    </div>
                    <RateRangeBar
                      min={partner.minRate}
                      max={partner.maxRate}
                      globalMin={globalMinRate}
                      globalMax={globalMaxRate}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-900 mb-2">
                    Features & charges
                  </div>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li className="rounded border border-slate-200 p-3">
                      <div className="font-medium text-slate-900">
                        Interest rate
                      </div>
                      <div>
                        Typical band {partner.range}. Floating (repo-linked) in
                        most cases; fixed options may exist.
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Benefit: Lower rates during easing cycles.
                      </div>
                    </li>
                    <li className="rounded border border-slate-200 p-3">
                      <div className="font-medium text-slate-900">
                        Processing fees
                      </div>
                      <div>
                        {partner.snapshot.processingFee}. Often negotiable
                        during bank campaigns.
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Benefit: Watch for limited-time fee waivers.
                      </div>
                    </li>
                    <li className="rounded border border-slate-200 p-3">
                      <div className="font-medium text-slate-900">
                        Prepayment charges
                      </div>
                      <div>
                        {partner.snapshot.prepayment}. Floating-rate loans often
                        allow part-prepay with minimal/no charges.
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Benefit: Reduce interest outgo by prepaying whenever
                        possible.
                      </div>
                    </li>
                    <li className="rounded border border-slate-200 p-3">
                      <div className="font-medium text-slate-900">
                        Legal & technical
                      </div>
                      <div>
                        {partner.snapshot.legalTech ||
                          "Legal & technical charges as per case"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Tip: Keep property docs ready for faster turnaround.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card title="Key documents required">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                <li className="rounded border border-slate-200 p-3">
                  KYC (PAN, Aadhaar)
                </li>
                <li className="rounded border border-slate-200 p-3">
                  Income docs (salary slips/ITR) + bank statements
                </li>
                <li className="rounded border border-slate-200 p-3">
                  Property docs (agreement/title/NOC as applicable)
                </li>
                <li className="rounded border border-slate-200 p-3">
                  Employment proof & address proof
                </li>
              </ul>
            </Card>
          </div>

          {/* Right 1 col: Personalized offer form */}
          <div>
            <Card
              title="Get a personalized home loan offer"
              subtitle={`From ${partner.name} & other partners`}
            >
              {!formDone ? (
                <form onSubmit={submitForm} className="space-y-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700">
                      Full name
                    </span>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      required
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Phone
                      </span>
                      <input
                        type="tel"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Email
                      </span>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700">
                      City
                    </span>
                    <select
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
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
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Loan amount (₹)
                      </span>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={pLoanAmt}
                        min={0}
                        onChange={(e) =>
                          setPLoanAmt(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Tenure (years)
                      </span>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={pTenure}
                        onChange={(e) =>
                          setPTenure(
                            Math.max(1, parseInt(e.target.value || "1", 10))
                          )
                        }
                        min={1}
                        max={35}
                        required
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Monthly income (₹)
                      </span>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={pIncome}
                        min={0}
                        onChange={(e) =>
                          setPIncome(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-slate-700">
                        Ongoing EMIs (₹/mo)
                      </span>
                      <input
                        type="number"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={pEmiObl}
                        min={0}
                        onChange={(e) =>
                          setPEmiObl(
                            Math.max(0, parseInt(e.target.value || "0", 10))
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    I agree to be contacted for personalized loan options.
                  </label>

                  {formErr && (
                    <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
                      {formErr}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`rounded-md px-4 py-2 text-white ${
                        submitting
                          ? "bg-emerald-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {submitting ? "Submitting…" : "Get my offer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">
                        Thanks! We’ve received your request.
                      </div>
                      <div className="text-xs mt-1">
                        Our specialist will contact you shortly with curated
                        options.
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          to="/home-loans/emi-calculator"
                          className="rounded-md bg-white px-3 py-1.5 text-xs text-emerald-700 border border-emerald-600 hover:bg-emerald-50"
                        >
                          Try EMI Calculator
                        </Link>
                        <Link
                          to="/home-loans/eligibility-calculator"
                          className="rounded-md bg-white px-3 py-1.5 text-xs text-emerald-700 border border-emerald-600 hover:bg-emerald-50"
                        >
                          Check Eligibility
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Comparison of bank offers (less congested + view toggle) */}
        <CompareOffers
          partners={PARTNERS}
          selectedSlug={k}
          sampleAmount={qAmount}
          sampleYears={qYears}
        />

        {/* Guide + Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card title="Complete guide to home loans">
            <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1.5">
              <li>
                Assess budget: EMI comfort, down payment, and emergency fund.
              </li>
              <li>Check eligibility: income, FOIR, credit score, tenure.</li>
              <li>Compare offers: rate, fees, LTV, and prepayment policy.</li>
              <li>
                Collect documents: KYC, income, property, and employment proofs.
              </li>
              <li>
                Apply & verify: property valuation, legal checks, sanction.
              </li>
              <li>Disbursal: staged or full, depending on property status.</li>
              <li>
                Post‑disbursal: set up auto‑debit, track rate changes, plan
                prepayments.
              </li>
            </ol>
          </Card>

          {/* Explore other banks — CTA carousel (like Eligibility page) */}
          <Card
            title="Explore other banks"
            subtitle="Auto‑rotate. Hover to pause, or use arrows."
          >
            <CtaCarousel items={others} partners={PARTNERS} />
          </Card>
        </div>

        {/* FAQ (home-style) */}
        <FAQ items={faqs} idPrefix="partner" />

        {/* Footer note */}
        <p className="mt-3 text-xs text-slate-500">
          Disclaimer: Ranges are indicative. Offers subject to lender’s terms
          and credit evaluation.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default PartnerDetail;
