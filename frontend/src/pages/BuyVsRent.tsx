import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ChevronDown, HelpCircle } from 'lucide-react';

const INR = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtINR = (n: number) => `₹ ${INR(Math.round(n))}`;
const pct = (n: number) => `${n.toFixed(1)}%`;

// EMI helper (P, annualRate%, years)
function emi(P: number, annualRate: number, years: number): number {
    const r = annualRate / 12 / 100;
    const n = years * 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Remaining principal after k months
function remainingPrincipal(P: number, annualRate: number, years: number, kMonths: number): number {
    const r = annualRate / 12 / 100;
    const n = years * 12;
    if (kMonths <= 0) return P;
    if (kMonths >= n) return 0;
    const A = emi(P, annualRate, years);
    if (r === 0) {
        return Math.max(0, P - A * kMonths);
    }
    // Balance after k: P*(1+r)^k - A*((1+r)^k - 1)/r
    const pow = Math.pow(1 + r, kMonths);
    const bal = P * pow - (A * (pow - 1)) / r;
    return Math.max(0, bal);
}

// Future value of a lump sum after M months at annual rate %
function fvLumpSum(principal: number, annualRate: number, months: number): number {
    const r = annualRate / 12 / 100;
    if (months <= 0) return principal;
    if (r === 0) return principal;
    return principal * Math.pow(1 + r, months);
}

// Future value of a monthly contribution (end-of-month) for M months at annual rate %
function fvAnnuity(monthly: number, annualRate: number, months: number): number {
    const r = annualRate / 12 / 100;
    if (months <= 0 || monthly === 0) return 0;
    if (r === 0) return monthly * months;
    return monthly * ((Math.pow(1 + r, months) - 1) / r);
}

// Average monthly rent over H years with annual escalation g%
function avgMonthlyRent(rentNow: number, escalationPct: number, years: number): number {
    if (years <= 0) return rentNow;
    const g = escalationPct / 100;
    let sum = 0;
    for (let i = 0; i < years; i++) {
        sum += rentNow * Math.pow(1 + g, i);
    }
    return sum / years; // monthly constant within each year
}

type Inputs = {
    // Property & financing
    homePrice: number;
    downPct: number;
    loanRate: number;
    loanYears: number;
    stampDutyPct: number;
    registrationPct: number;
    otherFeesPct: number;
    sellCostPct: number;
    maintPct: number;       // of property value per year
    propTaxPct: number;     // of property value per year
    appreciationPct: number;

    // Rent & investing assumptions
    rentNow: number;
    rentEscPct: number;
    investReturnPct: number;
    depositMonths: number;

    // Horizon
    horizonYears: number;
};

const defaultInputs: Inputs = {
    homePrice: 6000000,         // 60 Lac
    downPct: 20,                // 20%
    loanRate: 8.6,              // %
    loanYears: 20,              // years
    stampDutyPct: 6,            // %
    registrationPct: 1,         // %
    otherFeesPct: 0.5,          // %
    sellCostPct: 2,             // %
    maintPct: 0.8,              // % of property value per year
    propTaxPct: 0.2,            // % of property value per year
    appreciationPct: 5,         // % per year

    rentNow: 22000,             // per month
    rentEscPct: 5,              // % per year
    investReturnPct: 10,        // % per year
    depositMonths: 2,           // months of rent

    horizonYears: 10,           // decision horizon
};

function computeScenario(i: Inputs) {
    const price = i.homePrice;
    const down = (i.downPct / 100) * price;
    const principal = Math.max(0, price - down);
    const M = i.horizonYears * 12;

    const upfrontBuy = ((i.stampDutyPct + i.registrationPct + i.otherFeesPct) / 100) * price;
    const emiMonthly = emi(principal, i.loanRate, i.loanYears);
    const monthlyMaint = ((i.maintPct / 100) * price) / 12;
    const monthlyPropTax = ((i.propTaxPct / 100) * price) / 12;
    const monthlyBuyOutflow = emiMonthly + monthlyMaint + monthlyPropTax;

    const avgRent = avgMonthlyRent(i.rentNow, i.rentEscPct, i.horizonYears);
    const deposit = i.depositMonths * i.rentNow;

    const propFV = price * Math.pow(1 + i.appreciationPct / 100, i.horizonYears);
    const outstanding = remainingPrincipal(principal, i.loanRate, i.loanYears, M);
    const sellCost = (i.sellCostPct / 100) * propFV;
    let buyWealth = Math.max(0, propFV - outstanding - sellCost);

    // If buying is cheaper monthly than renting, invest the monthly difference in buy scenario
    const monthlyDiffIfBuyCheaper = Math.max(0, avgRent - monthlyBuyOutflow);
    const buyMonthlySavingsFV = fvAnnuity(monthlyDiffIfBuyCheaper, i.investReturnPct, M);
    buyWealth += buyMonthlySavingsFV;

    // Rent scenario investments:
    // 1) Invest the down payment + upfrontBuy (since renter doesn't spend it), minus deposit (held in cash)
    const initialToInvest = Math.max(0, down + upfrontBuy - deposit);
    const rentLumpFV = fvLumpSum(initialToInvest, i.investReturnPct, M);
    // 2) Monthly invest the difference if buying is more expensive than renting (common)
    const monthlyDiffIfRentCheaper = Math.max(0, monthlyBuyOutflow - avgRent);
    const rentMonthlyInvestFV = fvAnnuity(monthlyDiffIfRentCheaper, i.investReturnPct, M);
    // 3) Deposit is returned at the end (assume no interest)
    const depositAtEnd = deposit;

    const rentWealth = rentLumpFV + rentMonthlyInvestFV + depositAtEnd;

    const diff = buyWealth - rentWealth; // positive => buying leads to higher net worth

    return {
        emiMonthly,
        monthlyMaint,
        monthlyPropTax,
        monthlyBuyOutflow,
        avgRent,
        upfrontBuy,
        down,
        principal,
        propFV,
        outstanding,
        sellCost,
        buyWealth,
        rentWealth,
        diff,
    };
}

function findBreakEven(inputs: Inputs, maxYears = 30) {
    for (let y = 1; y <= maxYears; y++) {
        const s = computeScenario({ ...inputs, horizonYears: y });
        if (s.buyWealth >= s.rentWealth) return y;
    }
    return null;
}

const PresetChips: React.FC<{ onApply: (p: Partial<Inputs>) => void }> = ({ onApply }) => {
    return (
        <div className="flex flex-wrap gap-2">
            <button
                type="button"
                onClick={() => onApply({ homePrice: 4500000, rentNow: 15000, downPct: 15, horizonYears: 7 })}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
                1BHK starter (₹45L / ₹15k)
            </button>
            <button
                type="button"
                onClick={() => onApply({ homePrice: 6000000, rentNow: 22000, downPct: 20, horizonYears: 10 })}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
                2BHK family (₹60L / ₹22k)
            </button>
            <button
                type="button"
                onClick={() => onApply({ homePrice: 9000000, rentNow: 35000, downPct: 25, horizonYears: 12 })}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
                3BHK upgrade (₹90L / ₹35k)
            </button>
        </div>
    );
};

const NumberField: React.FC<{
    label: string;
    value: number;
    onChange: (v: number) => void;
    suffix?: string;
    min?: number;
    max?: number;
    step?: number;
}> = ({ label, value, onChange, suffix, min, max, step }) => (
    <label className="block">
        <div className="mb-1 text-xs font-medium text-slate-600">{label}</div>
        <div className="flex items-center gap-2">
            <input
                type="number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={value}
                min={min}
                max={max}
                step={step || 1}
                onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
            />
            {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
        </div>
    </label>
);

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; subtitle?: string }> = ({ children, className, title, subtitle }) => (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className || ''}`}>
        {title && <div className="text-sm font-semibold text-slate-900">{title}</div>}
        {subtitle && <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>}
        <div className={title || subtitle ? 'mt-3' : ''}>{children}</div>
    </div>
);

const Kpi: React.FC<{ label: string; value: string; hint?: string; tone?: 'pos' | 'neg' | 'neutral' }> = ({ label, value, hint, tone = 'neutral' }) => (
    <div className="rounded-lg border border-slate-200 p-4">
        <div className="text-xs text-slate-600">{label}</div>
        <div className={`text-lg font-semibold ${tone === 'pos' ? 'text-emerald-700' : tone === 'neg' ? 'text-rose-700' : 'text-slate-900'}`}>
            {value}
        </div>
        {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </div>
);

// Page-specific FAQ (home-style)
type FaqItem = { q: string; a: React.ReactNode };
const BuyVsRentFAQ: React.FC = () => {
    const [open, setOpen] = useState<number | null>(null);
    const faqs: FaqItem[] = [
        {
            q: 'Do you include tax benefits (80C/24(b))?',
            a: (
                <p>
                    Not explicitly. You can approximate by lowering effective EMI outflow or adding a small annual cash‑back to the rent
                    scenario. We’ll add a toggle soon.
                </p>
            ),
        },
        {
            q: 'Should maintenance be % of value or fixed?',
            a: (
                <p>
                    Both exist. We model it as % of property value for simplicity. You can adjust the % to match your building.
                </p>
            ),
        },
        {
            q: 'What if I move before the break-even year?',
            a: (
                <p>
                    Renting often wins on short horizons due to lower friction. Use a 3 - 5 year horizon to see this effect.
                </p>
            ),
        },
        {
            q: 'How accurate is rent escalation?',
            a: (
                <p>
                    We default to 5% p.a. It varies by locality and cycle. Adjust it to your market.
                </p>
            ),
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-center mb-4">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#CCF0E1] text-[#2AB09C]">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="relative inline-block text-2xl md:text-3xl font-bold text-gray-900 pb-1">
                            Frequently Asked Questions
                            <span
                                aria-hidden
                                className="absolute left-1/2 -bottom-2 h-1 w-24 md:w-28 -translate-x-1/2 rounded-full bg-[#2AB09C]"
                            />
                        </h2>
                        <p className="text-gray-600 mt-5 max-w-2xl mx-auto">
                            Answers to common questions about comparing home buying and renting.
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {faqs.map((item, idx) => {
                            const isOpen = open === idx;
                            const contentId = `bvr-faq-panel-${idx}`;
                            const btnId = `bvr-faq-button-${idx}`;
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

                    <p className="text-xs text-slate-500 mt-4 text-center">
                        Disclaimer: This tool is for education only. Actual decisions should consider detailed costs, taxes, liquidity, and your risk tolerance.
                    </p>
                </div>
            </div>
        </section>
    );
};

const BuyVsRent: React.FC = () => {
    const [inp, setInp] = useState<Inputs>(defaultInputs);
    const scenario = useMemo(() => computeScenario(inp), [inp]);
    const breakEven = useMemo(() => findBreakEven(inp, Math.max(5, Math.min(35, inp.loanYears))), [inp]);
    const navigate = useNavigate();

    const applyPreset = (p: Partial<Inputs>) => setInp((prev) => ({ ...prev, ...p }));

    // Recommendation text
    const rec =
        scenario.diff > 0
            ? { text: 'Buying is better than renting in this setup.', tone: 'pos' as const }
            : scenario.diff < 0
                ? { text: 'Renting is better than buying in this setup.', tone: 'neg' as const }
                : { text: 'Both look roughly similar with current assumptions.', tone: 'neutral' as const };

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
                            <span className="text-2xl md:text-3xl font-extrabold leading-none"><img src="less_than_icon.png" alt="Back-Icon" /></span>
                        </button>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Buy vs Rent: What’s right for you?</h1>

                    </div>
                    <p className="mt-2 text-slate-600">
                        Use the calculator to compare monthly outflows and net worth over time. Adjust assumptions for appreciation,
                        rent growth, loan rates, and investment returns.
                    </p>
                </div>

                {/* Presets */}
                <div className="mb-4">
                    <PresetChips onApply={applyPreset} />
                </div>

                {/* Inputs */}
                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    <Card title="Property & financing">
                        <div className="grid grid-cols-2 gap-3">
                            <NumberField label="Home price" value={inp.homePrice} onChange={(v) => setInp({ ...inp, homePrice: v })} suffix="₹" />
                            <NumberField label="Down payment" value={inp.downPct} onChange={(v) => setInp({ ...inp, downPct: v })} suffix="%" />
                            <NumberField label="Loan rate (p.a.)" value={inp.loanRate} onChange={(v) => setInp({ ...inp, loanRate: v })} suffix="%" />
                            <NumberField label="Loan tenure" value={inp.loanYears} onChange={(v) => setInp({ ...inp, loanYears: v })} suffix="years" />
                            <NumberField label="Stamp duty" value={inp.stampDutyPct} onChange={(v) => setInp({ ...inp, stampDutyPct: v })} suffix="%" />
                            <NumberField label="Registration" value={inp.registrationPct} onChange={(v) => setInp({ ...inp, registrationPct: v })} suffix="%" />
                            <NumberField label="Other fees" value={inp.otherFeesPct} onChange={(v) => setInp({ ...inp, otherFeesPct: v })} suffix="%" />
                            <NumberField label="Selling costs" value={inp.sellCostPct} onChange={(v) => setInp({ ...inp, sellCostPct: v })} suffix="%" />
                            <NumberField label="Maintenance (p.a.)" value={inp.maintPct} onChange={(v) => setInp({ ...inp, maintPct: v })} suffix="% of price" />
                            <NumberField label="Property tax (p.a.)" value={inp.propTaxPct} onChange={(v) => setInp({ ...inp, propTaxPct: v })} suffix="% of price" />
                            <NumberField label="Appreciation" value={inp.appreciationPct} onChange={(v) => setInp({ ...inp, appreciationPct: v })} suffix="% p.a." />
                        </div>
                    </Card>

                    <Card title="Rent & investing">
                        <div className="grid grid-cols-2 gap-3">
                            <NumberField label="Current rent (monthly)" value={inp.rentNow} onChange={(v) => setInp({ ...inp, rentNow: v })} suffix="₹/mo" />
                            <NumberField label="Rent escalation" value={inp.rentEscPct} onChange={(v) => setInp({ ...inp, rentEscPct: v })} suffix="% p.a." />
                            <NumberField label="Investment return" value={inp.investReturnPct} onChange={(v) => setInp({ ...inp, investReturnPct: v })} suffix="% p.a." />
                            <NumberField label="Deposit" value={inp.depositMonths} onChange={(v) => setInp({ ...inp, depositMonths: v })} suffix="months" />
                            <NumberField label="Decision horizon" value={inp.horizonYears} onChange={(v) => setInp({ ...inp, horizonYears: v })} suffix="years" />
                        </div>
                    </Card>

                    <Card title="Quick math" subtitle="Key numbers based on your inputs">
                        <div className="grid grid-cols-2 gap-3">
                            <Kpi label="EMI (monthly)" value={fmtINR(scenario.emiMonthly)} />
                            <Kpi label="Avg rent (monthly)" value={fmtINR(scenario.avgRent)} />
                            <Kpi label="Maint + Tax (monthly)" value={fmtINR(scenario.monthlyMaint + scenario.monthlyPropTax)} />
                            <Kpi label="Buy monthly outflow" value={fmtINR(scenario.monthlyBuyOutflow)} />
                            <Kpi label="Upfront costs" value={fmtINR(scenario.upfrontBuy)} hint="Stamp + reg + other" />
                            <Kpi label="Down payment" value={fmtINR(scenario.down)} />
                        </div>
                    </Card>
                </section>

                {/* Results */}
                <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card title="Outcome after your horizon">
                        <div className="grid grid-cols-1 gap-3">
                            <Kpi label="Buy scenario net worth" value={fmtINR(scenario.buyWealth)} />
                            <Kpi label="Rent scenario net worth" value={fmtINR(scenario.rentWealth)} />
                            <Kpi
                                label="Difference (Buy - Rent)"
                                value={`${scenario.diff >= 0 ? '+' : ''}${fmtINR(scenario.diff)}`}
                                tone={scenario.diff > 0 ? 'pos' : scenario.diff < 0 ? 'neg' : 'neutral'}
                            />
                            <div className={`rounded-md px-3 py-2 text-sm ${scenario.diff > 0 ? 'bg-emerald-50 text-emerald-800' : scenario.diff < 0 ? 'bg-rose-50 text-rose-800' : 'bg-slate-50 text-slate-700'}`}>
                                {rec.text}
                            </div>
                        </div>
                    </Card>

                    <Card title="Break-even and equity context">
                        <div className="grid grid-cols-1 gap-3">
                            <Kpi label="Estimated break-even year" value={breakEven ? `${breakEven} years` : 'Not within horizon'} />
                            <Kpi label="Future property value" value={fmtINR(scenario.propFV)} />
                            <Kpi label="Loan outstanding at horizon" value={fmtINR(scenario.outstanding)} />
                            <Kpi label="Selling costs at horizon" value={fmtINR(scenario.sellCost)} />
                        </div>
                    </Card>

                    <Card title="What this means">
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
                            <li>We compare net worth: equity in a home (after selling costs and outstanding loan) vs. investing your down-payment + monthly savings when renting.</li>
                            <li>Rent escalates yearly; EMI is fixed; maintenance and property tax are estimated from property value.</li>
                            <li>Investment returns are compounded monthly for both initial lump sum and monthly contributions.</li>
                        </ul>
                    </Card>
                </section>

                {/* Guidance */}
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
                    <Card title="Buying  -  Good fit when">
                        <ul className="text-slate-700 text-sm space-y-1.5">
                            <li>• You plan to stay ≥ 7 - 10 years and want stability.</li>
                            <li>• You can afford EMI + maintenance comfortably with buffer.</li>
                            <li>• Schools, commute, and neighborhood fit long-term needs.</li>
                            <li>• You value asset-building and potential price appreciation.</li>
                        </ul>
                    </Card>
                    <Card title="Renting  -  Good fit when">
                        <ul className="text-slate-700 text-sm space-y-1.5">
                            <li>• You value flexibility (job/city changes) or shorter horizon (≤ 3 - 5 years).</li>
                            <li>• Lower up-front costs and low maintenance appeal to you.</li>
                            <li>• You’ll invest the surplus at a disciplined rate.</li>
                            <li>• You’re exploring localities before committing.</li>
                        </ul>
                    </Card>
                </section>

                {/* Rules of thumb & methodology */}
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
                    <Card title="Simple rules of thumb">
                        <ul className="text-slate-700 text-sm space-y-1.5">
                            <li>• If annual rent is ≪ 2 - 3% of the home price, renting often makes sense short-term.</li>
                            <li>• If you’ll stay long-term and can afford comfortably, buying often makes sense.</li>
                            <li>• Always budget for maintenance, taxes, furnishings, and move-in costs.</li>
                            <li>• Liquidity matters: don’t exhaust your emergency fund to buy.</li>
                        </ul>
                    </Card>
                    <Card title="Methodology (how we compare)">
                        <ul className="text-slate-700 text-sm space-y-1.5">
                            <li>• Buy: equity = future value of property − loan outstanding − selling costs + FV of monthly savings if EMI+maint &lt; rent.</li>
                            <li>• Rent: wealth = FV of down payment + upfront costs (invested) − deposit + FV of monthly savings (if rent &lt; buy) + deposit returned at end.</li>
                            <li>• Rent escalates annually; investment return compounded monthly; EMI fixed; maintenance/tax based on % of property value.</li>
                            <li>• Results are illustrative  -  tax benefits, insurance, vacancy, and transaction timing can change outcomes.</li>
                        </ul>
                    </Card>
                </section>

                {/* Home-style FAQ */}
                <BuyVsRentFAQ />

                {/* CTAs */}
                <section className="mb-12 mt-6 flex flex-wrap items-center gap-3">
                    <a href="/properties?for=sale" className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
                        Explore homes to buy
                    </a>
                    <a href="/properties?for=rent" className="inline-flex items-center rounded-md border border-emerald-600 px-4 py-2 text-emerald-700 hover:bg-emerald-50">
                        Explore homes to rent
                    </a>
                    <a href="/blog" className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
                        Tips & Guides
                    </a>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default BuyVsRent;