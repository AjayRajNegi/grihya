import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Search as SearchIcon } from 'lucide-react';
import PropertyCard from '../components/properties/PropertyCard';

const API_URL =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://backend.easylease.services/api';

type ApiUser = {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    role?: string | null;
};
type ApiProperty = {
    id: string | number;
    title: string;
    description: string;
    type: 'pg' | 'flat' | 'house' | 'commercial' | 'land';
    for: 'rent' | 'sale';
    price: number;
    location: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    furnishing: 'furnished' | 'semifurnished' | 'unfurnished' | null;
    amenities: string[] | null;
    images: string[] | null;
    user?: ApiUser | null;
    created_at: string;
};
type Property = {
    id: string;
    title: string;
    description: string;
    type: 'pg' | 'flat' | 'house' | 'commercial' | 'land';
    for: 'rent' | 'sale';
    price: number;
    location: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    furnishing?: 'furnished' | 'semifurnished' | 'unfurnished';
    amenities?: string[];
    images: string[];
    listedDate: string;
    owner: { name: string; phone: string; email: string };
};

const toProperty = (p: ApiProperty): Property => ({
    id: String(p.id),
    title: p.title,
    description: p.description,
    type: p.type,
    for: p.for,
    price: Number(p.price),
    location: p.location,
    bedrooms: p.bedrooms ?? undefined,
    bathrooms: p.bathrooms ?? undefined,
    area: p.area ?? undefined,
    furnishing: (p.furnishing || undefined) as Property['furnishing'],
    amenities: p.amenities ?? [],
    images: p.images ?? [],
    listedDate: p.created_at,
    owner: {
        name: p.user?.name || '',
        phone: p.user?.phone || '',
        email: p.user?.email || '',
    },
});

// Geocode text -> coords (Nominatim)
async function geocodeText(query: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            query
        )}&limit=1&accept-language=en-IN`;
        const res = await fetch(url, {
            headers: {
                // Some browsers ignore UA header; Nominatim is usually fine for light usage
                'User-Agent': 'EasyLease/1.0 (web)',
            } as any,
        });
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch { }
    return null;
}

const AgentProperties: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const page = Number(searchParams.get('page') || 1);
    const perPage = 12;

    // Read URL params
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius');
    const locationFilter = searchParams.get('location') || '';

    // Local input mirrors the location text param only
    const qInput = useMemo(() => locationFilter, [locationFilter]);
    const [q, setQ] = useState(qInput);
    useEffect(() => setQ(qInput), [qInput]);

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        let cancel = false;

        async function load() {
            setLoading(true);
            setErr(null);
            try {
                const qs = new URLSearchParams();
                qs.set('user_id', String(id)); // broker’s properties only

                const hasCoords = latStr && lngStr;
                if (hasCoords) {
                    qs.set('lat', String(latStr));
                    qs.set('lng', String(lngStr));
                    qs.set('radius', String(radiusStr || 20000)); // default 20 km
                    // Important: don't send 'location' when using coords (avoid text narrowing)
                } else if (locationFilter) {
                    qs.set('location', locationFilter);
                }

                qs.set('page', String(page));
                qs.set('per_page', String(perPage));
                const url = `${API_URL}/properties?${qs.toString()}`;

                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to load properties (${res.status})`);
                const json = await res.json();
                const items: ApiProperty[] = Array.isArray(json) ? json : json.data;
                const mapped = items.map(toProperty);
                if (!cancel) setProperties(mapped);
            } catch (e: any) {
                if (!cancel) setErr(e.message || 'Failed to load properties');
            } finally {
                if (!cancel) setLoading(false);
            }
        }

        load();
        return () => {
            cancel = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, page, locationFilter, latStr, lngStr, radiusStr]);

    // Apply: geocode q; if success, set lat/lng/radius and remove location; else fallback to text
    const applyFilter = async () => {
        const next = new URLSearchParams(searchParams);
        const typed = q.trim();

        if (!typed) {
            // If input is empty, clear both location and coords
            next.delete('location');
            next.delete('lat');
            next.delete('lng');
            next.delete('radius');
            next.set('page', '1');
            setSearchParams(next);
            return;
        }

        // Try geocoding typed location
        const coords = await geocodeText(typed);
        if (coords) {
            next.set('lat', String(coords.lat));
            next.set('lng', String(coords.lng));
            next.set('radius', '20000'); // 20 km
            // Do not keep text 'location' to avoid narrowing on the server
            next.delete('location');
        } else {
            // Fallback: text-only search if geocoding fails
            next.set('location', typed);
            // Ensure no stale coords remain
            next.delete('lat');
            next.delete('lng');
            next.delete('radius');
        }
        next.set('page', '1');
        setSearchParams(next);
    };

    // Clear: remove both text and coords filters
    const clearFilter = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('location');
        next.delete('lat');
        next.delete('lng');
        next.delete('radius');
        next.set('page', '1');
        setSearchParams(next);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-6 flex items-center gap-2">
                    <div className="mb-6 flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Go back"
                            onClick={() => navigate(-1)}
                            className="inline-flex h-9 w-9 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95 cursor-pointer"
                            title="Back"
                        >
                            <span className="text-2xl md:text-3xl font-extrabold leading-none">
                                <img src="/less_than_icon.png" alt="Back-Icon" />
                            </span>
                        </button>

                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agent’s Properties</h1>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="text-slate-700">
                        Search by location
                        <span className="ml-2 text-xs text-slate-500">
                            {latStr && lngStr ? '' : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                                placeholder="City, area or landmark"
                                className="pl-9 pr-3 py-2 rounded-md border border-slate-300 bg-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-[min(75vw,280px)]"
                            />
                        </div>
                        <button
                            onClick={applyFilter}
                            className="px-3 py-2 text-sm rounded-md bg-[#2AB09C] text-white hover:bg-emerald-700"
                        >
                            Apply
                        </button>
                        {(locationFilter || (latStr && lngStr)) && (
                            <button
                                onClick={clearFilter}
                                className="px-3 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-100"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* States */}
                {err && <div className="mb-4 rounded bg-red-50 text-red-700 p-3">{err}</div>}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="rounded-lg bg-white shadow-sm animate-pulse h-64" />
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
                        <p className="text-gray-600">Try changing the location filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((p) => (
                            <PropertyCard key={p.id} property={p} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AgentProperties;