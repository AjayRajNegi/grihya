import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeName } from "../../utils/location";
import { Loader } from "@googlemaps/js-api-loader";
import SearchBar from "../home/SearchBar";
import { PhoneCallIcon, SmartphoneIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type PropertiesSearchProps = {
  onLocationReady?: (coords: { lat: number; lng: number } | null) => void;
};

const PropertiesSearch: React.FC<PropertiesSearchProps> = ({
  onLocationReady,
}) => {
  const navigate = useNavigate();

  const [locText, setLocText] = useState<string>("Locating…");
  const [initialLoc, setInitialLoc] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locLoading, setLocLoading] = useState<boolean>(true);
  const [locError, setLocError] = useState<string | null>(null);

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
  const sanitizeCity = (name: string) =>
    normalizeName(
      String(name || "")
        .replace(
          /\s*(district|sub[\s-]?district|tehsil|tahsil|taluk|taluka|mandal|block|sub[\s-]?division)$/i,
          "",
        )
        .replace(/\s*division$/i, "")
        .replace(/\s*metropolitan\s*(region|area)$/i, "")
        .trim(),
    );

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

  const extractMajorCityFromNominatim = (addr: any) => {
    const city =
      addr.city ||
      addr.town ||
      addr.state_district ||
      addr.county ||
      addr.state ||
      "";
    return sanitizeCity(city);
  };

  const isBadCityName = (name: string) => {
    const n = (name || "").trim().toLowerCase();
    return n === "garhwal" || n === "kumaon" || /division$/i.test(name);
  };

  const fetchNominatimCity = async (
    lat: number,
    lng: number,
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

  const looksLikeArea = (name: string) => {
    const n = (name || "").toLowerCase();
    return (
      /(?:\broad\b|\brd\b|\bmarg\b|\bchowk\b|\bmarket\b|\bbazar\b|\bsector\b|\bphase\b|\bcolony\b|\bnagar\b|\benclave\b|\bvihar\b|\blayout\b|\bextension\b|\bext\b)/i.test(
        n,
      ) || /wala$/i.test(n)
    );
  };

  const pickCityIndian = (results: any[]) => {
    const areaSet = collectAreasFromResults(results);

    // Gather candidates with a rank (lower is better)
    type Cand = { val: string; rank: number; count: number };
    const map = new Map<string, Cand>();

    const push = (val: string, rank: number) => {
      const v = sanitizeCity(val);
      if (!v) return;
      const key = v.toLowerCase();
      if (areaSet.has(key)) return;
      if (looksLikeArea(v)) return;
      if (isBadCityName(v)) return;
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
                  best.address_components || [],
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
              "",
          );
          const area = normalizeName(
            addr.road ||
              addr.suburb ||
              addr.neighbourhood ||
              addr.city_district ||
              addr.borough ||
              "",
          );
          const label =
            [area, city].filter(Boolean).join(", ") || city || "Your location";
          setLocText(label);
          setInitialLoc(label);

          const major = extractMajorCityFromNominatim(addr);
          if (major) setCurrentCity(major);
        }
      } catch {
        setLocText("Location set");
      }
    };

    let best = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
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
            { enableHighAccuracy: true, maximumAge: 0, timeout: 4000 },
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

  return (
    <section className="relative h-[550px] w-full overflow-hidden rounded-3xl px-5 sm:mx-auto sm:h-[60vh] sm:max-w-6xl">
      {/* Background image */}
      <div
        className="absolute inset-4 rounded-3xl bg-cover bg-center sm:inset-0"
        style={{
          backgroundImage: "url('/images/property/Hero.png')",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-4 rounded-3xl bg-black/20 sm:inset-0" />

      {/* Content */}
      <div className="relative top-[30%] z-10 mx-auto flex max-w-7xl -translate-y-1/2 flex-col items-center justify-center px-4 text-center sm:top-[50%] sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
          We&apos;re Here For You
        </h1>

        <p className="max-w-2xl text-base leading-tight tracking-tight text-white/90 sm:text-lg">
          We&apos;d love to have a chat with you to see how we can help you and
          your plans.
        </p>

        <Popover>
          <PopoverTrigger>
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E3E7F1] px-4 py-3 text-sm font-semibold text-black">
              <PhoneCallIcon className="text-[#35B1C6]" size={18} />
              Book a call now
            </p>
          </PopoverTrigger>
          <PopoverContent className="max-w-[240px] overflow-hidden rounded-xl text-sm font-medium">
            <div className="bg-white p-3">
              <p>
                Hello There! Feel free to react out to us regarding any query.
              </p>
              <p className="mt-3 flex items-center justify-between rounded-[10px] bg-[#E4E9F2] p-2">
                Call our front desk
                <SmartphoneIcon className="text-[#35B1C6]" size={15} />
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* Floating search bar */}
        <div className="absolute -bottom-[150%] w-full px-4 sm:px-6 md:-bottom-[70%] lg:px-8">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-xl md:rounded-full">
            <SearchBar
              onSearch={handleSearch}
              initialLocation={initialLoc}
              initialCoords={coords}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertiesSearch;
