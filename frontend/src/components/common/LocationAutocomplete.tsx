/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export type PickedPlace = {
  label: string;      
  formatted: string;
  lat: number;
  lng: number;
  postalCode?: string;
  city?: string;
  area?: string;
  placeId: string;
  // Extra canonical components
  route?: string;
  sublocality?: string;
  locality?: string;
  admin1?: string;
  admin2?: string;
};

type Coords = { lat: number; lng: number };

type Props = {
  value: string;
  onChange: (v: string) => void;
  onPick: (place: PickedPlace) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  initialCoords?: Coords | null;
  country?: string;
  // Controlled menu support
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  openOnMount?: boolean;
  onFocus?: () => void;
};

function getComponent(components: any[] | undefined, type: string) {
  return components?.find((c) => c.types?.includes(type))?.long_name || '';
}
function getComponentShort(components: any[] | undefined, type: string) {
  return components?.find((c) => c.types?.includes(type))?.short_name || '';
}
function collapseParts(...raw: (string | undefined)[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of raw) {
    const t = (part || '').trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.join(', ');
}
const ALIAS_MAP: Record<string, string> = {
  'general mahadev singh road': 'GMS Road',
  'gen mahadev singh road': 'GMS Road',
  'g m s road': 'GMS Road',
  'mahatma gandhi road': 'MG Road',
  'm g road': 'MG Road',
  'rajpur road': 'Rajpur Rd',
  'national highway 7': 'NH 7',
};

const LocationAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onPick,
  placeholder = 'Search address or place',
  disabled,
  className,
  error,
  initialCoords,
  country = 'IN',
  menuOpen,
  onMenuOpenChange,
  openOnMount = false,
  onFocus,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [busy, setBusy] = useState(false);

  // controlled/uncontrolled menu
  const isControlled = typeof menuOpen === 'boolean';
  const [openUnc, setOpenUnc] = useState(openOnMount);
  const open = isControlled ? (menuOpen as boolean) : openUnc;
  const setOpen = (o: boolean) => (isControlled ? onMenuOpenChange?.(o) : setOpenUnc(o));

  const [preds, setPreds] = useState<any[]>([]);
  const loader = useMemo(() => (apiKey ? new Loader({ apiKey, libraries: ['places'] }) : null), [apiKey]);
  const acSvc = useRef<any>(null);
  const placesSvc = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  // load google
  useEffect(() => {
    let mounted = true;
    if (!loader) return;
    loader
      .load()
      .then((google) => {
        if (!mounted) return;
        acSvc.current = new google.maps.places.AutocompleteService();
        placesSvc.current = new google.maps.places.PlacesService(document.createElement('div'));
        sessionRef.current = new google.maps.places.AutocompleteSessionToken();
        setReady(true);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [loader]);

  // sync external value but don't force open
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // fetch predictions (only when open == true i.e., user interaction)
  useEffect(() => {
    if (!ready || !acSvc.current) return;
    const term = query.trim();
    const t = setTimeout(() => {
      if (!open) {
        setBusy(false);
        return;
      }
      if (!term) {
        setPreds([]);
        setBusy(false);
        return;
      }
      setBusy(true);
      const req: any = {
        input: term,
        componentRestrictions: { country: country.toLowerCase() },
        sessionToken: sessionRef.current,
      };
      if (initialCoords) {
        const google: any = (window as any).google;
        const circle = new google.maps.Circle({
          center: new google.maps.LatLng(initialCoords.lat, initialCoords.lng),
          radius: 40000,
        });
        req.locationBias = circle.getBounds();
        req.origin = new google.maps.LatLng(initialCoords.lat, initialCoords.lng);
      }
      acSvc.current.getPlacePredictions(req, (res: any[]) => {
        setPreds(res || []);
        setBusy(false);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [query, ready, country, initialCoords, open]);

  const pickPrediction = (p: any) => {
    if (!placesSvc.current) return;
    const request: any = {
      placeId: p.place_id,
      sessionToken: sessionRef.current,
      fields: ['formatted_address', 'geometry', 'address_components', 'name', 'place_id', 'types'],
    };
    placesSvc.current.getDetails(request, (place: any, status: any) => {
      const google: any = (window as any).google;
      if (!place || status !== google.maps.places.PlacesServiceStatus.OK) return;

      const comps = place.address_components || [];
      const postal = getComponent(comps, 'postal_code');
      const locality =
        getComponent(comps, 'locality') ||
        getComponent(comps, 'administrative_area_level_2') ||
        getComponent(comps, 'administrative_area_level_1');
      const sublocality =
        getComponent(comps, 'sublocality') ||
        getComponent(comps, 'sublocality_level_1') ||
        getComponent(comps, 'neighborhood') ||
        getComponent(comps, 'political');

      const routeLong = getComponent(comps, 'route');
      const routeShort = getComponentShort(comps, 'route');
      const name = (place.name || '').trim();

      // Pick a primary phrase for short label
      const primaryCandidate = routeShort || routeLong || name || sublocality || locality || '';
      const norm = (s: string) => (s || '').toLowerCase().replace(/\./g, '').trim();
      const alias = ALIAS_MAP[norm(primaryCandidate)];
      const primary = alias || primaryCandidate;

      const shortLabel = collapseParts(primary, locality);

      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      const picked: PickedPlace = {
        label: shortLabel, // short & friendly
        formatted: place.formatted_address || p.description,
        lat: lat ?? 0,
        lng: lng ?? 0,
        postalCode: postal || undefined,
        city: locality || undefined,
        area: sublocality || undefined,
        placeId: place.place_id!,
        route: routeLong || routeShort || undefined,
        sublocality: sublocality || undefined,
        locality: locality || undefined,
        admin1: getComponent(comps, 'administrative_area_level_1') || undefined,
        admin2: getComponent(comps, 'administrative_area_level_2') || undefined,
      };

      onPick(picked);
      setPreds([]);
      setOpen(false);
      sessionRef.current = new (window as any).google.maps.places.AutocompleteSessionToken();
    });
  };

  if (!apiKey) {
    return (
      <div>
        <input
          type="text"
          disabled={disabled}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={
            className ||
            `w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none`
          }
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        <p className="mt-1 text-xs text-amber-600">Google API key missing. Autocomplete disabled.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        disabled={disabled}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true); // user typed => open menu
        }}
        onFocus={() => {
          onFocus?.();
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={
          className ||
          `w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#2AB09C]`
        }
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="locac-menu"
        role="combobox"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {open && (busy || preds.length > 0) && (
        <ul
          id="locac-menu"
          role="listbox"
          className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {busy && <li className="px-3 py-2 text-sm text-gray-500">Searching…</li>}
          {!busy &&
            preds.map((p, i) => (
              <li key={`${p.place_id}-${i}`}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickPrediction(p);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  title={p.description || ''}
                >
                  <div className="text-sm text-gray-900">
                    {p.structured_formatting?.main_text || p.description}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {p.structured_formatting?.secondary_text || ''}
                  </div>
                </button>
              </li>
            ))}
          {!busy && preds.length === 0 && query.trim().length >= 1 && (
            <li className="px-3 py-2 text-sm text-gray-500">No results. Try another place.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;