import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type LinkItem = { label: string; href: string; external?: boolean };
type Section = { title: string; links: LinkItem[] };
type MenuConfig = Record<string, Section[]>;

const MENU: MenuConfig = {
  Buy: [
    {
      title: "Popular Choices",
      links: [
        { label: "Ready to Move", href: "#", external: true },
        { label: "Owner Properties", href: "#", external: true },
        { label: "Budget Homes", href: "#", external: true },
        { label: "Premium Homes", href: "#", external: true },
        { label: "New Projects", href: "#", external: true },
      ],
    },
    {
      title: "Property Types",
      links: [
        { label: "Flats in Bangalore", href: "#", external: true },
        { label: "House/Villa for Sale", href: "#", external: true },
        { label: "Plot/Land", href: "#", external: true },
        // { label: 'Office Space', href: '#', external: true },
        { label: "Commercial Space", href: "#", external: true },
      ],
    },
    {
      title: "Budget",
      links: [
        { label: "Under ₹ 50 Lac", href: "#", external: true },
        { label: "₹ 50 Lac - ₹ 1 Cr", href: "#", external: true },
        { label: "₹ 1 Cr - ₹ 1.5 Cr", href: "#", external: true },
        { label: "Above ₹ 1.5 Cr", href: "#", external: true },
      ],
    },
    {
      title: "Explore",
      links: [
        // { label: 'Localities in Bangalore', href: '#', external: true },
        { label: "Projects in Bangalore", href: "#", external: true },
        // { label: 'Investment Hotspot', href: '#', external: true },
        { label: "Find an Agent", href: "#", external: true },
      ],
    },
    {
      title: "Buying Tools",
      links: [
        { label: "Rates & Trends", href: "#", external: true },
        { label: "Buy vs Rent", href: "#", external: true },
        { label: "Tips & Guides", href: "#", external: true },
      ],
    },
  ],
  Rent: [
    {
      title: "Popular Choices",
      links: [
        { label: "Owner Properties", href: "#", external: true },
        { label: "Family Friendly", href: "#", external: true },
        { label: "Furnished Homes", href: "#", external: true },
        { label: "Bachelor Friendly", href: "#", external: true },
        { label: "Immediately Available", href: "#", external: true },
      ],
    },
    {
      title: "Property Types",
      links: [
        { label: "Flat for Rent", href: "#", external: true },
        { label: "House/Villa for Rent", href: "#", external: true },
        { label: "PG in Bangalore", href: "#", external: true },
        // { label: 'Office Space', href: '#', external: true },
        { label: "Commercial Space", href: "#", external: true },
      ],
    },
    {
      title: "Budget",
      links: [
        { label: "Under ₹ 10,000", href: "#", external: true },
        { label: "₹ 10,000 - ₹ 25,000", href: "#", external: true },
        { label: "₹ 25,000 - ₹ 50,000", href: "#", external: true },
        { label: "Above ₹ 50,000", href: "#", external: true },
      ],
    },
  ],
  Sell: [
    {
      title: "For Owners",
      links: [
        { label: "Post Property (Free)", href: "#", external: true },
        { label: "My Dashboard", href: "#", external: true },
      ],
    },
    {
      title: "Agent & Builder",
      links: [
        { label: "List Property (Free)", href: "#", external: true },
        { label: "Manage Properties", href: "#", external: true },
      ],
    },
  ],
  "Home Loans": [
    {
      title: "Apply / Tools",
      links: [
        { label: "Apply Home Loan", href: "#", external: true },
        { label: "EMI Calculator", href: "#", external: true },
        { label: "Eligibility Calculator", href: "#", external: true },
      ],
    },
    {
      title: "Partners",
      links: [
        { label: "HDFC Ltd", href: "#", external: true },
        { label: "Bank of Maharastra", href: "#", external: true },
        { label: "Nainital Bank", href: "#", external: true },
        { label: "ICICI", href: "#", external: true },
      ],
    },
  ],
  "Home Interiors": [
    {
      title: "Explore",
      links: [{ label: "Interior Services", href: "#", external: true }],
    },
  ],
  "EL Advice": [
    {
      title: "Research",
      links: [{ label: "Research & Insights", href: "#", external: true }],
    },
    {
      title: "Tools",
      links: [
        { label: "Rates & Trends", href: "#", external: true },
        { label: "Area Converter", href: "#", external: true },
        { label: "Buy v/s Rent", href: "#", external: true },
      ],
    },
  ],
  Help: [
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#", external: true },
        { label: "Chat with Us", href: "#", external: true },
      ],
    },
  ],
};

const TABS = Object.keys(MENU);

type SubHeaderProps = {
  currentCity?: string; // NEW
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
};

const SubHeader: React.FC<SubHeaderProps> = ({
  currentCity,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [activeDesktop, setActiveDesktop] = useState<string | null>(null);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [openMobileTab, setOpenMobileTab] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const isControlled =
    typeof mobileMenuOpen === "boolean" &&
    typeof setMobileMenuOpen === "function";
  const isMobileOpen = isControlled
    ? (mobileMenuOpen as boolean)
    : internalMobileOpen;

  // Replace "in <...>" targets with the detected city (only for specific patterns)
  const labelWithCity = (label: string) => {
    if (!currentCity) return label;
    const lower = label.toLowerCase();
    const patterns = [
      "flats in ",
      "localities in ",
      "projects in ",
      "pg in ",
      "designers in ",
    ];
    if (!patterns.some((p) => lower.includes(p))) return label;
    return label.replace(/(in\s+)[^,]+$/i, `$1${currentCity}`);
  };

  const routeFor = (
    label: string,
    tab?: string,
    city?: string
  ): string | "BUDGET_MODAL" | null => {
    const t = (tab || "").toLowerCase();
    const L = label.trim().toLowerCase();

    // Helper to parse "₹ 10,000" -> 10000
    const num = (s: string) => {
      const n = parseInt(String(s).replace(/[^\d]/g, ""), 10);
      return Number.isFinite(n) ? n : NaN;
    };

    // SELL shortcuts
    if (t === "sell") {
      if (L.includes("post property")) return "/list-property";
      if (L.includes("list property")) return "/list-property";
      if (L.includes("my dashboard")) return "/account";
      if (L.includes("manage properties")) return "/account";
      return null;
    }

    // RENT shortcuts
    if (t === "rent") {
      // Popular Choices
      if (L === "owner properties")
        return "/properties?for=rent&listed_by=owner";
      if (L === "family friendly")
        return "/properties?for=rent&preferred_tenants=family";
      if (L === "furnished homes")
        return "/properties?for=rent&furnishing=furnished";
      if (L === "bachelor friendly")
        return "/properties?for=rent&preferred_tenants=bachelor";
      if (L === "immediately available")
        return "/properties?for=rent&available_immediately=true";

      // Property Types
      if (L === "flat for rent" || L === "flats for rent")
        return "/properties?for=rent&type=flat";
      if (
        L === "house/villa for rent" ||
        (L.includes("house") && L.includes("villa") && L.includes("rent"))
      ) {
        return "/properties?for=rent&type=house";
      }
      if (/^pg\s+in\s+/i.test(L)) {
        const match = label.match(/pg\s+in\s+(.+)$/i);
        const labelCity = match?.[1]?.trim();
        const targetCity = city || labelCity;
        const cityQS = targetCity
          ? `&location=${encodeURIComponent(targetCity)}`
          : "";
        return `/properties?for=rent&type=pg${cityQS}`;
      }
      if (L.includes("commercial"))
        return "/properties?for=rent&type=commercial";

      const underMatch = label.match(/under\s*₹?\s*([\d,]+)/i);
      if (underMatch) {
        const max = num(underMatch[1]);
        if (!Number.isNaN(max)) return `/properties?for=rent&maxPrice=${max}`;
      }

      const rangeMatch = label.match(/₹?\s*([\d,]+)\s*-\s*₹?\s*([\d,]+)/i);
      if (rangeMatch) {
        const min = num(rangeMatch[1]);
        const max = num(rangeMatch[2]);
        if (!Number.isNaN(min) && !Number.isNaN(max)) {
          return `/properties?for=rent&minPrice=${min}&maxPrice=${max}`;
        }
      }
      const aboveMatch = label.match(/above\s*₹?\s*([\d,]+)/i);
      if (aboveMatch) {
        const min = num(aboveMatch[1]);
        if (!Number.isNaN(min)) return `/properties?for=rent&minPrice=${min}`;
      }

      return null;
    }

    if (t === "home loans") {
      if (L.includes("apply") && L.includes("home") && L.includes("loan"))
        return "/home-loans/apply";
      if (L.includes("emi") && L.includes("calc"))
        return "/home-loans/emi-calculator";
      if (L.includes("eligibility") && L.includes("calc"))
        return "/home-loans/eligibility-calculator";
      if (L.includes("hdfc")) return "/home-loans/partners/hdfc";
      if (L.includes("bank of mahar") || L.includes("maharas"))
        return "/home-loans/partners/bank-of-maharashtra";
      if (L.includes("nainital")) return "/home-loans/partners/nainital-bank";
      if (L.includes("icici")) return "/home-loans/partners/icici";

      return null;
    }

    // Home Interiors routes
    if (t === "home interiors") {
      if (L === "interior services") return "/interior-services";
      return null;
    }

    // EL ADVICE routes
    if (t === "el advice") {
      // Research
      if (
        L.includes("research") &&
        (L.includes("insight") || L.includes("insights"))
      )
        return "/blog";
      // Tools
      if (L.includes("rates") && L.includes("trend"))
        return "/rates-and-trends";
      if (L.includes("area") && L.includes("convert")) return "/area-converter";
      if (
        L.includes("buy") &&
        (L.includes("vs") || L.includes("v/s") || L.includes("versus")) &&
        L.includes("rent")
      ) {
        return "/buy-vs-rent";
      }
      return null;
    }

    // HELP routes
    if (t === "help") {
      if (L.includes("help") && L.includes("center")) return "/help-center";
      if (L.includes("chat") && L.includes("us")) return "/chat-with-us";
      return null;
    }

    // BUY shortcuts (existing)
    if (t !== "buy") return null;

    // Popular Choices (Buy)
    if (L === "ready to move") return "/properties?for=sale&ready_to_move=true";
    if (L === "owner properties") return "/properties?for=sale&listed_by=owner";
    if (L === "premium homes") return "/properties?for=sale&minPrice=5000000";
    if (L === "new projects") return "/properties?for=sale&listed_by=builder";
    if (L === "budget homes") return "BUDGET_MODAL";

    // Property Types (Buy)
    if (/^flats?\s+in\s+/i.test(L)) {
      const cityQS = city ? `&location=${encodeURIComponent(city)}` : "";
      return `/properties?for=sale&type=flat${cityQS}`;
    }
    if (L.includes("house") && L.includes("villa"))
      return "/properties?for=sale&type=house";
    if (L.includes("plot") || L.includes("land"))
      return "/properties?for=sale&type=land";
    if (L.includes("commercial")) return "/properties?for=sale&type=commercial";

    // Budget (Buy)
    if (
      /^under\s*₹?\s*50\s*lac/.test(L) ||
      /^under\s*50\s*lac/.test(L) ||
      /^under\s*50\s*l/.test(L)
    ) {
      return "/properties?for=sale&maxPrice=5000000";
    }
    if (
      (/50\s*lac/.test(L) || /50\s*l/.test(L)) &&
      (/1\s*cr/.test(L) || /1\s*crore/.test(L))
    ) {
      return "/properties?for=sale&minPrice=5000000&maxPrice=10000000";
    }
    if (
      (/1\s*cr/.test(L) || /1\s*crore/.test(L)) &&
      (/1\.5\s*cr/.test(L) || /1\.5\s*crore/.test(L))
    ) {
      return "/properties?for=sale&minPrice=10000000&maxPrice=15000000";
    }
    if (
      /^above\s*₹?\s*1\.5\s*cr/.test(L) ||
      /^above\s*1\.5\s*cr/.test(L) ||
      /^above\s*1\.5\s*crore/.test(L)
    ) {
      return "/properties?for=sale&minPrice=15000000";
    }

    // Explore (Buy)
    if (/^projects\s+in\s+/i.test(L)) {
      const cityQS = city ? `&location=${encodeURIComponent(city)}` : "";
      return `/properties?for=sale&listed_by=builder${cityQS}`;
    }
    if (L === "find an agent") return "/agents";

    // Buying Tools (Buy)
    if (L.includes("rates") && L.includes("trend")) return "/rates-and-trends";
    if (
      L.includes("buy") &&
      (L.includes("vs") || L.includes("v/s") || L.includes("versus")) &&
      L.includes("rent")
    ) {
      return "/buy-vs-rent";
    }
    if (L.includes("tips") && L.includes("guide")) return "/blog";

    return null;
  };

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDesktop(null);
        if (isControlled) setMobileMenuOpen!(false);
        else setInternalMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isControlled, setMobileMenuOpen]);

  // Close desktop dropdown if clicking outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setActiveDesktop(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isDesktopOpen = Boolean(activeDesktop);

  const navigate = useNavigate();

  const [budgetOpen, setBudgetOpen] = useState(false);
  const [minBudget, setMinBudget] = useState(1500000);
  const [maxBudget, setMaxBudget] = useState(10000000);
  const MIN = 1500000;
  const MAX = 10000000;
  const STEP = 100000; // 1 Lac
  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), hi);
  const formatINRShort = (n: number) => {
    if (n >= 10000000)
      return `₹ ${(n / 10000000).toFixed(1).replace(/\.0$/, "")} Cr`;
    if (n >= 100000)
      return `₹ ${(n / 100000).toFixed(1).replace(/\.0$/, "")} L`;
    return `₹ ${n.toLocaleString("en-IN")}`;
  };

  return (
    <div ref={wrapRef} className="relative bg-[#DADADAFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Desktop tabs */}
        <nav
          className="hidden items-center gap-2 py-2 md:flex"
          aria-label="Sub navigation"
        >
          {TABS.map((tab) => {
            const selected = activeDesktop === tab;
            return (
              <button
                key={tab}
                type="button"
                onMouseEnter={() => setActiveDesktop(tab)}
                onFocus={() => setActiveDesktop(tab)}
                onClick={() => setActiveDesktop(selected ? null : tab)}
                className={[
                  "group relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  selected
                    ? "text-emerald-700"
                    : "text-slate-700 hover:text-emerald-700",
                ].join(" ")}
                aria-expanded={selected}
                aria-controls={`panel-${tab}`}
              >
                {tab}
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    selected ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={[
                    "pointer-events-none absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-emerald-500 transition-opacity",
                    selected ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </nav>

        {/* Mobile accordion (controlled externally) */}
        <div
          id="mobile-accordion"
          className={[
            "md:hidden transition-all",
            isMobileOpen
              ? "opacity-100 overflow-y-auto"
              : "max-h-0 opacity-0 overflow-hidden",
          ].join(" ")}
        >
          <div className="divide-y divide-slate-200 border-t">
            {TABS.map((tab, idx) => {
              const open = openMobileTab === tab;
              const contentId = `m-panel-${idx}`;
              return (
                <div key={tab} className="px-1">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={contentId}
                    onClick={() => setOpenMobileTab(open ? null : tab)}
                    className="flex w-full items-center justify-between py-3 text-left"
                  >
                    <span className="text-[15px] font-medium text-slate-800">
                      {tab}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-500 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div id={contentId} hidden={!open} className="pb-3">
                    <div className="mx-1 rounded-xl border border-slate-200 bg-white p-3">
                      <div className="grid grid-cols-1 gap-6">
                        {MENU[tab].map((sec, i) => (
                          <div key={i}>
                            <div className="mb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {sec.title}
                            </div>
                            <ul className="space-y-1.5">
                              {sec.links.map((lnk, j) => (
                                <li key={j}>
                                  {(() => {
                                    const to = routeFor(
                                      lnk.label,
                                      tab,
                                      currentCity
                                    );
                                    if (to === "BUDGET_MODAL") {
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setMinBudget(MIN);
                                            setMaxBudget(MAX);
                                            setBudgetOpen(true);
                                          }}
                                          className="group flex w-full items-center justify-between rounded-md px-2 py-2 text-[0.98rem] text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                        >
                                          {labelWithCity(lnk.label)}
                                          <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                        </button>
                                      );
                                    }
                                    if (to) {
                                      return (
                                        <Link
                                          to={to}
                                          onClick={() => {
                                            if (
                                              typeof setMobileMenuOpen ===
                                              "function"
                                            )
                                              setMobileMenuOpen(false);
                                            else setInternalMobileOpen(false);
                                            setActiveDesktop(null);
                                          }}
                                          className="group flex items-center justify-between rounded-md px-2 py-2 text-[0.98rem] text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                        >
                                          {labelWithCity(lnk.label)}
                                          <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                        </Link>
                                      );
                                    }
                                    return (
                                      <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="group flex items-center justify-between rounded-md px-2 py-2 text-[0.98rem] text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                      >
                                        {labelWithCity(lnk.label)}
                                        <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                      </a>
                                    );
                                  })()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop dropdown panel */}
      <div
        className={[
          "absolute left-0 right-0 z-30 hidden transition md:block",
          isDesktopOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-1 pointer-events-none opacity-0",
        ].join(" ")}
        onMouseLeave={() => setActiveDesktop(null)}
      >
        {TABS.map((tab) => {
          const show = activeDesktop === tab;
          const sections = MENU[tab];
          return (
            <div
              key={tab}
              id={`panel-${tab}`}
              role="region"
              aria-label={`${tab} menu`}
              hidden={!show}
              className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8"
            >
              <div className="rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5">
                <div className="grid grid-cols-2 gap-8 p-6 md:grid-cols-4 lg:grid-cols-5">
                  {sections.map((sec, i) => (
                    <div key={i}>
                      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {sec.title}
                      </div>
                      <ul className="space-y-1.5">
                        {sec.links.map((lnk, j) => (
                          <li key={j}>
                            {(() => {
                              const to = routeFor(lnk.label, tab, currentCity);
                              if (to === "BUDGET_MODAL") {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMinBudget(MIN);
                                      setMaxBudget(MAX);
                                      setBudgetOpen(true);
                                    }}
                                    className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[0.98rem] text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                  >
                                    {labelWithCity(lnk.label)}
                                    <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                  </button>
                                );
                              }
                              if (to) {
                                return (
                                  <Link
                                    to={to}
                                    onClick={() => setActiveDesktop(null)}
                                    className="group flex items-center justify-between rounded-md px-2 py-1.5 text-[0.98rem] text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                  >
                                    {labelWithCity(lnk.label)}
                                    <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                  </Link>
                                );
                              }
                              return (
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="group flex items-center justify-between rounded-md px-2 py-1.5 text-[0.98rem] text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                                >
                                  {labelWithCity(lnk.label)}
                                  <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                                </a>
                              );
                            })()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Budget Homes modal (range 15L–1Cr) */}
      {budgetOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-3">
          <div className="w-[min(95vw,560px)] rounded-xl bg-white shadow-xl ring-1 ring-black/10 p-5">
            <div className="mb-1 text-lg font-semibold text-slate-900">
              Select your budget
            </div>
            <div className="mb-3 text-sm text-slate-600">
              {formatINRShort(minBudget)} - {formatINRShort(maxBudget)}
            </div>

            {/* Dual range slider */}
            <div className="space-y-4">
              {/* Min slider */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Min
                </label>
                <input
                  type="range"
                  min={MIN}
                  max={MAX}
                  step={STEP}
                  value={minBudget}
                  onChange={(e) => {
                    const v = clamp(
                      parseInt(e.target.value, 10),
                      MIN,
                      maxBudget
                    );
                    setMinBudget(v);
                  }}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Max slider */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Max
                </label>
                <input
                  type="range"
                  min={MIN}
                  max={MAX}
                  step={STEP}
                  value={maxBudget}
                  onChange={(e) => {
                    const v = clamp(
                      parseInt(e.target.value, 10),
                      minBudget,
                      MAX
                    );
                    setMaxBudget(v);
                  }}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBudgetOpen(false)}
                className="px-4 py-2 rounded-md border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const qs = new URLSearchParams();
                  qs.set("for", "sale");
                  qs.set("minPrice", String(minBudget));
                  qs.set("maxPrice", String(maxBudget));
                  setBudgetOpen(false);
                  setActiveDesktop(null);
                  if (typeof setMobileMenuOpen === "function")
                    setMobileMenuOpen(false);
                  else setInternalMobileOpen(false);
                  navigate(`/properties?${qs.toString()}`);
                }}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white"
              >
                Explore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubHeader;
