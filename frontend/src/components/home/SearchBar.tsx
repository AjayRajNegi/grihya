import React, { useEffect, useRef, useState } from "react";
import {
  Search as SearchIcon,
  MapPin as MapPinIcon,
  Home as HomeIcon,
  IndianRupee as IndianRupeeIcon,
  ChevronDown as ChevronDownIcon,
  X as XIcon,
} from "lucide-react";
import LocationAutocomplete, {
  PickedPlace,
} from "../common/LocationAutocomplete";

interface SearchBarProps {
  onSearch: (searchParams: Record<string, string>) => void;
  initialLocation?: string;
  initialCoords?: { lat: number; lng: number } | null;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialLocation,
  initialCoords,
}) => {
  const [location, setLocation] = useState("");
  const [picked, setPicked] = useState<PickedPlace | null>(null);
  const [dealType, setDealType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  // Prefill only once (so user can clear without it popping back)
  const didAutofillRef = useRef(false);
  useEffect(() => {
    if (!didAutofillRef.current && initialLocation) {
      setLocation(initialLocation);
      setPicked({
        label: initialLocation,
        formatted: initialLocation,
        lat: initialCoords?.lat ?? 0,
        lng: initialCoords?.lng ?? 0,
        placeId: "",
      });
      didAutofillRef.current = true;
    }
  }, [initialLocation, initialCoords]);

  // Control when the suggestions menu is allowed to open
  const [allowMenu, setAllowMenu] = useState(false);

  // ADD: simple text -> coords geocoder (Nominatim fallback)
  async function geocodeText(
    query: string
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query
      )}&limit=1&accept-language=en-IN`;
      const res = await fetch(url, {
        headers: {
          // Browsers ignore User-Agent header; Nominatim still works for light usage
          "User-Agent": "EasyLease/1.0 (web)",
        } as any,
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      // swallow
    }
    return null;
  }

  // REPLACE your existing handleSubmit with this version
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    const typed = location.trim();

    // Try to get coordinates (picked place first, else geocode typed text)
    let coords: { lat: number; lng: number } | null = null;

    if (
      picked &&
      typeof picked.lat === "number" &&
      typeof picked.lng === "number" &&
      !Number.isNaN(picked.lat) &&
      !Number.isNaN(picked.lng)
    ) {
      coords = { lat: picked.lat, lng: picked.lng };
    } else if (typed) {
      coords = await geocodeText(typed);
    }

    if (coords) {
      // Nearby search around searched/picked location (20 km)
      params.lat = String(coords.lat);
      params.lng = String(coords.lng);
      params.radius = "20000"; // 20 km in meters

      // Keep typed text for UI filters only; avoid text narrowing
      if (typed) params.location = typed;
    } else {
      // Fallback: text-only search (no coords found or no text)
      if (typed) {
        params.q = typed; // backend text search
        params.location = typed; // UI hint
      }
    }

    if (picked?.postalCode) params.pin = picked.postalCode; // optional
    if (dealType) params.for = dealType;
    if (priceRange) params.price = priceRange.replace(/[–—]/g, "-"); // normalize dashes

    onSearch(params);
  };

  const clearLocation = () => {
    setLocation("");
    setPicked(null);
    // Keep menu closed after clearing until user interacts
    setAllowMenu(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      role="search"
      aria-label="Property search"
    >
      <div className="space-y-3 md:space-y-3">
        {/* Location (full width) */}
        <div className="relative z-40 overflow-visible">
          <div className="group relative flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 md:px-3 py-2 md:py-2.5 focus-within:border-[#2AB09C] focus-within:ring-1 focus-within:ring-[#2AB09C]">
            <MapPinIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
            <div className="ml-2 md:ml-2.5 flex-1 min-w-0">
              <LocationAutocomplete
                value={location}
                onChange={(v) => {
                  setLocation(v);
                  setPicked(null); // clear selection when typing
                  setAllowMenu(true); // user interaction => allow menu
                }}
                onPick={(place) => {
                  setLocation(place.label || place.formatted || "");
                  setPicked(place);
                  setAllowMenu(false); // close menu after pick (optional)
                }}
                initialCoords={initialCoords}
                country="IN"
                placeholder="Search city, area or landmark"
                className="w-full bg-transparent outline-none border-0 px-0 py-0 focus:ring-0 text-slate-700 placeholder:text-slate-400 text-sm md:text-[15px]"
                // The following props are optional; wire them inside LocationAutocomplete to fully control menu:
                {...({
                  menuOpen: allowMenu, // use this boolean to control the menu’s visibility
                  onMenuOpenChange: setAllowMenu,
                  openOnMount: false, // don’t open when value is set programmatically
                } as any)}
                // Allow menu only after focus/typing
                onFocus={() => setAllowMenu(true) as any}
              />
            </div>

            {/* Clear button */}
            {location && (
              <button
                type="button"
                onClick={clearLocation}
                className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100 text-slate-500"
                aria-label="Clear location"
                title="Clear"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Rent or Sale (native select, improved UI) */}
          <div className="md:col-span-4">
            <div className="relative">
              <HomeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <select
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
                aria-label="Deal type"
                title="Deal type"
                className="peer w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-8 py-2 md:py-2.5 text-sm md:text-[15px] text-slate-700 hover:border-[#2AB09C] focus:border-[#2AB09C] focus:ring-1 focus:ring-[#2AB09C] transition-colors md:min-w-[200px]"
              >
                <option value="">Rent or Sale</option>
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-transform peer-focus:-rotate-180" />
            </div>
          </div>

          {/* Price Range (native select, improved UI) */}
          <div className="md:col-span-5">
            <div className="relative">
              <IndianRupeeIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                aria-label="Price range"
                title="Price range"
                className="peer w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-8 py-2 md:py-2.5 text-sm md:text-[15px] text-slate-700 hover:border-[#2AB09C] focus:border-[#2AB09C] focus:ring-1 focus:ring-[#2AB09C] transition-colors md:min-w-[240px]"
              >
                <option value="">Price Range</option>
                <option value="0-10000">Under ₹10,000</option>
                <option value="10000-25000">₹10,000 - ₹25,000</option>
                <option value="25000-50000">₹25,000 - ₹50,000</option>
                <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                <option value="100000+">Above ₹1,00,000</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-transform peer-focus:-rotate-180" />
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full h-[42px] md:h-[46px] rounded-lg bg-[#2AB09C] text-white text-sm md:text-[15px] font-medium hover:bg-transparent hover:text-[#2AB09C] border border-[#2AB09C] transition-colors flex items-center justify-center"
            >
              <SearchIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
