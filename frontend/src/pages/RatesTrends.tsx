import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ChevronDown, HelpCircle } from 'lucide-react';

// -------------------- Helpers --------------------
type Point = { x: Date; y: number };
type Series = { name: string; color: string; points: Point[] };

const CITIES = ['Dehradun', 'Bangalore', 'Delhi NCR', 'Mumbai', 'Pune'] as const;
type City = typeof CITIES[number];

const CITY_LOCALITIES: Record<City, string[]> = {
    Dehradun: ['Rajpur Road', 'GMS Road', 'Clement Town', 'Ballupur', 'Prem Nagar', 'Dalanwala', 'Vasant Vihar', 'Jakhan'],
    Bangalore: ['Whitefield', 'Indiranagar', 'HSR Layout', 'Koramangala', 'Jayanagar', 'Hebbal', 'Electronic City', 'Yelahanka'],
    'Delhi NCR': ['Gurgaon DLF 5', 'Noida Sec 150', 'Dwarka', 'Vasant Kunj', 'Saket', 'Greater Noida', 'Ghaziabad Indirapuram', 'Rohini'],
    Mumbai: ['Bandra West', 'Andheri East', 'Powai', 'Thane', 'Navi Mumbai Kharghar', 'Borivali', 'Lower Parel', 'Malad West'],
    Pune: ['Koregaon Park', 'Kharadi', 'Wakad', 'Baner', 'Hinjewadi', 'Viman Nagar', 'Pimple Saudagar', 'Aundh'],
};

const cityBasePsqft: Record<City, number> = {
    Dehradun: 5500,
    Bangalore: 9500,
    'Delhi NCR': 8500,
    Mumbai: 22000,
    Pune: 8000,
};

const cityRentBase: Record<City, number> = {
    Dehradun: 10000, // 2BHK illustrative
    Bangalore: 25000,
    'Delhi NCR': 22000,
    Mumbai: 42000,
    Pune: 22000,
};

function hashCode(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return h;
}

function rng(seed: number): () => number {
    let x = seed || 123456789;
    return () => {
        // xorshift
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        // to 0..1
        return (x >>> 0) / 4294967295;
    };
}

function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function lastNMonths(n: number): Date[] {
    const now = new Date();
    const start = addMonths(new Date(now.getFullYear(), now.getMonth(), 1), -n + 1);
    const arr: Date[] = [];
    for (let i = 0; i < n; i++) arr.push(addMonths(start, i));
    return arr;
}

function INR(n: number) {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatINRShort(n: number) {
    if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(1).replace(/\.0$/, '')} Cr`;
    if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(1).replace(/\.0$/, '')} L`;
    return `₹ ${INR(n)}`;
}

function percent(n: number) {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(1)}%`;
}

// Small helpers to avoid .at() and flatMap
const safeLast = <T,>(arr: T[]) => (arr.length ? arr[arr.length - 1] : undefined);

// -------------------- Data generation (illustrative) --------------------
type CitySeries = {
    medianPsqft: Series;
    rentIndex: Series;       // 100-based index
    transactions: Series;    // monthly transactions (illustrative)
    inventory: Series;       // active listings
    domDays: Series;         // days on market
};

function generateCitySeries(city: City, months: number): CitySeries {
    const seed = hashCode(city) ^ months;
    const rnd = rng(seed);

    const psqftStart = cityBasePsqft[city];
    const rentStart = cityRentBase[city];

    // Trend assumptions (illustrative)
    const yoyPrice = 4 + rnd() * 5; // 4% - 9% YoY
    const yoyRent = 3 + rnd() * 4;  // 3% - 7% YoY
    const monthlyPriceTrend = 1 + yoyPrice / 12 / 100;
    const monthlyRentTrend = 1 + yoyRent / 12 / 100;

    const seasonality = (i: number) => 1 + 0.04 * Math.sin((2 * Math.PI * i) / 12); // ±4%

    const dates = lastNMonths(months);

    const medianPsqftPts: Point[] = [];
    const rentIndexPts: Point[] = [];
    const transactionsPts: Point[] = [];
    const inventoryPts: Point[] = [];
    const domPts: Point[] = [];

    let p = psqftStart * (0.95 + rnd() * 0.1);
    let rent = rentStart * (0.95 + rnd() * 0.1);
    let txBase =
        (city === 'Mumbai' ? 3200 : city === 'Bangalore' ? 2800 : city === 'Delhi NCR' ? 2600 : city === 'Pune' ? 2000 : 900) *
        (0.9 + rnd() * 0.2);

    for (let i = 0; i < dates.length; i++) {
        // Price per sqft
        p = p * monthlyPriceTrend * (0.985 + rnd() * 0.03) * seasonality(i);
        const priceNoise = 1 + (rnd() - 0.5) * 0.01; // ±1%
        const psqft = Math.max(1500, p * priceNoise);

        // Rent index (base ~100 scaled to city rent)
        rent = rent * monthlyRentTrend * (0.985 + rnd() * 0.03) * seasonality(i);
        const rentIdx = (rent / rentStart) * 100;

        // Transactions and inventory with mild seasonality
        const tx = Math.max(50, txBase * seasonality(i) * (0.95 + rnd() * 0.1));
        const inv = Math.max(100, tx * (2.2 + (rnd() - 0.5) * 0.4)); // inventory ~ 2.2x tx
        const dom = Math.max(20, 80 - (tx / inv) * 60 + (rnd() - 0.5) * 8); // higher absorption -> lower DOM

        medianPsqftPts.push({ x: dates[i], y: psqft });
        rentIndexPts.push({ x: dates[i], y: rentIdx });
        transactionsPts.push({ x: dates[i], y: tx });
        inventoryPts.push({ x: dates[i], y: inv });
        domPts.push({ x: dates[i], y: dom });
    }

    return {
        medianPsqft: { name: `${city} • Median Price/sq.ft`, color: '#0ea5e9', points: medianPsqftPts },
        rentIndex: { name: `${city} • Rent Index`, color: '#10b981', points: rentIndexPts },
        transactions: { name: `${city} • Transactions`, color: '#f59e0b', points: transactionsPts },
        inventory: { name: `${city} • Inventory`, color: '#6366f1', points: inventoryPts },
        domDays: { name: `${city} • Days on Market`, color: '#ef4444', points: domPts },
    };
}

function yoy(series: Series, months = 12): number | null {
    const n = series.points.length;
    if (n <= months) return null;
    const now = series.points[n - 1].y;
    const prev = series.points[n - 1 - months].y;
    if (prev === 0) return null;
    return ((now - prev) / prev) * 100;
}

// -------------------- Mini Chart (SVG) --------------------
const LineChart: React.FC<{
    series: Series[];
    height?: number;
    yFormat?: (n: number) => string;
    yUnit?: string;
    gridLines?: number;
}> = ({ series, height = 280, yFormat = (n) => String(Math.round(n)), yUnit, gridLines = 4 }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(600);
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    // Avoid flatMap for older libs
    const allPoints = useMemo(
        () => series.map((s) => s.points).reduce<Point[]>((acc, arr) => acc.concat(arr), []),
        [series]
    );
    const n = series[0]?.points.length || 0;

    const minY = useMemo(() => {
        const min = Math.min(...allPoints.map((p) => p.y));
        const pad = Math.max(1, Math.abs(min)) * 0.08;
        return min - pad;
    }, [allPoints]);

    const maxY = useMemo(() => {
        const max = Math.max(...allPoints.map((p) => p.y));
        const pad = Math.max(1, Math.abs(max)) * 0.08;
        return max + pad;
    }, [allPoints]);

    const xStep = n > 1 ? width / (n - 1) : width;
    const toX = (i: number) => i * xStep;
    const toY = (y: number) => {
        const h = height - 24; // bottom padding
        return h - ((y - minY) / (maxY - minY)) * (h - 16); // top padding
    };

    useEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) {
                const w = Math.floor(e.contentRect.width);
                if (w > 0) setWidth(w);
            }
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    const ticks = Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = minY + ((maxY - minY) * i) / gridLines;
        return { y, py: toY(y) };
    });

    const onMove = (e: React.MouseEvent) => {
        const bounds = (e.currentTarget as SVGElement).getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const idx = Math.round(x / xStep);
        setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
    };

    const onLeave = () => setHoverIdx(null);

    const hoverDate =
        hoverIdx != null ? series[0]?.points[hoverIdx]?.x.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : null;

    return (
        <div ref={ref}>
            <svg width="100%" height={height} onMouseMove={onMove} onMouseLeave={onLeave} className="block">
                {/* Grid */}
                {ticks.map((t, i) => (
                    <g key={i}>
                        <line x1={0} x2={width} y1={t.py} y2={t.py} stroke="#e5e7eb" strokeDasharray="4 4" />
                        <text x={4} y={t.py - 4} fontSize="10" fill="#64748b">
                            {yFormat(t.y)}{yUnit || ''}
                        </text>
                    </g>
                ))}

                {/* X-axis month labels (every ~N) */}
                {series[0]?.points.map((p, i) => {
                    if (i % Math.max(1, Math.floor(n / 6)) !== 0) return null;
                    const label = p.x.toLocaleDateString('en-IN', { year: n > 20 ? '2-digit' : undefined, month: 'short' });
                    return (
                        <text key={i} x={toX(i)} y={height - 6} fontSize="10" fill="#64748b">
                            {label}
                        </text>
                    );
                })}

                {/* Lines */}
                {series.map((s, si) => {
                    const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.y)}`).join(' ');
                    return <path key={si} d={d} fill="none" stroke={s.color} strokeWidth={2} />;
                })}

                {/* Hover vertical line */}
                {hoverIdx != null && (
                    <line x1={toX(hoverIdx)} x2={toX(hoverIdx)} y1={0} y2={height} stroke="#94a3b8" strokeDasharray="4 4" />
                )}

                {/* Hover points */}
                {hoverIdx != null &&
                    series.map((s, si) => (
                        <circle key={si} cx={toX(hoverIdx)} cy={toY(s.points[hoverIdx].y)} r={3.5} fill="#fff" stroke={s.color} strokeWidth={2} />
                    ))}
            </svg>

            {/* Legend */}
            <div className="mt-2 flex flex-wrap gap-3">
                {series.map((s) => (
                    <div key={s.name} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        {s.name}
                    </div>
                ))}
            </div>

            {/* Hover tooltip */}
            {/* intentionally simple; the chart already works well */}
        </div>
    );
};

// -------------------- Page --------------------
type FaqItem = { q: string; a: React.ReactNode };
const RatesFaqSection: React.FC = () => {
    const [open, setOpen] = useState<number | null>(null);
    const faqs: FaqItem[] = [
        {
            q: 'Is YoY better than MoM?',
            a: (
                <p>
                    Usually yes. YoY comparisons neutralize seasonal patterns (festive periods, academic cycles), while MoM can be noisy.
                </p>
            ),
        },
        {
            q: 'What is absorption?',
            a: (
                <p>
                    It approximates demand: monthly sales ÷ active inventory. Higher absorption implies tighter markets and potentially faster price moves.
                </p>
            ),
        },
        {
            q: 'Why use median instead of average?',
            a: (
                <p>
                    Medians reduce the effect of extreme outliers (ultra‑luxury or distressed sales) and better represent the typical property.
                </p>
            ),
        },
        {
            q: 'How reliable are locality maps?',
            a: (
                <p>
                    They show relative differences; actual prices vary by micro‑pocket, project, floor, and amenities. Always verify with comps.
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
                            A quick primer on reading price trends, rent growth, and market strength.
                        </p>
                    </div>

                    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {faqs.map((item, idx) => {
                            const isOpen = open === idx;
                            const contentId = `rt-faq-panel-${idx}`;
                            const btnId = `rt-faq-button-${idx}`;
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

const RatesTrends: React.FC = () => {
    const [city, setCity] = useState<City>('Dehradun');
    const [compareCity, setCompareCity] = useState<City | 'None'>('None');
    const [months, setMonths] = useState<12 | 36 | 60>(12);
    const [metric, setMetric] = useState<'price' | 'rent' | 'tx'>('price');
    const navigate = useNavigate();

    const primary = useMemo(() => generateCitySeries(city, months), [city, months]);
    const secondary = useMemo(
        () => (compareCity === 'None' ? undefined : generateCitySeries(compareCity, months as number)),
        [compareCity, months]
    );

    // KPIs (safe against empty arrays)
    const lastMedian = safeLast(primary.medianPsqft.points);
    const lastInv = safeLast(primary.inventory.points);
    const lastDom = safeLast(primary.domDays.points);
    const lastTx = safeLast(primary.transactions.points);

    const medianNow = lastMedian ? lastMedian.y : 0;
    const medianYoY = yoy(primary.medianPsqft) ?? 0;
    const inventoryNow = Math.round(lastInv ? lastInv.y : 0);
    const domNow = Math.round(lastDom ? lastDom.y : 0);
    const rentYoY = yoy(primary.rentIndex) ?? 0;
    const absorption =
        lastTx && lastInv && lastInv.y > 0
            ? Math.min(100, Math.max(0, (lastTx.y / lastInv.y) * 100))
            : 0;

    const chartSeries: Series[] = useMemo(() => {
        if (metric === 'price') {
            const arr = [{ ...primary.medianPsqft, name: `${city} • Median ₹/sq.ft`, color: '#0ea5e9' }];
            if (secondary) arr.push({ ...secondary.medianPsqft, name: `${secondary.medianPsqft.name}`, color: '#64748b' });
            return arr;
        }
        if (metric === 'rent') {
            const arr = [{ ...primary.rentIndex, name: `${city} • Rent Index`, color: '#10b981' }];
            if (secondary) arr.push({ ...secondary.rentIndex, name: `${secondary.rentIndex.name}`, color: '#22c55e' });
            return arr;
        }
        const arr = [{ ...primary.transactions, name: `${city} • Transactions`, color: '#f59e0b' }];
        if (secondary) arr.push({ ...secondary.transactions, name: `${secondary.transactions.name}`, color: '#fb923c' });
        return arr;
    }, [metric, primary, secondary, city]);

    const yFmt = metric === 'price' ? (n: number) => INR(Math.round(n)) : (n: number) => n.toFixed(0);

    const localities = CITY_LOCALITIES[city];
    const localityTiles = useMemo(() => {
        // Create synthetic locality values around city median + small dispersion
        const base = medianNow;
        return localities.map((loc, i) => {
            const jitter = (i - localities.length / 2) * 0.02; // ±~8%
            const price = Math.round(base * (1 + jitter));
            const y = medianYoY + (i % 2 === 0 ? 0.6 : -0.6) * (1 + (i % 3) / 10); // little variation
            return { name: loc, price, yoy: y };
        });
    }, [localities, medianNow, medianYoY]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                {/* Hero */}
                <div className="mb-8">
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

                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Real Estate Rates & Trends</h1>
                        
                    </div>
                    <p className="mt-2 text-slate-600">
                        Explore prices, rent growth, volumes and more. Compare cities, track YoY changes, and understand market cycles.
                    </p>
                </div>

                {/* Controls */}
                <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <label className="text-xs font-medium text-slate-600">City</label>
                        <select
                            value={city}
                            onChange={(e) => setCity(e.target.value as City)}
                            className="mt-1 w-full rounded-md border-slate-300 text-sm"
                        >
                            {CITIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <label className="text-xs font-medium text-slate-600">Compare with</label>
                        <select
                            value={compareCity}
                            onChange={(e) => setCompareCity(e.target.value as City | 'None')}
                            className="mt-1 w-full rounded-md border-slate-300 text-sm"
                        >
                            <option value="None">None</option>
                            {CITIES.filter((c) => c !== city).map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <label className="text-xs font-medium text-slate-600">Timeframe</label>
                        <div className="mt-1 inline-flex overflow-hidden rounded-md border border-slate-200">
                            {[12, 36, 60].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMonths(m as 12 | 36 | 60)}
                                    className={`px-3 py-1.5 text-sm ${months === m ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {m === 12 ? '12M' : m === 36 ? '3Y' : '5Y'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <label className="text-xs font-medium text-slate-600">Metric</label>
                        <div className="mt-1 inline-flex overflow-hidden rounded-md border border-slate-200">
                            {[
                                { key: 'price', label: 'Median ₹/sq.ft' },
                                { key: 'rent', label: 'Rent Index' },
                                { key: 'tx', label: 'Transactions' },
                            ].map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => setMetric(m.key as any)}
                                    className={`px-3 py-1.5 text-sm ${metric === m.key ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* KPIs */}
                <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    <KpiCard title="Median ₹/sq.ft" value={formatINRShort(medianNow)} />
                    <KpiCard
                        title="Price YoY"
                        value={percent(medianYoY)}
                        badge={medianYoY >= 0 ? 'up' : 'down'}
                    />
                    <KpiCard title="Active Inventory" value={INR(inventoryNow)} />
                    <KpiCard title="Days on Market" value={`${domNow} days`} />
                    <KpiCard
                        title="Rent YoY"
                        value={percent(rentYoY)}
                        badge={rentYoY >= 0 ? 'up' : 'down'}
                    />
                    <KpiCard
                        title="Absorption"
                        value={`${absorption.toFixed(0)}%`}
                        tooltip="Approx. monthly sales vs inventory"
                    />
                </section>

                {/* Chart */}
                <section className="mb-10 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-800">
                            {metric === 'price' && `Median ₹/sq.ft`}
                            {metric === 'rent' && `Rent Index (base=100)`}
                            {metric === 'tx' && `Monthly Transactions`}
                        </div>
                        <div className="text-xs text-slate-500">
                            Data is illustrative. Use for educational insights.
                        </div>
                    </div>
                    <LineChart
                        series={chartSeries}
                        height={300}
                        yFormat={metric === 'price' ? (n) => INR(n) : (n) => n.toFixed(0)}
                        yUnit={metric === 'price' ? '' : ''}
                        gridLines={4}
                    />
                </section>

                {/* Localities */}
                <section className="mb-10">
                    <h2 className="mb-3 text-lg font-semibold text-slate-900">
                        {city}: locality snapshot (₹/sq.ft, YoY)
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {localityTiles.map((l) => (
                            <div key={l.name} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium text-slate-900">{l.name}</div>
                                    <div className={`text-xs font-medium ${l.yoy >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {percent(l.yoy)}
                                    </div>
                                </div>
                                <div className="mt-1 text-slate-700">{formatINRShort(l.price)}</div>
                                <div className="mt-3 h-2 w-full rounded bg-slate-100">
                                    <div
                                        className={`h-2 rounded ${l.yoy >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        style={{ width: `${Math.min(100, Math.abs(l.yoy) * 2)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Locality snapshots approximate relative differences; actual prices vary by building, floor, and age.
                    </p>
                </section>

                {/* Affordability quick glance */}
                <section className="mb-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">Affordability snapshot</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        For a representative loan of ₹ 50 Lac over 20 years at 8.5% p.a., the approximate EMI is:
                    </p>
                    <div className="mt-3 inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                        ₹ {INR(Math.round(emi(50_00_000, 8.5, 20)))}/month
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <AffordLine label="If rates +1%" value={emi(50_00_000, 9.5, 20)} />
                        <AffordLine label="If tenure +5y" value={emi(50_00_000, 8.5, 25)} />
                        <AffordLine label="If down payment +10%" note="Loan ₹45L" value={emi(45_00_000, 8.5, 20)} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">EMIs are approximate; check with your lender for exact quotes.</p>
                </section>

                {/* Home-style FAQ */}
                <RatesFaqSection />

                {/* CTAs */}
                <section className="mb-12 mt-6 flex flex-wrap items-center gap-3">
                    <a
                        href="/properties?for=sale"
                        className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                    >
                        Explore Homes for Sale
                    </a>
                    <a
                        href="/properties?for=rent"
                        className="inline-flex items-center rounded-md border border-emerald-600 px-4 py-2 text-emerald-700 hover:bg-emerald-50"
                    >
                        Explore Homes for Rent
                    </a>
                    <a
                        href="/blog"
                        className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    >
                        Tips & Guides
                    </a>
                </section>
            </main>

            <Footer />
        </div>
    );
};

// -------------------- Small UI bits --------------------
const KpiCard: React.FC<{ title: string; value: string | number; badge?: 'up' | 'down'; tooltip?: string }> = ({
    title,
    value,
    badge,
    tooltip,
}) => (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium text-slate-600">{title}</div>
            {badge && (
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                    title={tooltip}
                >
                    {badge === 'up' ? '▲' : '▼'}
                </span>
            )}
        </div>
        <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
    </div>
);

const AffordLine: React.FC<{ label: string; value: number; note?: string }> = ({ label, value, note }) => (
    <div className="rounded-md border border-slate-200 p-3">
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-sm font-semibold text-slate-900">₹ {INR(Math.round(value))}/month</div>
        {note && <div className="text-xs text-slate-500">{note}</div>}
    </div>
);

// EMI helper (P, annualRate%, years) reused for affordability
function emi(P: number, annualRate: number, years: number): number {
    const r = annualRate / 12 / 100;
    const n = years * 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default RatesTrends;