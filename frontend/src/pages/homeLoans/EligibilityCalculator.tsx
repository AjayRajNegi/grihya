import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// -------------------- Math helpers --------------------
function emi(P: number, annualRate: number, years: number): number {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Given target EMI (A), monthly rate r, months n => principal P
function principalFromEmi(A: number, annualRate: number, years: number): number {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (r === 0) return A * n;
  const pow = Math.pow(1 + r, n);
  return (A * (pow - 1)) / (r * pow);
}

const INR = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtINR = (n: number) => `₹ ${INR(Math.round(n))}`;

// -------------------- UI bits --------------------
const Kpi: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-lg border border-slate-200 p-4">
    <div className="text-xs text-slate-600">{label}</div>
    <div className="text-lg font-semibold text-slate-900">{value}</div>
    {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
  </div>
);

const Card: React.FC<{ title?: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  children,
  className,
}) => (
  <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className || ''}`}>
    {(title || subtitle) && (
      <div className="mb-3">
        {title && <div className="text-sm font-semibold text-slate-900">{title}</div>}
        {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
      </div>
    )}
    {children}
  </div>
);

// Donut for Capacity vs Obligations
const CapacityDonut: React.FC<{ available: number; obligations: number }> = ({ available, obligations }) => {
  const total = Math.max(0, available + obligations);
  const aPct = total ? available / total : 0;
  const oPct = total ? obligations / total : 0;
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const aLen = c * aPct;
  const oLen = c * oPct;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          {/* Obligations */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${oLen} ${c - oLen}`}
          />
          {/* Available (offset by obligations) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${aLen} ${c - aLen}`}
            strokeDashoffset={-oLen}
          />
        </g>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#0f172a">
          {total ? `${Math.round(aPct * 100)}% Avail` : ' - '}
        </text>
      </svg>

      <div className="text-xs text-slate-700 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded bg-emerald-500" />
          Available EMI: <span className="font-medium">{fmtINR(available)}/mo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded bg-amber-500" />
          Ongoing EMIs: <span className="font-medium">{fmtINR(obligations)}/mo</span>
        </div>
        <div className="text-slate-500">Total capacity: {fmtINR(total)}/mo</div>
      </div>
    </div>
  );
};

// CTA carousel data (same partners used in EMI page)
const BANK_CARDS = [
  {
    slug: 'hdfc',
    name: 'HDFC Ltd',
    tagline: 'Fast approvals • Flexible tenure',
    range: '8.40% – 9.40%',
    gradient: 'from-indigo-500 via-blue-600 to-blue-700',
  },
  {
    slug: 'bank-of-maharashtra',
    name: 'Bank of Maharashtra',
    tagline: 'Public sector trust • Competitive rates',
    range: '8.35% – 9.35%',
    gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
  },
  {
    slug: 'nainital-bank',
    name: 'Nainital Bank',
    tagline: 'Regional strength • Personalized service',
    range: '8.60% – 9.60%',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
  },
  {
    slug: 'icici',
    name: 'ICICI Bank',
    tagline: 'Digital first • Quick processing',
    range: '8.50% – 9.50%',
    gradient: 'from-rose-500 via-pink-500 to-orange-500',
  },
];

const CtaCarousel: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % BANK_CARDS.length), 2000);
    return () => clearInterval(id);
  }, [paused]);

  const next = () => setIdx((i) => (i + 1) % BANK_CARDS.length);
  const prev = () => setIdx((i) => (i - 1 + BANK_CARDS.length) % BANK_CARDS.length);
  const card = BANK_CARDS[idx];

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`bg-gradient-to-br ${card.gradient} p-4 sm:p-5 text-white min-h-[140px] flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold opacity-90">Partner spotlight</div>
          <div className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full">
            {idx + 1} / {BANK_CARDS.length}
          </div>
        </div>

        <div className="mt-2">
          <div className="text-xl font-bold leading-tight text-center">{card.name}</div>
          <div className="text-xs opacity-90 text-center">{card.tagline}</div>
          <div className="mt-2 text-sm text-center">
            Indicative rates: <span className="font-semibold">{card.range}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 justify-center">
          <Link
            to={`/home-loans/partners/${card.slug}`}
            className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white transition shadow-sm"
          >
            Check Loan Details
          </Link>
          {/* <Link to="/home-loans/apply" className="text-xs underline underline-offset-2 decoration-white/60 hover:decoration-white">
            Apply via EasyLease →
          </Link> */}
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
            className={['h-1.5 rounded-full transition-all', idx === i ? 'w-5 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'].join(' ')}
          />
        ))}
      </div>
    </div>
  );
};

// FAQ accordion (home-style)
type FaqItem = { q: string; a: React.ReactNode };
const FAQ: React.FC<{ items: FaqItem[]; idPrefix?: string }> = ({ items, idPrefix = 'elig' }) => {
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
              <span aria-hidden className="absolute left-1/2 -bottom-2 h-1 w-24 md:w-28 -translate-x-1/2 rounded-full bg-[#2AB09C]" />
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
                      ${isOpen ? 'bg-[#CCF0E1]' : 'bg-white'} hover:bg-gray-50`}
                  >
                    <span className="font-medium text-gray-900 pr-4">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 text-[#2AB09C] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={btnId}
                    aria-hidden={!isOpen}
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
                      ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                  >
                    <div className="relative pl-5 sm:pl-6 pr-4 text-gray-700 pb-6 pt-6">
                      <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-[#2AB09C]" />
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

// -------------------- Page --------------------
const EligibilityCalculator: React.FC = () => {
  // Inputs
  const [monthlyIncome, setMonthlyIncome] = useState(80000);
  const [existingEmi, setExistingEmi] = useState(5000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [advanced, setAdvanced] = useState(false);
  const [foir, setFoir] = useState(40);
  const navigate = useNavigate();

  // Computations
  const assumedCapacity = useMemo(() => (foir / 100) * monthlyIncome, [foir, monthlyIncome]);
  const eligibleEmi = useMemo(() => Math.max(0, assumedCapacity - existingEmi), [assumedCapacity, existingEmi]);
  const eligiblePrincipal = useMemo(() => Math.round(principalFromEmi(eligibleEmi, rate, years)), [eligibleEmi, rate, years]);

  // Donut data
  const available = eligibleEmi;
  const obligations = Math.min(assumedCapacity, existingEmi);
  const totalCapacity = assumedCapacity;

  // FAQ content
  const faqs: FaqItem[] = [
    {
      q: 'What is FOIR and how do you use it?',
      a: (
        <p>
          FOIR (Fixed Obligations to Income Ratio) is the share of your monthly income available for EMIs after accounting
          for existing obligations. We default to 40%, which many lenders use, but you can adjust it under Advanced.
        </p>
      ),
    },
    {
      q: 'Do I need to include property value?',
      a: (
        <p>
          Not here. This tool estimates the maximum loan your income can support. Final sanction also depends on LTV (loan-to-value),
          typically up to 90% of property value. Without property value, the result is the income-based maximum.
        </p>
      ),
    },
    {
      q: 'Why is my eligible EMI different from example EMI?',
      a: (
        <p>
          Eligible EMI is your capacity (FOIR × income − obligations). Example EMI shows the EMI on the eligible loan at your chosen
          rate and tenure. They should be close; small differences can arise due to rounding.
        </p>
      ),
    },
    {
      q: 'What affects home loan eligibility the most?',
      a: (
        <ul className="list-disc pl-5">
          <li>Net monthly income and FOIR policy</li>
          <li>Credit score and bureau history</li>
          <li>Tenure and rate offered by the lender</li>
          <li>Existing obligations and stability of employment</li>
        </ul>
      ),
    },
  ];

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
              <span className="text-2xl md:text-3xl font-extrabold leading-none"><img src="/less_than_icon.png" alt="Back-Icon" /></span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Home Loan Eligibility Calculator</h1>
          </div>
          <p className="mt-2 text-slate-600">
            Estimate your maximum eligible loan from your income, obligations, tenure, and rate. Adjust FOIR under Advanced if needed.
          </p>
        </div>

        {/* Form + KPIs + visuals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          {/* Left: Inputs + Advanced */}
          <Card title="Enter your details" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Net monthly income (₹)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  min={0}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Ongoing EMIs (₹/mo)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={existingEmi}
                  onChange={(e) => setExistingEmi(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  min={0}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Loan tenure (years)</span>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  min={1}
                  max={35}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-700">Interest rate (p.a.)</span>
                <input
                  type="number"
                  step={0.1}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={rate}
                  onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value || '0')))}
                />
              </label>
            </div>

            {/* Advanced FOIR */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setAdvanced((v) => !v)}
                className="text-xs font-medium text-emerald-700 underline underline-offset-2"
              >
                {advanced ? 'Hide' : 'Show'} Advanced (FOIR)
              </button>
              {advanced && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">FOIR (% of income for EMIs)</label>
                    <input
                      type="range"
                      className="mt-2 w-full accent-emerald-600"
                      min={25}
                      max={65}
                      step={1}
                      value={foir}
                      onChange={(e) => setFoir(parseInt(e.target.value || '40', 10))}
                    />
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{foir}%</div>
                </div>
              )}
              {!advanced && (
                <div className="mt-2 text-[11px] text-slate-500">Assuming FOIR = 40% (typical for many lenders)</div>
              )}
            </div>

            {/* Visuals: Capacity donut and stacked bar */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <CapacityDonut available={available} obligations={obligations} />
              <div>
                <div className="text-xs font-medium text-slate-700 mb-1">Capacity usage</div>
                <div className="h-3 w-full rounded bg-slate-100 overflow-hidden">
                  <div className="h-3 bg-amber-500" style={{ width: `${totalCapacity ? (obligations / totalCapacity) * 100 : 0}%` }} />
                  <div className="h-3 bg-emerald-500" style={{ width: `${totalCapacity ? (available / totalCapacity) * 100 : 0}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-700 flex justify-between">
                  <span>Total capacity: {fmtINR(totalCapacity)}/mo</span>
                  <span>Available now: {fmtINR(available)}/mo</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Right: KPIs + carousel */}
          <div className="space-y-4">
            <Card title="Quick summary">
              <div className="grid grid-cols-1 gap-3">
                <Kpi label="Eligible EMI" value={`${fmtINR(eligibleEmi)}/mo`} />
                <Kpi label="Eligible loan amount" value={fmtINR(eligiblePrincipal)} hint={`@ ${rate}% for ${years} years`} />
                <Kpi label="Example EMI at rate" value={`${fmtINR(emi(eligiblePrincipal, rate, years))}/mo`} />
              </div>
            </Card>

            <Card title="Our partner banks">
              <CtaCarousel />
            </Card>
          </div>
        </div>

        {/* Checklist */}
        <Card title="Home Loan Eligibility Criteria  -  Checklist" subtitle="Typical benchmarks (may vary by lender)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">Age</div>
              <div className="text-slate-700 mt-1">18–70 years</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">Credit score</div>
              <div className="text-slate-700 mt-1">650+ considered good</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">Monthly income</div>
              <div className="text-slate-700 mt-1">Min. ₹ 25,000</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">Nationality</div>
              <div className="text-slate-700 mt-1">Indian residents, NRIs, PIOs</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 md:col-span-2">
              <div className="font-medium text-slate-900">Loan-to-Value (LTV)</div>
              <div className="text-slate-700 mt-1">Up to 90% of property value</div>
              <div className="text-xs text-slate-500 mt-1">
                Note: Final sanction will be the lower of income-based eligibility and LTV-based maximum.
              </div>
            </div>
          </div>
        </Card>

        {/* How-to + Key Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card title="How to calculate home loan eligibility online">
            <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-1.5">
              <li>Enter net monthly income and ongoing EMIs.</li>
              <li>Choose tenure and expected interest rate.</li>
              <li>(Optional) Adjust FOIR under Advanced to match your lender.</li>
              <li>Review eligible EMI and eligible loan amount.</li>
              <li>Compare offers from lenders and apply.</li>
            </ol>
          </Card>

          <Card title="Key factors affecting eligibility">
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
              <li>Income level, stability, and employer profile.</li>
              <li>FOIR policy and existing debt obligations.</li>
              <li>Credit score and repayment history.</li>
              <li>Tenure and interest rate offered by lender.</li>
              <li>Age, co-applicant income, and property LTV.</li>
            </ul>
          </Card>
        </div>

        {/* Bank-wise criteria (illustrative) */}
        <Card title="Bank-wise home loan eligibility criteria (illustrative)">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">HDFC Ltd</div>
              <ul className="mt-1 list-disc pl-5 text-slate-700 space-y-1">
                <li>FOIR: ~40–55%</li>
                <li>Min income: ₹ 25k</li>
                <li>Credit score: 650+</li>
                <li>NRI programs available</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">Bank of Maharashtra</div>
              <ul className="mt-1 list-disc pl-5 text-slate-700 space-y-1">
                <li>FOIR: ~40–50%</li>
                <li>Min income: ₹ 25k</li>
                <li>Credit score: 650+</li>
                <li>Tenure up to 30–35y</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">Nainital Bank</div>
              <ul className="mt-1 list-disc pl-5 text-slate-700 space-y-1">
                <li>FOIR: ~40–55%</li>
                <li>Min income: ₹ 25k</li>
                <li>Credit score: 650+</li>
                <li>Regional programs available</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="font-medium text-slate-900">ICICI Bank</div>
              <ul className="mt-1 list-disc pl-5 text-slate-700 space-y-1">
                <li>FOIR: ~40–55%</li>
                <li>Min income: ₹ 25k</li>
                <li>Credit score: 650+</li>
                <li>Balance transfer/top-up</li>
              </ul>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Actual lender policies may vary and change over time.</div>
        </Card>

        {/* FAQ */}
        <FAQ items={faqs} idPrefix="elig" />

        <p className="text-xs text-slate-500">
          Disclaimer: This tool is illustrative. Final eligibility is subject to lender policies, document verification, and credit assessment.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default EligibilityCalculator;