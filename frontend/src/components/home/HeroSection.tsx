import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { MapPin, CheckCircle2, Menu } from "lucide-react";
import SearchBar from "./SearchBar";
import SubHeader from "../layout/Subheader";
import { normalizeName } from "../../utils/location";
import { Loader } from "@googlemaps/js-api-loader";

type HeroSectionProps = {
  onLocationReady?: (coords: { lat: number; lng: number } | null) => void;
};

function collapseParts(...raw: (string | undefined)[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of raw) {
    const t = (part || "").trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.join(", ");
}

// Reflow-proof word cycler (unchanged)
function WordCycler({
  words,
  interval = 1500,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [boxW, setBoxW] = useState<number | null>(null);
  const [boxH, setBoxH] = useState<number | null>(null);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const sizerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % words.length),
      interval
    );
    return () => clearInterval(id);
  }, [interval, words.length]);

  const longest = React.useMemo(
    () =>
      words.reduce(
        (a, b) => (String(b).length > String(a).length ? b : a),
        words[0] || "Home"
      ),
    [words]
  );

  const measure = () => {
    const el = sizerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width) setBoxW(Math.ceil(rect.width));
    if (rect.height) setBoxH(Math.ceil(rect.height));
  };

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [longest]);

  return (
    <span
      ref={containerRef}
      className={[
        "relative inline-block align-baseline overflow-hidden",
        "block mx-auto lg:block lg:mx-0",
        className,
      ].join(" ")}
      style={{ width: boxW ?? undefined, height: boxH ?? undefined }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: "0.6em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.6em", opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center lg:justify-start"
        >
          <span className="whitespace-nowrap">{words[idx]}</span>
        </motion.span>
      </AnimatePresence>
      <span
        ref={sizerRef}
        aria-hidden
        className="absolute invisible pointer-events-none whitespace-nowrap"
        style={{ left: 0, top: 0 }}
      >
        {longest}
      </span>
    </span>
  );
}

// Optional: Count-up (unchanged)
function CountUp({
  end,
  duration = 1200,
  suffix = "",
  locale = "en-IN",
  className = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
  locale?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | undefined;
    let rAF = 0;
    const from = 0,
      to = end;
    const step = (ts: number) => {
      if (start === undefined) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) rAF = requestAnimationFrame(step);
    };
    rAF = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rAF);
  }, [inView, end, duration]);
  return (
    <span ref={ref} className={className}>
      {val.toLocaleString(locale)}
      {suffix}
    </span>
  );
}

const HeroSection: React.FC<HeroSectionProps> = ({ onLocationReady }) => {
  const navigate = useNavigate();

  const [locText, setLocText] = useState<string>("Locating…");
  const [initialLoc, setInitialLoc] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locLoading, setLocLoading] = useState<boolean>(true);
  const [locError, setLocError] = useState<string | null>(null);

  // NEW: control SubHeader mobile accordion
  const [subheaderMobileOpen, setSubheaderMobileOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<string>("");

  const handleSearch = (searchParams: any) => {
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/properties?${queryString}`);
  };

  const pickBestGeocodeResult = (results: any[]) => {
    if (!Array.isArray(results) || results.length === 0) return null;
    const hasType = (r: any, t: string) => (r.types || []).includes(t);
    const orderOfPreference = [
      (r: any) =>
        hasType(r, "sublocality") || hasType(r, "sublocality_level_1"),
      (r: any) => hasType(r, "neighborhood"),
      (r: any) => hasType(r, "route"),
      (r: any) => hasType(r, "premise") || hasType(r, "point_of_interest"),
      (r: any) => hasType(r, "locality"),
    ];
    for (const prefers of orderOfPreference) {
      const found = results.find(prefers);
      if (found) return found;
    }
    return results[0];
  };

  const buildLabelFromComponents = (comps: any[]) => {
    const get = (type: string) =>
      comps.find((c: any) => c.types?.includes(type))?.long_name || "";
    const route = get("route");
    const premise = get("premise") || get("point_of_interest");
    const neighborhood = get("neighborhood");
    const sublocality = get("sublocality") || get("sublocality_level_1");
    const cityRaw =
      get("locality") ||
      get("administrative_area_level_2") ||
      get("administrative_area_level_1") ||
      "";
    const city = normalizeName(cityRaw);
    const area = normalizeName(sublocality || neighborhood || "");
    const primary = normalizeName(route || premise) || "";
    return (
      [primary, area, city].filter(Boolean).join(", ") ||
      city ||
      "Your location"
    );
  };

  const getCityFromComponents = (comps: any[]) => {
    const get = (type: string) =>
      comps.find((c: any) => c.types?.includes(type))?.long_name || "";
    const cityRaw =
      get("locality") ||
      get("administrative_area_level_2") ||
      get("administrative_area_level_1") ||
      "";
    return normalizeName(cityRaw);
  };

  // Prefer a major city (locality), sanitize suffixes like "District"

  const sanitizeCity = (name: string) =>
    normalizeName(
      String(name || "")
        .replace(
          /\s*(district|sub[\s-]?district|tehsil|tahsil|taluk|taluka|mandal|block|sub[\s-]?division)$/i,
          ""
        )
        .replace(/\s*division$/i, "")
        .replace(/\s*metropolitan\s*(region|area)$/i, "")
        .trim()
    );

  // Extract the area (sublocality/neighborhood) for guard checks
  const extractAreaFromGoogle = (comps: any[]) => {
    const get = (t: string) =>
      comps.find((c: any) => (c.types || []).includes(t))?.long_name || "";
    const area =
      get("sublocality") ||
      get("sublocality_level_1") ||
      get("neighborhood") ||
      "";
    return normalizeName(area);
  };

  // Collect all sublocality/neighborhood names from all Google results
  const collectAreasFromResults = (results: any[]) => {
    const set = new Set<string>();
    const push = (s: string) => {
      const v = normalizeName(String(s || ""));
      if (v) set.add(v.toLowerCase());
    };
    for (const r of results) {
      for (const c of r.address_components || []) {
        const t = c.types || [];
        if (
          t.includes("sublocality") ||
          t.includes("sublocality_level_1") ||
          t.includes("sublocality_level_2") ||
          t.includes("neighborhood")
        ) {
          push(c.long_name);
        }
      }
    }
    return set;
  };

  const extractMajorCityFromGoogle = (comps: any[]) => {
    const get = (t: string) =>
      comps.find((c: any) => c.types?.includes(t))?.long_name || "";
    // Prefer city (locality), else district (admin_area_level_2), else state
    const city =
      get("locality") ||
      get("administrative_area_level_2") ||
      get("administrative_area_level_1") ||
      "";
    return sanitizeCity(city);
  };

  const extractMajorCityFromGoogleAnyComponent = (results: any[]) => {
    const prefer = (type: string) => {
      for (const r of results) {
        const comp = (r.address_components || []).find((c: any) =>
          (c.types || []).includes(type)
        );
        if (comp?.long_name) return sanitizeCity(comp.long_name);
      }
      return "";
    };
    return (
      prefer("locality") ||
      prefer("administrative_area_level_2") ||
      prefer("administrative_area_level_1")
    );
  };

  // Prefer district over locality for Indian addresses (more stable city proxy), then fallback
  const extractCityPreferAdmin2 = (results: any[]) => {
    const fromAny = (type: string) => {
      for (const r of results) {
        for (const c of r.address_components || []) {
          if ((c.types || []).includes(type) && c.long_name) {
            return sanitizeCity(c.long_name);
          }
        }
      }
      return "";
    };

    // Order: District -> City -> State
    return (
      fromAny("administrative_area_level_2") ||
      fromAny("locality") ||
      fromAny("administrative_area_level_1")
    );
  };

  const extractMajorCityFromGoogleResults = (results: any[]) => {
    // Prefer the result whose types include 'locality', then district, then state
    const pick = (type: string) =>
      results.find((r: any) => (r.types || []).includes(type));
    const candidate =
      pick("locality") ||
      pick("administrative_area_level_2") ||
      pick("administrative_area_level_1");

    return candidate
      ? extractMajorCityFromGoogle(candidate.address_components || [])
      : "";
  };

  const extractMajorCityFromNominatim = (addr: any) => {
    // Prefer city/town; fallback to state_district/county/state
    const city =
      addr.city ||
      addr.town ||
      addr.state_district ||
      addr.county ||
      addr.state ||
      "";
    return sanitizeCity(city);
  };

  // Names we don't want to show as "city" (common divisions in India)
  const isBadCityName = (name: string) => {
    const n = (name || "").trim().toLowerCase();
    return n === "garhwal" || n === "kumaon" || /division$/i.test(name);
  };

  // Fallback: fetch city/town from OpenStreetMap (Nominatim) even when Google is used
  const fetchNominatimCity = async (
    lat: number,
    lng: number
  ): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12&accept-language=en-IN&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "EasyLease/1.0 (support@easylease.app)" },
      });
      const data = await res.json();
      const addr = data?.address || {};
      const major = extractMajorCityFromNominatim(addr);
      return major || "";
    } catch {
      return "";
    }
  };

  // Looks like a neighborhood/area, not a city
  const looksLikeArea = (name: string) => {
    const n = (name || "").toLowerCase();
    return (
      /(?:\broad\b|\brd\b|\bmarg\b|\bchowk\b|\bmarket\b|\bbazar\b|\bsector\b|\bphase\b|\bcolony\b|\bnagar\b|\benclave\b|\bvihar\b|\blayout\b|\bextension\b|\bext\b)/i.test(
        n
      ) || /wala$/i.test(n)
    );
  };

  // Pick best city from Google results (India-optimized)
  const pickCityIndian = (results: any[]) => {
    // Collect all sublocality/neighborhood names across results
    const areaSet = collectAreasFromResults(results); // you already have this helper

    // Gather candidates with a rank (lower is better)
    type Cand = { val: string; rank: number; count: number };
    const map = new Map<string, Cand>();

    const push = (val: string, rank: number) => {
      const v = sanitizeCity(val);
      if (!v) return;
      const key = v.toLowerCase();
      // Don't accept names that look like areas or clearly divisional names
      if (areaSet.has(key)) return;
      if (looksLikeArea(v)) return;
      if (isBadCityName(v)) return; // you already have this helper (filters Garhwal/Kumaon)
      const prev = map.get(key);
      if (!prev) map.set(key, { val: v, rank, count: 1 });
      else {
        prev.rank = Math.min(prev.rank, rank);
        prev.count += 1;
      }
    };

    for (const r of results) {
      for (const c of r.address_components || []) {
        const t = c.types || [];
        if (t.includes("locality") || t.includes("postal_town"))
          push(c.long_name, 1);
        else if (t.includes("administrative_area_level_3"))
          push(c.long_name, 2);
        else if (t.includes("administrative_area_level_2"))
          push(c.long_name, 3);
        else if (t.includes("administrative_area_level_1"))
          push(c.long_name, 4);
      }
    }

    if (map.size === 0) return "";

    // Choose the best: lowest rank, then highest count
    let best: Cand | null = null;
    for (const cand of map.values()) {
      if (!best) best = cand;
      else if (
        cand.rank < best.rank ||
        (cand.rank === best.rank && cand.count > best.count)
      ) {
        best = cand;
      }
    }
    return best?.val || "";
  };

  const fetchLocation = async () => {
    setLocLoading(true);
    setLocError(null);
    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      ["localhost", "127.0.0.1", ""].includes(location.hostname);

    if (!isSecure) {
      setLocError("Use HTTPS (or localhost) to enable location");
      setLocLoading(false);
      onLocationReady?.(null);
      return;
    }
    if (!("geolocation" in navigator)) {
      setLocError("Geolocation not supported");
      setLocLoading(false);
      onLocationReady?.(null);
      return;
    }

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
          | string
          | undefined;
        if (apiKey) {
          const loader = new Loader({ apiKey, libraries: ["places"] });
          const google = await loader.load();
          const geocoder = new google.maps.Geocoder();
          return new Promise<void>((resolve) => {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results && results.length) {
                const best = pickBestGeocodeResult(results) || results[0];
                const label = buildLabelFromComponents(
                  best.address_components || []
                );
                setLocText(label);
                setInitialLoc(label);

                // Pick a proper city from Google; if it's bad/empty, fall back to OSM
                const candidate = pickCityIndian(results);

                if (candidate && !isBadCityName(candidate)) {
                  setCurrentCity(candidate);
                } else {
                  // Fallback to OpenStreetMap (usually returns city/town like "Dehradun")
                  fetchNominatimCity(lat, lng).then((nomiCity) => {
                    if (nomiCity && !isBadCityName(nomiCity)) {
                      setCurrentCity(nomiCity);
                    }
                  });
                }
              } else {
                setLocText("Location set");
              }
              resolve();
            });
          });
        } else {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&accept-language=en-IN&addressdetails=1`;
          const res = await fetch(url, {
            headers: { "User-Agent": "EasyLease/1.0 (support@easylease.app)" },
          });
          const data = await res.json();
          const addr = data?.address || {};
          const city = normalizeName(
            addr.city ||
              addr.town ||
              addr.village ||
              addr.county ||
              addr.state ||
              ""
          );
          const area = normalizeName(
            addr.road ||
              addr.suburb ||
              addr.neighbourhood ||
              addr.city_district ||
              addr.borough ||
              ""
          );
          const label =
            [area, city].filter(Boolean).join(", ") || city || "Your location";
          setLocText(label);
          setInitialLoc(label);

          const major = extractMajorCityFromNominatim(addr);
          if (major) setCurrentCity(major);
          // NEW: set current city
          // if (city) setCurrentCity(city);
        }
      } catch {
        setLocText("Location set");
      }
    };

    let best = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });

    if (!best) {
      setLocError("Permission denied");
      setLocLoading(false);
      onLocationReady?.(null);
      return;
    }

    const firstAcc = best.coords.accuracy ?? 9999;
    if (firstAcc > 150) {
      let watchId = 0;
      let improved = best;
      await new Promise<void>((done) => {
        let doneCalled = false;
        const finish = () => {
          if (!doneCalled) {
            doneCalled = true;
            try {
              navigator.geolocation.clearWatch(watchId);
            } catch {
              /* empty */
            }
            done();
          }
        };
        try {
          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              if (pos.coords.accuracy < (improved.coords.accuracy ?? 9999)) {
                improved = pos;
                if (pos.coords.accuracy <= 50) finish();
              }
            },
            () => finish(),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 4000 }
          );
          setTimeout(finish, 2000);
        } catch {
          setTimeout(done, 0);
        }
      });
      best = improved;
    }

    const lat = best.coords.latitude;
    const lng = best.coords.longitude;
    const c = { lat, lng };
    setCoords(c);
    onLocationReady?.(c);

    await reverseGeocode(lat, lng);
    setLocLoading(false);
  };

  useEffect(() => {
    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const houseImg = "/life.jpg";

  const stats = [
    { value: 1000, label: "PG Accommodations" },
    { value: 2500, label: "Apartments & Flats" },
    { value: 1200, label: "Independent Houses" },
    { value: 5000, label: "Happy Customers" },
  ];

  return (
    <div className="bg-gray-50">
      {/* Header: logo + location + mobile menu icon */}
      <header className="py-4 md:py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 pb-3">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
            >
              <img
                className="h-8 w-auto"
                src="/Easy_Lease_Logo.svg"
                alt="EasyLease"
              />
            </a>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchLocation}
                title="Use my location"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <MapPin className="w-4 h-4 text-[#2AB09C]" />
                <span className="text-sm">
                  {locLoading
                    ? "Locating…"
                    : locError
                    ? "Enable location"
                    : locText}
                </span>
              </button>

              {/* Mobile-only hamburger to control SubHeader */}
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={subheaderMobileOpen}
                aria-controls="mobile-accordion"
                onClick={() => setSubheaderMobileOpen((v) => !v)}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* SubHeader below header; mobile accordion is controlled by the button above */}
        <SubHeader
          currentCity={currentCity}
          mobileMenuOpen={subheaderMobileOpen}
          setMobileMenuOpen={setSubheaderMobileOpen}
        />
      </header>

      {/* Section */}
      <section className="pt-12 pb-12 sm:pb-16 lg:pt-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-y-12 lg:gap-x-16">
            {/* Left */}
            <div className="lg:col-span-7 relative z-10 max-w-2xl mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                  <span className="block">Find Your Perfect</span>
                  <span className="block mt-1 text-[#2AB09C] lg:block lg:mt-1 lg:ml-0">
                    <WordCycler
                      words={["Home", "Flat", "PG"]}
                      interval={1500}
                    />
                  </span>
                </h1>
                <p className="mt-3 text-lg text-gray-600 sm:mt-6">
                  Discover your perfect living space from thousands of verified
                  PGs, rental flats, and independent homes.
                </p>

                <div className="mt-8 sm:mt-10">
                  <div className="relative z-40 p-2 sm:border sm:border-gray-300 sm:rounded-xl bg-white overflow-visible">
                    <div className="min-w-0">
                      <SearchBar
                        onSearch={handleSearch}
                        initialLocation={initialLoc}
                        initialCoords={coords}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center lg:text-left">
                  {stats.map((s, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center lg:items-start"
                    >
                      <CountUp
                        end={s.value}
                        suffix="+"
                        className="text-3xl font-semibold text-[#2AB09C] sm:text-4xl"
                      />
                      <p className="mt-1 text-sm text-gray-700">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="w-full max-w-[520px] xl:max-w-[560px]">
                <img
                  src="/life.jpg"
                  alt="Homes and apartments"
                  className="w-full rounded-3xl shadow-xl ring-1 ring-slate-900/10 object-cover"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-[2%] right-[2%] w-[min(90%,18rem)] rounded-2xl backdrop-blur-xl bg-white/90 ring-1 ring-slate-200 shadow-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Why EasyLease
                  </h3>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2AB09C]" /> 100%
                    free - no platform fee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2AB09C]" />{" "}
                    Verified, up‑to‑date listings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2AB09C]" /> Direct
                    owner/broker contact
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
