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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

  const [allowMenu, setAllowMenu] = useState(false);

  async function geocodeText(
    query: string,
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query,
      )}&limit=1&accept-language=en-IN`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Grihya/1.0 (web)",
        } as any,
      });
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {}
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    const typed = location.trim();

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
      params.lat = String(coords.lat);
      params.lng = String(coords.lng);
      params.radius = "20000";

      if (typed) params.location = typed;
    } else {
      if (typed) {
        params.q = typed;
        params.location = typed;
      }
    }

    if (picked?.postalCode) params.pin = picked.postalCode;
    if (dealType) params.for = dealType;
    if (priceRange) params.price = priceRange.replace(/[–—]/g, "-");

    onSearch(params);
  };

  const clearLocation = () => {
    setLocation("");
    setPicked(null);
    setAllowMenu(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Property search"
      className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-0"
    >
      {/* Location */}
      <div className="relative flex flex-1 items-center px-4 py-2 md:py-0">
        <MapPinIcon className="h-5 w-5 text-slate-400" />
        <div className="ml-3 w-full">
          <LocationAutocomplete
            value={location}
            onChange={(v) => {
              setLocation(v);
              setPicked(null);
              setAllowMenu(true);
            }}
            onPick={(place) => {
              setLocation(place.label || place.formatted || "");
              setPicked(place);
              setAllowMenu(false);
            }}
            initialCoords={initialCoords}
            country="IN"
            placeholder="Search city, area or landmark"
            className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0"
            {...({
              menuOpen: allowMenu,
              onMenuOpenChange: setAllowMenu,
              openOnMount: false,
            } as any)}
            onFocus={() => setAllowMenu(true) as any}
          />
        </div>

        {location && (
          <button
            type="button"
            onClick={clearLocation}
            className="absolute right-2 rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="hidden h-10 w-px bg-gray-200 md:block" />

      {/* Rent or Sale */}
      <div className="flex items-center px-4 md:w-[180px]">
        <HomeIcon className="mr-3 h-5 w-5 text-slate-400" />
        <Select value={dealType} onValueChange={setDealType}>
          <SelectTrigger className="h-auto w-full border-0 bg-red-100 bg-transparent p-0 text-sm text-slate-700 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <SelectValue placeholder="Rent or Sale" />
          </SelectTrigger>

          <SelectContent className="w-[--radix-select-trigger-width] rounded-xl bg-white">
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="sale">Sale</SelectItem>
          </SelectContent>
        </Select>

        <ChevronDownIcon className="ml-2 h-4 w-4 text-slate-500" />
      </div>

      {/* Divider */}
      <div className="hidden h-10 w-px bg-gray-200 md:block" />

      {/* Price Range */}
      <div className="flex items-center px-4 md:w-[220px]">
        <IndianRupeeIcon className="mr-3 h-5 w-5 text-slate-400" />

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 text-sm text-slate-700 focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>

          <SelectContent className="rounded-xl bg-white">
            <SelectItem value="0-10000">Under ₹10,000</SelectItem>
            <SelectItem value="10000-25000">₹10,000 – ₹25,000</SelectItem>
            <SelectItem value="25000-50000">₹25,000 – ₹50,000</SelectItem>
            <SelectItem value="50000-100000">₹50,000 – ₹1,00,000</SelectItem>
            <SelectItem value="100000+">Above ₹1,00,000</SelectItem>
          </SelectContent>
        </Select>

        <ChevronDownIcon className="ml-2 h-4 w-4 text-slate-500" />
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="ml-auto flex h-12 w-full items-center justify-center rounded-2xl bg-[#2DB8D1] px-6 text-sm font-medium text-white transition hover:bg-[#2aaec5] sm:rounded-full md:w-auto"
      >
        <SearchIcon className="mr-2 h-5 w-5" />
        Search
      </button>
    </form>
  );
};

export default SearchBar;
