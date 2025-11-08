import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { HelpCircle, Search, ChevronDown, ChevronRight, MessageSquare, Phone, Mail } from 'lucide-react';

const Card: React.FC<{ title?: string; subtitle?: string; className?: string; children: React.ReactNode }> = ({ title, subtitle, className, children }) => (
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

type Article = { title: string; to: string; tag?: string };

const ALL_ARTICLES: Article[] = [
    { title: 'How to post your property on EasyLease', to: '/list-property', tag: 'Selling' },
    { title: 'EMI Calculator  -  plan your home loan', to: '/home-loans/emi-calculator', tag: 'Home Loans' },
    { title: 'Eligibility Calculator  -  check your maximum loan', to: '/home-loans/eligibility-calculator', tag: 'Home Loans' },
    { title: 'Area Converter  -  sqft, sqm, gaj, bigha, acre', to: '/area-converter', tag: 'Tools' },
    { title: 'Rates & Trends  -  market prices and insights', to: '/rates-and-trends', tag: 'Research' },
    { title: 'Buy vs Rent  -  which is better for you?', to: '/buy-vs-rent', tag: 'Tools' },
    { title: 'Updating account details & password', to: '/account', tag: 'Account' },
];

const FAQ: React.FC = () => {
    const [open, setOpen] = useState<number | null>(0);
    const items = [
        {
            q: 'How do I contact support?',
            a: (
                <p>
                    You can chat with us via the Chat with Us page, or email support@easylease.in. For urgent queries, call our helpline.
                </p>
            ),
        },
        {
            q: 'How long do verifications take?',
            a: <p>Most KYC/document checks complete within 24–48 business hours once we receive all documents.</p>,
        },
        {
            q: 'Can I change my loan partner later?',
            a: <p>Yes, you can compare and switch before sanction. Post-sanction, ask about balance transfer options.</p>,
        },
        {
            q: 'Why do regional area units vary?',
            a: <p>Units like Bigha/Katha/Guntha differ by state/district revenue practice. Use presets in Area Converter or set custom values.</p>,
        },
    ];

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
                            const contentId = `hc-faq-panel-${idx}`;
                            const btnId = `hc-faq-button-${idx}`;
                            return (
                                <div key={idx} className="group">
                                    <button
                                        id={btnId}
                                        aria-controls={contentId}
                                        aria-expanded={isOpen}
                                        onClick={() => setOpen(isOpen ? null : idx)}
                                        className={`w-full flex items-center justify-between text-left px-4 sm:px-6 py-4 sm:py-5 focus:outline-none transition-colors
                      ${isOpen ? 'bg-gray-50' : 'bg-white'} hover:bg-[#CCF0E1]`}
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
                        Note: Response times may vary during weekends or holidays.
                    </p>
                </div>
            </div>
        </section>
    );
};

const HelpCenter: React.FC = () => {
    const navigate = useNavigate();
    const [q, setQ] = useState('');
    const results = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return ALL_ARTICLES.slice(0, 6);
        return ALL_ARTICLES.filter(a => a.title.toLowerCase().includes(t)).slice(0, 10);
    }, [q]);

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
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Help Center</h1>
                    </div>
                    <p className="mt-2 text-slate-600">Find answers, tools, and ways to get in touch. We’re here to help.</p>
                </div>

                {/* Search + quick links */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Card title="Search help articles" className="lg:col-span-2">
                        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                            <Search className="h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search how-tos, calculators, and policies..."
                                className="w-full outline-none text-sm"
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {results.map((a, i) => (
                                <Link key={i} to={a.to} className="group flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50">
                                    <span className="text-sm text-slate-800">{a.title}</span>
                                    <ChevronRight className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
                                </Link>
                            ))}
                        </div>
                    </Card>

                    <Card title="Contact us" subtitle="Prefer to talk to a human?">
                        <div className="space-y-2">
                            <Link to="/chat-with-us" className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                                <MessageSquare className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm text-slate-800">Chat with us</span>
                            </Link>
                            <a href="mailto:support@easylease.in" className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                                <Mail className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm text-slate-800">support@easylease.in</span>
                            </a>
                            <a href="tel:+918448163874" className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50">
                                <Phone className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm text-slate-800">+91 8448163874</span>
                            </a>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card title="Buying & Selling">
                        <ul className="text-sm text-slate-700 space-y-1.5">
                            <li><Link to="/list-property" className="hover:underline">Post property for sale</Link></li>
                            <li><Link to="/rates-and-trends" className="hover:underline">Rates & Trends</Link></li>
                            <li><Link to="/buy-vs-rent" className="hover:underline">Buy v/s Rent</Link></li>
                            <li><Link to="/blog" className="hover:underline">Tips & Guides</Link></li>
                        </ul>
                    </Card>
                    <Card title="Renting">
                        <ul className="text-sm text-slate-700 space-y-1.5">
                            <li><Link to="/properties?for=rent" className="hover:underline">Find homes for rent</Link></li>
                            <li><Link to="/buy-vs-rent" className="hover:underline">Compare rent vs buy</Link></li>
                            <li><Link to="/blog" className="hover:underline">Tenant quick tips</Link></li>
                        </ul>
                    </Card>
                    <Card title="Home Loans">
                        <ul className="text-sm text-slate-700 space-y-1.5">
                            <li><Link to="/home-loans/apply" className="hover:underline">Apply Home Loan</Link></li>
                            <li><Link to="/home-loans/emi-calculator" className="hover:underline">EMI Calculator</Link></li>
                            <li><Link to="/home-loans/eligibility-calculator" className="hover:underline">Eligibility Calculator</Link></li>
                        </ul>
                    </Card>
                    <Card title="Account & Security">
                        <ul className="text-sm text-slate-700 space-y-1.5">
                            <li><Link to="/account" className="hover:underline">Manage account</Link></li>
                            <li><Link to="/blog" className="hover:underline">Safety & fraud awareness</Link></li>
                        </ul>
                    </Card>
                </div>

                {/* FAQ */}
                <FAQ />
            </main>
            <Footer />
        </div>
    );
};

export default HelpCenter;