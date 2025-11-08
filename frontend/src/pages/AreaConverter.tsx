import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ArrowLeftRight, Copy, Check, Info, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';

// -------------------- Helpers --------------------
const fmt = (n: number, decimals = 4) =>
    Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: decimals }) : '-';

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// canonical bases
const SQM_PER_SQFT = 0.09290304;
const SQM_PER_SQYD = 0.83612736;
const SQM_PER_ACRE = 4046.8564224;
const SQM_PER_HECTARE = 10000;
const SQM_PER_CENT = SQM_PER_ACRE / 100; // 40.468564224
const SQM_PER_DECIMAL = SQM_PER_ACRE / 100; // East India "decimal" = 1/100 acre (same as cent)
const SQM_PER_GUNTHA_DEFAULT = 101.17141056; // 1089 sqft (Maharashtra/Karnataka common)

// -------------------- Types --------------------
type AreaUnitKey =
    | 'sqft' | 'sqm' | 'sqyd' | 'gaj' | 'acre' | 'hectare'
    | 'cent' | 'decimal' | 'bigha' | 'katha' | 'biswa' | 'guntha';

type RegionPresetKey = 'up' | 'rajasthan' | 'wb' | 'assam' | 'maha' | 'standard' | 'custom';

type Preset = {
    key: RegionPresetKey;
    label: string;
    // Dynamic units (sqft sizes)
    bighaSqft?: number;
    kathaSqft?: number;
    biswaPerBigha?: number;
    gunthaSqft?: number;
    notes?: string;
};

const REGION_PRESETS: Preset[] = [
    { key: 'up', label: 'UP/Uttarakhand (20 biswa = 1 bigha)', bighaSqft: 27000, kathaSqft: 1361, biswaPerBigha: 20, notes: 'Values vary by district; typical working defaults.' },
    { key: 'rajasthan', label: 'Rajasthan (Pucca bigha)', bighaSqft: 27225, biswaPerBigha: 20, notes: 'Pucca bigha; kuchha differs. Verify locally.' },
    { key: 'wb', label: 'West Bengal (20 katha = 1 bigha)', bighaSqft: 14400, kathaSqft: 720, notes: 'Common Kolkata/WB convention.' },
    { key: 'assam', label: 'Assam (5 katha = 1 bigha)', bighaSqft: 14400, kathaSqft: 2880, notes: 'Assam convention: 1 bigha = 5 katha.' },
    { key: 'maha', label: 'Maharashtra/Karnataka (Guntha)', gunthaSqft: 1089, notes: '1 guntha ≈ 1089 sqft; 40 guntha = 1 acre.' },
    { key: 'standard', label: 'Standard (International)', notes: 'Use acre/hectare/sqft/sqyd without regional units.' },
    { key: 'custom', label: 'Custom (set your own)', bighaSqft: 27000, kathaSqft: 1361, biswaPerBigha: 20, gunthaSqft: 1089 },
];

const AREA_UNITS: { key: AreaUnitKey; label: string; aliases?: string[]; group: 'Global' | 'India (Common)' | 'India (Regional)'; }[] = [
    { key: 'sqft', label: 'Square Feet (sq ft)', aliases: ['ft²', 'sq ft', 'feet'], group: 'Global' },
    { key: 'sqm', label: 'Square Meter (sq m)', aliases: ['m²', 'sq m'], group: 'Global' },
    { key: 'sqyd', label: 'Square Yard (sq yd)', aliases: ['yd²', 'sq yd'], group: 'Global' },
    { key: 'acre', label: 'Acre', group: 'Global' },
    { key: 'hectare', label: 'Hectare (ha)', group: 'Global' },
    { key: 'cent', label: 'Cent (1/100 acre)', group: 'India (Common)' },
    { key: 'decimal', label: 'Decimal (1/100 acre)', group: 'India (Common)' },
    { key: 'gaj', label: 'Gaj (≈ Sq Yard)', aliases: ['gaz', 'gaz²'], group: 'India (Common)' },
    { key: 'bigha', label: 'Bigha (regional)', group: 'India (Regional)' },
    { key: 'katha', label: 'Katha (regional)', group: 'India (Regional)' },
    { key: 'biswa', label: 'Biswa (regional)', group: 'India (Regional)' },
    { key: 'guntha', label: 'Guntha (regional)', group: 'India (Regional)' },
];

// -------------------- Conversion core --------------------
function getSqmPerUnit(unit: AreaUnitKey, preset: Preset, custom: { bighaSqft: number; kathaSqft: number; biswaPerBigha: number; gunthaSqft: number }): { sqm: number; warn?: string } {
    const bighaSqft = (preset.key === 'custom' ? custom.bighaSqft : preset.bighaSqft) || undefined;
    const kathaSqft = (preset.key === 'custom' ? custom.kathaSqft : preset.kathaSqft) || undefined;
    const biswaPerBigha = (preset.key === 'custom' ? custom.biswaPerBigha : preset.biswaPerBigha) || undefined;
    const gunthaSqft = (preset.key === 'custom' ? custom.gunthaSqft : preset.gunthaSqft) || preset.gunthaSqft || SQM_PER_GUNTHA_DEFAULT / SQM_PER_SQFT;

    switch (unit) {
        case 'sqft': return { sqm: SQM_PER_SQFT };
        case 'sqm': return { sqm: 1 };
        case 'sqyd': return { sqm: SQM_PER_SQYD };
        case 'gaj': return { sqm: SQM_PER_SQYD, warn: 'Assumed Gaj = Square Yard (regional variations exist).' };
        case 'acre': return { sqm: SQM_PER_ACRE };
        case 'hectare': return { sqm: SQM_PER_HECTARE };
        case 'cent': return { sqm: SQM_PER_CENT };
        case 'decimal': return { sqm: SQM_PER_DECIMAL };
        case 'guntha': return { sqm: gunthaSqft * SQM_PER_SQFT, warn: 'Guntha assumed ≈ 1089 sqft unless overridden.' };
        case 'bigha':
            if (!bighaSqft) return { sqm: NaN, warn: 'Bigha not defined for this preset. Choose a regional preset or set Custom.' };
            return { sqm: bighaSqft * SQM_PER_SQFT, warn: 'Bigha varies by region; using preset/custom value.' };
        case 'katha':
            if (!kathaSqft) return { sqm: NaN, warn: 'Katha not defined for this preset. Choose a regional preset or set Custom.' };
            return { sqm: kathaSqft * SQM_PER_SQFT, warn: 'Katha varies by region; using preset/custom value.' };
        case 'biswa': {
            if (!bighaSqft || !biswaPerBigha) return { sqm: NaN, warn: 'Biswa not defined for this preset. Choose a regional preset or set Custom (Biswa per Bigha).' };
            const biswaSqft = bighaSqft / biswaPerBigha;
            return { sqm: biswaSqft * SQM_PER_SQFT, warn: 'Biswa varies by region; using preset/custom value.' };
        }
        default:
            return { sqm: NaN };
    }
}

function convertArea(value: number, from: AreaUnitKey, to: AreaUnitKey, preset: Preset, custom: { bighaSqft: number; kathaSqft: number; biswaPerBigha: number; gunthaSqft: number }) {
    const fromInfo = getSqmPerUnit(from, preset, custom);
    const toInfo = getSqmPerUnit(to, preset, custom);
    const result = (value * fromInfo.sqm) / toInfo.sqm;
    const warn = fromInfo.warn || toInfo.warn;
    return { result, warn };
}

// -------------------- UI atoms --------------------
const Card: React.FC<{ title?: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({ title, subtitle, children, className }) => (
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

const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'gray' | 'blue' | 'amber' }> = ({ children, color = 'gray' }) => {
    const map: Record<string, string> = {
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        gray: 'bg-slate-50 text-slate-700 border-slate-200',
        blue: 'bg-sky-50 text-sky-700 border-sky-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] ${map[color]}`}>{children}</span>;
};

// Home-style FAQ (accordion)
type FaqItem = { q: string; a: React.ReactNode };

const AreaFAQ: React.FC = () => {
    const [open, setOpen] = useState<number | null>(null);
    const faqs: FaqItem[] = [
        {
            q: 'Why do Bigha/Katha/Biswa values differ by state?',
            a: (
                <p>
                    These are customary units defined historically and vary by local revenue practice. Always check local records or your sale deed.
                    Use our regional presets or set Custom to match your locality.
                </p>
            ),
        },
        {
            q: 'Is Gaj equal to Sq Yard?',
            a: (
                <p>
                    Often yes (1 Gaj ≈ 1 Sq Yard = 9 sq ft), but colloquial use can vary. The converter assumes Gaj = Sq Yard by default.
                </p>
            ),
        },
        {
            q: 'What precision should I use?',
            a: (
                <p>
                    For listings, 2 - 3 decimals are common. For legal/engineering use, increase precision and verify unit definitions/presets.
                </p>
            ),
        },
        {
            q: 'Can I convert irregular plot shapes?',
            a: (
                <p>
                    This converter assumes total area is known. For irregular plots, compute area from dimensions (survey/map) and then convert units.
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
                            <span aria-hidden className="absolute left-1/2 -bottom-2 h-1 w-24 md:w-28 -translate-x-1/2 rounded-full bg-[#2AB09C]" />
                        </h2>
                        <p className="text-gray-600 mt-5 max-w-2xl mx-auto">
                            Answers to common questions about land area units, regional presets, and conversions.
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {faqs.map((item, idx) => {
                            const isOpen = open === idx;
                            const contentId = `area-faq-panel-${idx}`;
                            const btnId = `area-faq-button-${idx}`;
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

                    <p className="text-xs text-slate-500 mt-4 text-center">
                        Disclaimer: Conversions are illustrative. Regional units (Bigha, Katha, Biswa, Guntha) vary by locale; confirm with local authorities.
                    </p>
                </div>
            </div>
        </section>
    );
};

// -------------------- Page --------------------
const AreaConverter: React.FC = () => {
    // Converter
    const [from, setFrom] = useState<AreaUnitKey>('sqft');
    const [to, setTo] = useState<AreaUnitKey>('sqm');
    const [value, setValue] = useState<number>(1000);
    const [precision, setPrecision] = useState(4);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    // Region presets + custom overrides
    const [presetKey, setPresetKey] = useState<RegionPresetKey>('up');
    const preset = useMemo(() => REGION_PRESETS.find(p => p.key === presetKey)!, [presetKey]);
    const [custom, setCustom] = useState({ bighaSqft: 27000, kathaSqft: 1361, biswaPerBigha: 20, gunthaSqft: 1089 });

    useEffect(() => {
        if (presetKey !== 'custom') return;
        // custom remains user-controlled
    }, [presetKey]);

    const { result, warn } = useMemo(() => convertArea(value, from, to, preset, custom), [value, from, to, preset, custom]);

    // History
    const [history, setHistory] = useState<{ v: number; from: AreaUnitKey; to: AreaUnitKey; res: number; ts: number }[]>([]);
    useEffect(() => {
        const h = localStorage.getItem('area_history');
        if (h) setHistory(JSON.parse(h));
    }, []);
    const pushHistory = () => {
        const entry = { v: value, from, to, res: result, ts: Date.now() };
        const next = [entry, ...history].slice(0, 10);
        setHistory(next);
        localStorage.setItem('area_history', JSON.stringify(next));
    };

    // Popular quick conversions (click to apply)
    const popular: { label: string; from: AreaUnitKey; to: AreaUnitKey }[] = [
        { label: 'Sqft → Sqm', from: 'sqft', to: 'sqm' },
        { label: 'Sqft → Gaj', from: 'sqft', to: 'gaj' },
        { label: 'Sqft → Acre', from: 'sqft', to: 'acre' },
        { label: 'Sqft → Sq Yard', from: 'sqft', to: 'sqyd' },
        { label: 'Sqft → Cent', from: 'sqft', to: 'cent' },
        { label: 'Sqm → Sqft', from: 'sqm', to: 'sqft' },
        { label: 'Sqm → Gaj', from: 'sqm', to: 'gaj' },
        { label: 'Sqm → Acre', from: 'sqm', to: 'acre' },
        { label: 'Sqm → Hectare', from: 'sqm', to: 'hectare' },
        { label: 'Sqm → Cent', from: 'sqm', to: 'cent' },
        { label: 'Acre → Hectare', from: 'acre', to: 'hectare' },
        { label: 'Acre → Sqm', from: 'acre', to: 'sqm' },
        { label: 'Acre → Sqft', from: 'acre', to: 'sqft' },
        { label: 'Acre → Bigha', from: 'acre', to: 'bigha' },
        { label: 'Acre → Cent', from: 'acre', to: 'cent' },
        { label: 'Hectare → Sqm', from: 'hectare', to: 'sqm' },
        { label: 'Hectare → Sqft', from: 'hectare', to: 'sqft' },
        { label: 'Hectare → Acre', from: 'hectare', to: 'acre' },
        { label: 'Hectare → Bigha', from: 'hectare', to: 'bigha' },
        { label: 'Hectare → Cent', from: 'hectare', to: 'cent' },
        { label: 'Gaj → Sqm', from: 'gaj', to: 'sqm' },
        { label: 'Gaj → Sqft', from: 'gaj', to: 'sqft' },
        { label: 'Gaj → Bigha', from: 'gaj', to: 'bigha' },
        { label: 'Gaj → Sq Yard', from: 'gaj', to: 'sqyd' },
        { label: 'Gaj → Biswa', from: 'gaj', to: 'biswa' },
        { label: 'Bigha → Sqft', from: 'bigha', to: 'sqft' },
        { label: 'Bigha → Gaj', from: 'bigha', to: 'gaj' },
        { label: 'Bigha → Acre', from: 'bigha', to: 'acre' },
        { label: 'Bigha → Hectare', from: 'bigha', to: 'hectare' },
        { label: 'Bigha → Katha', from: 'bigha', to: 'katha' },
        { label: 'Sq Yard → Sqft', from: 'sqyd', to: 'sqft' },
        { label: 'Sq Yard → Sqm', from: 'sqyd', to: 'sqm' },
        { label: 'Sq Yard → Acre', from: 'sqyd', to: 'acre' },
        { label: 'Sq Yard → Gaj', from: 'sqyd', to: 'gaj' },
        { label: 'Sq Yard → Cent', from: 'sqyd', to: 'cent' },
        { label: 'Cent → Sqft', from: 'cent', to: 'sqft' },
        { label: 'Cent → Sqm', from: 'cent', to: 'sqm' },
        { label: 'Cent → Acre', from: 'cent', to: 'acre' },
        { label: 'Cent → Hectare', from: 'cent', to: 'hectare' },
        { label: 'Cent → Sq Yard', from: 'cent', to: 'sqyd' },
        { label: 'Katha → Sqft', from: 'katha', to: 'sqft' },
        { label: 'Katha → Gaj', from: 'katha', to: 'gaj' },
        { label: 'Katha → Acre', from: 'katha', to: 'acre' },
        { label: 'Katha → Bigha', from: 'katha', to: 'bigha' },
        { label: 'Katha → Decimal', from: 'katha', to: 'decimal' },
        { label: 'Guntha → Sqft', from: 'guntha', to: 'sqft' },
        { label: 'Guntha → Sqm', from: 'guntha', to: 'sqm' },
        { label: 'Guntha → Acre', from: 'guntha', to: 'acre' },
        { label: 'Guntha → Bigha', from: 'guntha', to: 'bigha' },
        { label: 'Guntha → Katha', from: 'guntha', to: 'katha' },
    ];

    const applyQuick = (q: { from: AreaUnitKey; to: AreaUnitKey }) => {
        setFrom(q.from);
        setTo(q.to);
    };

    const copyOut = async () => {
        try {
            await navigator.clipboard.writeText(String(result));
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        } catch { }
    };

    // Table: 1 [from] equals ...
    const tableRows = useMemo(() => {
        return AREA_UNITS.map(u => {
            const { result: r } = convertArea(1, from, u.key, preset, custom);
            return { key: u.key, label: u.label, value: r };
        });
    }, [from, preset, custom]);

    // Other units (mini converters)
    const Mini: React.FC<{ label: string; aLabel: string; bLabel: string; aToB: number }> = ({ label, aLabel, bLabel, aToB }) => {
        const [a, setA] = useState<number>(1);
        const b = a * aToB;
        return (
            <div className="rounded-lg border border-slate-200 p-4">
                <div className="text-sm font-medium text-slate-900">{label}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="block">
                        <span className="text-[11px] text-slate-500">{aLabel}</span>
                        <input type="number" value={a} min={0} onChange={(e) => setA(parseFloat(e.target.value || '0'))}
                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-[11px] text-slate-500">{bLabel}</span>
                        <input readOnly value={fmt(b, 6)} className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                    </label>
                </div>
            </div>
        );
    };

    const presetObj = REGION_PRESETS.find(p => p.key === presetKey)!;

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
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Land Area Converter</h1>

                    </div>
                    <p className="mt-2 text-slate-600">
                        Convert between Sqft, Sqm, Acre, Hectare, Gaj, Bigha, Cent, Sq Yard and more. Supports regional units with presets (UP/UK, Rajasthan, West Bengal, Assam, Maharashtra) and custom overrides.
                    </p>
                </div>

                {/* Converter + Presets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left: Converter */}
                    <Card title="Area Converter" subtitle="Swap units, set precision, and copy results" className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">From</span>
                                <select value={from} onChange={(e) => setFrom(e.target.value as AreaUnitKey)}
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                                    <optgroup label="Global">
                                        {AREA_UNITS.filter(u => u.group === 'Global').map(u => (
                                            <option key={u.key} value={u.key}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="India (Common)">
                                        {AREA_UNITS.filter(u => u.group === 'India (Common)').map(u => (
                                            <option key={u.key} value={u.key}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="India (Regional)">
                                        {AREA_UNITS.filter(u => u.group === 'India (Regional)').map(u => (
                                            <option key={u.key} value={u.key}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </label>

                            <div className="flex items-end justify-center">
                                <button
                                    type="button"
                                    onClick={() => { setFrom(to); setTo(from); }}
                                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                                    title="Swap units"
                                >
                                    <ArrowLeftRight className="h-4 w-4" /> Swap
                                </button>
                            </div>

                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">To</span>
                                <select value={to} onChange={(e) => setTo(e.target.value as AreaUnitKey)}
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                                    <optgroup label="Global">
                                        {AREA_UNITS.filter(u => u.group === 'Global').map(u => (
                                            <option key={u.key} value={u.key}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="India (Common)">
                                        {AREA_UNITS.filter(u => u.group === 'India (Common)').map(u => (
                                            <option key={u.key} value={u.key}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="India (Regional)">
                                        {AREA_UNITS.filter(u => u.group === 'India (Regional)').map(u => (
                                            <option key={u.key} value={u.key}>{u.label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </label>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <label className="block md:col-span-2">
                                <span className="text-xs font-medium text-slate-700">Value</span>
                                <input
                                    type="number"
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                    value={value}
                                    min={0}
                                    onChange={(e) => setValue(parseFloat(e.target.value || '0'))}
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">Precision</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={8}
                                    step={1}
                                    value={precision}
                                    onChange={(e) => setPrecision(parseInt(e.target.value, 10))}
                                    className="mt-2 w-full accent-emerald-600"
                                />
                                <div className="text-[11px] text-slate-500 mt-1">{precision} decimal places</div>
                            </label>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                            <div>
                                <div className="text-xs font-medium text-slate-700 mb-1">Result</div>
                                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-lg font-semibold text-slate-900">
                                    {fmt(result, precision)}
                                </div>
                                <div className="mt-1 text-[11px] text-slate-500">
                                    Formula: {value} × ({from}→sqm) ÷ ({to}→sqm)
                                </div>
                                {warn && (
                                    <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                        <Info className="h-3.5 w-3.5" /> {warn}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 md:justify-end">
                                <button onClick={copyOut} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 hover:bg-white">
                                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />} Copy
                                </button>
                                <button onClick={pushHistory} className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Popular quick conversions */}
                        <div className="mt-5">
                            <div className="text-xs font-medium text-slate-700 mb-2">Popular quick conversions</div>
                            <div className="flex flex-wrap gap-2">
                                {popular.slice(0, 18).map((p, i) => (
                                    <button key={i} onClick={() => applyQuick(p)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs hover:bg-white">
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <details className="mt-2">
                                <summary className="text-[12px] text-emerald-700 cursor-pointer">Show more</summary>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {popular.slice(18).map((p, i) => (
                                        <button key={i} onClick={() => applyQuick(p)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs hover:bg-white">
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </details>
                        </div>
                    </Card>

                    {/* Right: Region presets + history */}
                    <div className="space-y-4">
                        <Card title="Regional presets (India)" subtitle="Set how Bigha/Katha/Biswa/Guntha are interpreted">
                            <label className="block">
                                <span className="text-xs font-medium text-slate-700">Preset</span>
                                <select
                                    value={presetKey}
                                    onChange={(e) => setPresetKey(e.target.value as RegionPresetKey)}
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                >
                                    {REGION_PRESETS.map(p => (
                                        <option key={p.key} value={p.key}>{p.label}</option>
                                    ))}
                                </select>
                            </label>

                            {presetObj.notes && (
                                <div className="mt-2 text-[11px] text-slate-500">{presetObj.notes}</div>
                            )}

                            {presetKey === 'custom' && (
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-700">Bigha (sqft)</span>
                                        <input
                                            type="number"
                                            value={custom.bighaSqft}
                                            onChange={(e) => setCustom({ ...custom, bighaSqft: clamp(parseFloat(e.target.value || '0'), 1, 1e9) })}
                                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-700">Katha (sqft)</span>
                                        <input
                                            type="number"
                                            value={custom.kathaSqft}
                                            onChange={(e) => setCustom({ ...custom, kathaSqft: clamp(parseFloat(e.target.value || '0'), 1, 1e9) })}
                                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-700">Biswa per Bigha</span>
                                        <input
                                            type="number"
                                            value={custom.biswaPerBigha}
                                            onChange={(e) => setCustom({ ...custom, biswaPerBigha: clamp(parseInt(e.target.value || '0', 10), 1, 100) })}
                                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium text-slate-700">Guntha (sqft)</span>
                                        <input
                                            type="number"
                                            value={custom.gunthaSqft}
                                            onChange={(e) => setCustom({ ...custom, gunthaSqft: clamp(parseFloat(e.target.value || '0'), 1, 1e9) })}
                                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        />
                                    </label>
                                </div>
                            )}

                            <div className="mt-3 text-[11px] text-slate-500">
                                Tip: Choose a preset (e.g., West Bengal) to apply common regional definitions. Select Custom to override exact sizes.
                            </div>
                        </Card>

                        <Card title="Recent conversions">
                            {history.length === 0 ? (
                                <div className="text-sm text-slate-600">No history yet.</div>
                            ) : (
                                <ul className="space-y-1.5 text-sm">
                                    {history.map((h, i) => (
                                        <li key={i} className="flex items-center justify-between">
                                            <button
                                                className="text-slate-800 hover:underline"
                                                onClick={() => { setFrom(h.from); setTo(h.to); setValue(h.v); }}
                                                title="Re-run"
                                            >
                                                {fmt(h.v, 4)} {h.from} → {fmt(h.res, 4)} {h.to}
                                            </button>
                                            <span className="text-[11px] text-slate-500">{new Date(h.ts).toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Table: 1 [from] equals ... */}
                <Card title={`Conversion table: 1 ${from} equals`} subtitle="Quick look across all supported units">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tableRows.map((r) => (
                            <div key={r.key} className="rounded-lg border border-slate-200 p-3">
                                <div className="text-xs text-slate-500">{r.label}</div>
                                <div className="text-sm font-semibold text-slate-900">{fmt(r.value, precision)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                        Note: Regional units (Bigha/Katha/Biswa/Guntha) vary by state/district. Use presets or Custom to match local practice.
                    </div>
                </Card>

                {/* Other Units (length/volume) */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-8">
                    <Card title="Other Units" subtitle="Handy length and volume converters">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Mini label="Meter → Feet" aLabel="m" bLabel="ft" aToB={3.280839895} />
                            <Mini label="Feet → Meter" aLabel="ft" bLabel="m" aToB={0.3048} />
                            <Mini label="Inches → CM" aLabel="in" bLabel="cm" aToB={2.54} />
                            <Mini label="MM → Inches" aLabel="mm" bLabel="in" aToB={0.0393700787} />
                            <Mini label="CM → Feet" aLabel="cm" bLabel="ft" aToB={0.03280839895} />
                            <Mini label="Inches → Feet" aLabel="in" bLabel="ft" aToB={1 / 12} />
                            <Mini label="Inches → MM" aLabel="in" bLabel="mm" aToB={25.4} />
                            <Mini label="Feet → CM" aLabel="ft" bLabel="cm" aToB={30.48} />
                            <Mini label="CM → Inches" aLabel="cm" bLabel="in" aToB={0.393700787} />
                            <Mini label="Meter → CM" aLabel="m" bLabel="cm" aToB={100} />
                            <Mini label="Meter → Inches" aLabel="m" bLabel="in" aToB={39.3700787} />
                            <Mini label="MM → CM" aLabel="mm" bLabel="cm" aToB={0.1} />
                            <Mini label="Cubic Feet → Cubic Meter" aLabel="ft³" bLabel="m³" aToB={0.0283168466} />
                        </div>
                    </Card>

                    <Card title="What is a Land Area Calculator?" className="lg:col-span-2">
                        <p className="text-sm text-slate-700">
                            A land area calculator converts between common and regional land units. It helps buyers, sellers, and developers quickly
                            translate plot sizes from, say, Gaj or Bigha into Sqft/Acre, or Hectare into Sqm. Because Indian regional units like Bigha,
                            Katha, Biswa, and Guntha vary by state/district, this tool lets you choose a regional preset or set custom values.
                        </p>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                            <div className="rounded border border-slate-200 p-3">
                                <div className="font-medium text-slate-900">Why precision matters</div>
                                <p className="mt-1">For large plots, small rounding differences can compound into material differences in valuation and circle rates.</p>
                            </div>
                            <div className="rounded border border-slate-200 p-3">
                                <div className="font-medium text-slate-900">Regional variability</div>
                                <p className="mt-1">Verify local practice (revenue records, sale deed). Use Custom if your locality uses a different standard.</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Most Searched Units (educational) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <Card title="Most Searched Conversion Units for Land Area Calculator">
                        <ol className="list-decimal pl-5 text-sm text-slate-700 space-y-2">
                            <li>
                                <span className="font-medium text-slate-900">Square Feet (sq ft)</span> - Area of a square with 1‑ft sides. Widely used in India and countries like the US/UK/Canada, etc.
                            </li>
                            <li>
                                <span className="font-medium text-slate-900">Square Meter (sq m)</span> - International SI unit (m²). 1 sq m = 10.7639 sq ft.
                            </li>
                            <li>
                                <span className="font-medium text-slate-900">Hectare (ha)</span> - Metric land unit. 1 ha = 10,000 sq m ≈ 2.47105 acres.
                            </li>
                            <li>
                                <span className="font-medium text-slate-900">Acre</span> - Imperial unit. 1 acre = 43,560 sq ft ≈ 4046.8564 sq m.
                            </li>
                            <li>
                                <span className="font-medium text-slate-900">Bigha (regional)</span> - Traditional unit; size varies by state (e.g., ~14,400 sq ft in WB; ~27,000 - 27,225 sq ft in UP/Rajasthan). Always verify locally.
                            </li>
                        </ol>
                    </Card>

                    <Card title="Quick reference (global constants)">
                        <ul className="text-sm text-slate-700 space-y-1.5">
                            <li>1 Acre = 43,560 sq ft = 4046.8564224 sq m</li>
                            <li>1 Hectare = 10,000 sq m ≈ 2.47105 Acres</li>
                            <li>1 Sq Yard (Gaj) = 9 sq ft = 0.83612736 sq m</li>
                            <li>1 Cent = 1/100 Acre = 435.6 sq ft = 40.468564224 sq m</li>
                            <li>1 Decimal = 1/100 Acre = 435.6 sq ft (East India)</li>
                            <li>Guntha (MH/KA): ≈ 1089 sq ft (≈ 101.1714 sq m)</li>
                        </ul>
                    </Card>
                </div>

                {/* FAQ (home-style) */}
                <AreaFAQ />
            </main>
            <Footer />
        </div>
    );
};

export default AreaConverter;