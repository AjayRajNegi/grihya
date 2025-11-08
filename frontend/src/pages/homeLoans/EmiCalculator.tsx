import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// -------------------- Math helpers --------------------
function emi(P: number, annualRate: number, years: number): number {
    const r = annualRate / 12 / 100;
    const n = years * 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const INR = (n: number) => n.toLocaleString('en-IN');
const fmtINR = (n: number) => `₹ ${INR(Math.round(n))}`;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Add k months to a (year, month[1..12]) -> returns new (year, month[1..12])
function addMonthsToYearMonth(year: number, month1to12: number, k: number) {
    const zeroBased = month1to12 - 1;
    const total = year * 12 + zeroBased + k;
    const y = Math.floor(total / 12);
    const m0 = total % 12;
    return { year: y, month: m0 + 1 };
}

// Build amortization schedule with rounding-safe last row
type Row = {
    idx: number;           // 1..N
    year: number;          // 1..years (tenure year index)
    month: number;         // 1..12 (within tenure year)
    beginning: number;     // rupees
    emi: number;           // rupees (may adjust on last row)
    interest: number;      // rupees
    principal: number;     // rupees
    outstanding: number;   // rupees
};

function buildSchedule(amount: number, annualRate: number, years: number): Row[] {
    const n = Math.max(1, Math.round(years * 12));
    const r = annualRate / 12 / 100;
    const A = Math.round(emi(amount, annualRate, years)); // rupee-precision EMI
    const rows: Row[] = [];

    let bal = Math.round(amount);
    for (let i = 1; i <= n; i++) {
        const year = Math.floor((i - 1) / 12) + 1;
        const month = ((i - 1) % 12) + 1;

        const interestRaw = bal * r;
        const interest = Math.round(interestRaw);
        let principal = A - interest;
        let emiThis = A;

        // Adjust last row for rounding
        if (principal > bal || i === n) {
            principal = bal;
            emiThis = interest + principal;
        }

        const end = bal - principal;

        rows.push({
            idx: i,
            year,
            month,
            beginning: bal,
            emi: emiThis,
            interest,
            principal,
            outstanding: end < 0 ? 0 : end,
        });

        bal = end < 0 ? 0 : end;
    }

    return rows;
}

function toCSV(rows: Row[]): string {
    const header = [
        'Tenure Year',
        'Tenure Month',
        'Beginning Balance',
        'EMI',
        'Interest',
        'Principal',
        'Outstanding Balance',
    ].join(',');
    const lines = [header];
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        lines.push([
            r.year,
            r.month,
            Math.round(r.beginning),
            Math.round(r.emi),
            Math.round(r.interest),
            Math.round(r.principal),
            Math.round(r.outstanding),
        ].join(','));
    }
    return lines.join('\n');
}

function toCSVWithCalendar(rows: RowCal[]): string {
    const header = [
        'Calendar Year',
        'Calendar Month',
        'Beginning Balance',
        'EMI',
        'Interest',
        'Principal',
        'Outstanding Balance',
    ].join(',');
    const lines = [header];
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        lines.push([
            r.calYear,
            r.calMonthName,
            Math.round(r.beginning),
            Math.round(r.emi),
            Math.round(r.interest),
            Math.round(r.principal),
            Math.round(r.outstanding),
        ].join(','));
    }
    return lines.join('\n');
}

function downloadCSV(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// -------------------- UI bits --------------------
const Kpi: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="rounded-lg border border-slate-200 p-4">
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-lg font-semibold text-slate-900">{value}</div>
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

// Donut for Principal vs Interest
const PaymentDonut: React.FC<{ principal: number; interest: number }> = ({ principal, interest }) => {
    const total = Math.max(0, principal + interest);
    const pPct = total ? principal / total : 0;
    const iPct = total ? interest / total : 0;
    const size = 132;
    const stroke = 14;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const iLen = c * iPct;
    const pLen = c * pPct;

    return (
        <div className="flex items-center gap-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={stroke}
                    />
                    {/* Interest arc */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${iLen} ${c - iLen}`}
                    />
                    {/* Principal arc (offset by interest length) */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${pLen} ${c - pLen}`}
                        strokeDashoffset={-iLen}
                    />
                </g>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="#0f172a"
                >
                    {total ? `${Math.round(pPct * 100)}% P / ${Math.round(iPct * 100)}% I` : ' - '}
                </text>
            </svg>

            <div className="text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded bg-emerald-500" />
                    Principal: <span className="font-medium">{fmtINR(principal)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded bg-amber-500" />
                    Interest: <span className="font-medium">{fmtINR(interest)}</span>
                </div>
                <div className="text-slate-500">Total: {fmtINR(total)}</div>
            </div>
        </div>
    );
};

// CTA carousel data (updated to match SubHeader partners)
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
    const navigate = useNavigate();
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
            {/* Slide */}
            <div
                className={`bg-gradient-to-br ${card.gradient} p-4 sm:p-5 text-white min-h-[140px] flex flex-col justify-between`}
            >
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
                    <button
                        type="button"
                        onClick={() => navigate(`/home-loans/partners/${card.slug}`)}
                        className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white transition shadow-sm"
                    >
                        Check Loan Details
                    </button>
                    {/* <Link
                        to="/home-loans/apply"
                        className="text-xs underline underline-offset-2 decoration-white/60 hover:decoration-white"
                    >
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
                        className={[
                            'h-1.5 rounded-full transition-all',
                            idx === i ? 'w-5 bg-white' : 'w-2 bg-white/60 hover:bg-white/80',
                        ].join(' ')}
                    />
                ))}
            </div>
        </div>
    );
};

// Home-style FAQ accordion
type FaqItem = { q: string; a: React.ReactNode };
const FAQ: React.FC<{ items: FaqItem[]; idPrefix?: string }> = ({ items, idPrefix = 'emi' }) => {
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
                                        <ChevronDown
                                            className={`h-5 w-5 text-[#2AB09C] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
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
type RowCal = Row & { calYear: number; calMonth: number; calMonthName: string };

const EMICalculator: React.FC = () => {
    const [amount, setAmount] = useState(3000000);
    const [rate, setRate] = useState(8.5);
    const [years, setYears] = useState(20);

    // Loan start date selection (calendar)
    const now = new Date();
    const defaultStartYear = now.getFullYear();
    const defaultStartMonth = now.getMonth() + 1; // 1..12

    const [startYear, setStartYear] = useState<number>(defaultStartYear);
    const [startMonth, setStartMonth] = useState<number>(defaultStartMonth);

    // Year filter for table (calendar years)
    const [selectedCalYear, setSelectedCalYear] = useState<number>(defaultStartYear);

    const navigate = useNavigate();

    const schedule = useMemo(() => buildSchedule(amount, rate, years), [amount, rate, years]);

    // Map schedule to calendar (first EMI = start date + 1 month)
    const scheduleCal: RowCal[] = useMemo(() => {
        const out: RowCal[] = [];
        for (let i = 0; i < schedule.length; i++) {
            const r = schedule[i];
            const { year: cy, month: cm } = addMonthsToYearMonth(startYear, startMonth, i + 1);
            out.push({
                ...r,
                calYear: cy,
                calMonth: cm,
                calMonthName: MONTHS[cm - 1],
            });
        }
        return out;
    }, [schedule, startYear, startMonth]);

    // Update selected calendar year if start date or tenure changes
    useEffect(() => {
        if (!scheduleCal.length) return;
        const firstYear = scheduleCal[0].calYear;
        const lastYear = scheduleCal[scheduleCal.length - 1].calYear;
        if (selectedCalYear < firstYear || selectedCalYear > lastYear) {
            setSelectedCalYear(firstYear);
        }
    }, [scheduleCal, selectedCalYear]);

    const monthlyEmi = useMemo(() => (schedule.length ? schedule[0].emi : 0), [schedule]);

    const totals = useMemo(() => {
        let totalEmi = 0, totalInterest = 0, totalPrincipal = 0;
        for (let i = 0; i < schedule.length; i++) {
            const r = schedule[i];
            totalEmi += r.emi;
            totalInterest += r.interest;
            totalPrincipal += r.principal;
        }
        return {
            totalEmi: Math.round(totalEmi),
            totalInterest: Math.round(totalInterest),
            totalPrincipal: Math.round(totalPrincipal),
        };
    }, [schedule]);

    const totalPayment = totals.totalPrincipal + totals.totalInterest;

    // Unique calendar years for filter
    const calYears = useMemo(() => {
        const set = new Set<number>();
        for (let i = 0; i < scheduleCal.length; i++) set.add(scheduleCal[i].calYear);
        return Array.from(set.values()).sort((a, b) => a - b);
    }, [scheduleCal]);

    const filteredRows = useMemo(
        () => scheduleCal.filter((r) => r.calYear === selectedCalYear),
        [scheduleCal, selectedCalYear]
    );

    // Illustrations (sensitivity)
    const emiRateUp = Math.round(emi(amount, rate + 1, years));
    const emiRateDown = Math.round(emi(amount, Math.max(0.1, rate - 1), years));
    const emiYearsUp = Math.round(emi(amount, rate, Math.min(35, years + 5)));
    const emiYearsDown = Math.round(emi(amount, rate, Math.max(1, years - 5)));
    const emiAmtUp = Math.round(emi(Math.round(amount * 1.1), rate, years));
    const emiAmtDown = Math.round(emi(Math.round(amount * 0.9), rate, years));

    const faqs: FaqItem[] = [
        {
            q: 'What is a Home Loan EMI Calculator?',
            a: (
                <p>
                    It’s a tool that computes your monthly EMI based on three inputs: loan amount, interest rate (p.a.), and
                    loan tenure. It also shows the amortization schedule  -  how much of each EMI goes to interest vs principal,
                    and how the outstanding balance drops over time.
                </p>
            ),
        },
        {
            q: 'What is a Home Loan EMI?',
            a: (
                <p>
                    EMI (Equated Monthly Instalment) is a fixed amount you pay each month to the lender. It includes both
                    interest and principal. Early EMIs are interest-heavy; over time, the principal portion increases.
                </p>
            ),
        },
        {
            q: 'How to use the Home Loan EMI Calculator?',
            a: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>Enter loan amount (₹), interest rate (p.a.), and tenure (years).</li>
                    <li>Select your loan start Year and Month; schedule begins next month.</li>
                    <li>Review EMI and total interest outgo; explore the month-wise schedule by calendar year.</li>
                    <li>Use the illustration to test sensitivity to rate, tenure, and amount.</li>
                </ul>
            ),
        },
        {
            q: 'How does the calculator help me?',
            a: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>Sets a realistic monthly budget before applying.</li>
                    <li>Helps compare lenders (rate impact) and tenures.</li>
                    <li>Shows long-term interest outgo so you can plan prepayments.</li>
                </ul>
            ),
        },
        {
            q: 'How to reduce your Home Loan EMI?',
            a: (
                <ul className="list-disc pl-5 space-y-1">
                    <li>Choose a longer tenure (reduces EMI, increases total interest).</li>
                    <li>Increase down payment to borrow less.</li>
                    <li>Improve credit score and negotiate a lower rate.</li>
                    <li>Consider balance transfer to a lower-rate lender.</li>
                    <li>Make part-prepayments whenever possible.</li>
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
                            <span className="text-2xl md:text-3xl font-extrabold leading-none">
                                <img src="/less_than_icon.png" alt="Back-Icon" />
                            </span>
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Home Loan EMI Calculator</h1>
                    </div>
                    <p className="mt-2 text-slate-600">
                        Calculate your monthly EMI, view the month‑wise schedule, and explore how changes in rate, tenure, and amount affect your payments.
                    </p>
                </div>

                {/* Inputs + KPIs */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
                    {/* Inputs */}
                    <Card title="Enter your details" className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Amount */}
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">Loan amount (₹)</span>
                                <input
                                    type="number"
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    value={amount}
                                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                                    min={0}
                                />
                                <input
                                    type="range"
                                    className="mt-2 w-full accent-emerald-600"
                                    min={500000}
                                    max={20000000}
                                    step={50000}
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value || '0', 10))}
                                />
                            </label>

                            {/* Rate */}
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">Interest rate (p.a.)</span>
                                <input
                                    type="number"
                                    step={0.1}
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    value={rate}
                                    onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value || '0')))}
                                />
                                <input
                                    type="range"
                                    className="mt-2 w-full accent-emerald-600"
                                    min={6}
                                    max={15}
                                    step={0.05}
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value || '0'))}
                                />
                            </label>

                            {/* Tenure */}
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">Tenure (years)</span>
                                <input
                                    type="number"
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    value={years}
                                    onChange={(e) => setYears(Math.max(1, parseInt(e.target.value || '1', 10)))}
                                    min={1}
                                    max={35}
                                />
                                <input
                                    type="range"
                                    className="mt-2 w-full accent-emerald-600"
                                    min={1}
                                    max={35}
                                    step={1}
                                    value={years}
                                    onChange={(e) => setYears(parseInt(e.target.value || '1', 10))}
                                />
                            </label>
                        </div>

                        {/* Loan Start (Calendar) */}
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">Loan start month</span>
                                <select
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    value={startMonth}
                                    onChange={(e) => setStartMonth(parseInt(e.target.value || '1', 10))}
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">Loan start year</span>
                                <select
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    value={startYear}
                                    onChange={(e) => setStartYear(parseInt(e.target.value || String(startYear), 10))}
                                >
                                    {Array.from({ length: 41 }, (_, k) => k + (new Date().getFullYear())) // current to +40
                                        .map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))
                                    }
                                </select>
                            </label>
                        </div>

                        {/* Donut breakdown + CTA carousel */}
                        <div className="mt-6">
                            <div className="text-xs font-medium text-slate-700 mb-2">Payment breakdown</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <PaymentDonut principal={totals.totalPrincipal} interest={totals.totalInterest} />
                                <CtaCarousel />
                            </div>
                        </div>
                    </Card>

                    {/* KPIs */}
                    <Card title="Quick summary">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                            <Kpi label="Monthly EMI" value={fmtINR(monthlyEmi)} />
                            <Kpi label="Total Interest" value={fmtINR(totals.totalInterest)} />
                            <Kpi label="Principal (Total)" value={fmtINR(totals.totalPrincipal)} />
                        </div>
                    </Card>
                </div>

                {/* Amortization schedule */}
                <Card title="Amortization schedule" subtitle="Month-by-month breakup of interest and principal (calendar view)">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                        <div className="text-xs text-slate-600">
                            Tenure: {years} years ({years * 12} months). First EMI: {MONTHS[scheduleCal[0]?.calMonth - 1] || ' - '} {scheduleCal[0]?.calYear || ' - '}.
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-700">
                                Year:{' '}
                                <select
                                    value={selectedCalYear}
                                    onChange={(e) => setSelectedCalYear(parseInt(e.target.value || '0', 10))}
                                    className="ml-1 rounded border border-slate-300 px-2 py-1 text-sm"
                                >
                                    {calYears.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="button"
                                onClick={() => downloadCSV('emi_schedule_all.csv', toCSVWithCalendar(scheduleCal))}
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                            >
                                Download All
                            </button>
                            <button
                                type="button"
                                onClick={() => downloadCSV(`emi_schedule_${selectedCalYear}.csv`, toCSVWithCalendar(filteredRows))}
                                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                            >
                                Download ({selectedCalYear})
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-slate-100 text-slate-700">
                                    <th className="px-3 py-2 text-left font-medium">Calendar Year</th>
                                    <th className="px-3 py-2 text-left font-medium">Month</th>
                                    <th className="px-3 py-2 text-right font-medium">Beginning Balance</th>
                                    <th className="px-3 py-2 text-right font-medium">EMI</th>
                                    <th className="px-3 py-2 text-right font-medium">Interest</th>
                                    <th className="px-3 py-2 text-right font-medium">Principal</th>
                                    <th className="px-3 py-2 text-right font-medium">Outstanding</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((r) => (
                                    <tr key={r.idx} className="odd:bg-white even:bg-slate-50">
                                        <td className="px-3 py-2">{r.calYear}</td>
                                        <td className="px-3 py-2">{r.calMonthName}</td>
                                        <td className="px-3 py-2 text-right">{fmtINR(r.beginning)}</td>
                                        <td className="px-3 py-2 text-right">{fmtINR(r.emi)}</td>
                                        <td className="px-3 py-2 text-right">{fmtINR(r.interest)}</td>
                                        <td className="px-3 py-2 text-right">{fmtINR(r.principal)}</td>
                                        <td className="px-3 py-2 text-right">{fmtINR(r.outstanding)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Illustration section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-8">
                    <Card title="An illustration: how EMI changes with key factors">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-md border border-slate-200 p-3">
                                <div className="text-xs text-slate-600">Rate +1%</div>
                                <div className="text-sm font-semibold text-slate-900">{fmtINR(emiRateUp)}</div>
                            </div>
                            <div className="rounded-md border border-slate-200 p-3">
                                <div className="text-xs text-slate-600">Rate -1%</div>
                                <div className="text-sm font-semibold text-slate-900">{fmtINR(emiRateDown)}</div>
                            </div>
                            <div className="rounded-md border border-slate-200 p-3">
                                <div className="text-xs text-slate-600">Tenure +5 years</div>
                                <div className="text-sm font-semibold text-slate-900">{fmtINR(emiYearsUp)}</div>
                            </div>
                            <div className="rounded-md border border-slate-200 p-3">
                                <div className="text-xs text-slate-600">Tenure -5 years</div>
                                <div className="text-sm font-semibold text-slate-900">{fmtINR(emiYearsDown)}</div>
                            </div>
                            <div className="rounded-md border border-slate-200 p-3">
                                <div className="text-xs text-slate-600">Amount +10%</div>
                                <div className="text-sm font-semibold text-slate-900">{fmtINR(emiAmtUp)}</div>
                            </div>
                            <div className="rounded-md border border-slate-200 p-3">
                                <div className="text-xs text-slate-600">Amount -10%</div>
                                <div className="text-sm font-semibold text-slate-900">{fmtINR(emiAmtDown)}</div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">
                            Note: Increasing tenure lowers EMI but increases total interest paid across the loan.
                        </p>
                    </Card>

                    <Card title="How the Home Loan EMI Calculator helps you">
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
                            <li>Plan monthly cashflows and affordability before you apply.</li>
                            <li>Compare lender offers quickly by adjusting rate and tenure.</li>
                            <li>Understand interest vs principal over time to plan prepayments.</li>
                            <li>Export the schedule as CSV to share or analyze further.</li>
                        </ul>
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-slate-900">How to reduce your EMI</h3>
                            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5 mt-1">
                                <li>Choose a longer tenure (trade-off: higher overall interest).</li>
                                <li>Increase down payment or make periodic part-prepayments.</li>
                                <li>Maintain a strong credit score to qualify for lower rates.</li>
                                <li>Consider balance transfer when rate cycles fall.</li>
                            </ul>
                        </div>
                    </Card>
                </div>

                {/* Explanatory sections */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-8">
                    <Card title="What is Home Loan EMI Calculator?">
                        <p className="text-sm text-slate-700">
                            A Home Loan EMI Calculator estimates your monthly instalment based on loan amount, interest rate, and tenure.
                            It also produces a detailed amortization schedule showing interest and principal split every month.
                        </p>
                    </Card>
                    <Card title="What is Home Loan EMI?">
                        <p className="text-sm text-slate-700">
                            EMI stands for Equated Monthly Instalment  -  a fixed payment you make each month. Each EMI comprises an
                            interest portion and a principal portion. Early EMIs are interest-heavy and later EMIs become principal-heavy.
                        </p>
                    </Card>
                    <Card title="How to use the EMI Calculator?">
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
                            <li>Enter loan amount, interest rate (p.a.), and tenure (years).</li>
                            <li>Select your loan start Year and Month; schedule begins next month.</li>
                            <li>Filter the schedule by calendar year; export all or per-year CSV.</li>
                        </ul>
                    </Card>
                    <Card title="An Illustration">
                        <p className="text-sm text-slate-700">
                            The EMI depends primarily on rate, tenure, and amount. Check the illustration to see how your EMI responds to changes.
                        </p>
                    </Card>
                </div>

                {/* FAQ */}
                <FAQ items={faqs} idPrefix="emi" />

                <p className="text-xs text-slate-500">
                    Disclaimer: Calculations are indicative and may vary by lender. Always confirm with your bank/NBFC.
                </p>
            </main>

            <Footer />
        </div>
    );
};

export default EMICalculator;