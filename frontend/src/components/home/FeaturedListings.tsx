import React, { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PropertyCard from "../properties/PropertyCard";
import type { Property } from "../../data/mockData"; // type-only import

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://backend.easylease.services/api";

// API origin for absolutizing relative image paths (e.g., /storage/...)
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
const absolutize = (u?: string | null) => {
  if (!u) return "";
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(u) || u.startsWith("data:"))
    return u;
  return `${API_ORIGIN}/${u.replace(/^\/+/, "")}`;
};

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
  type: "pg" | "flat" | "house" | "commercial" | "land";
  for: "rent" | "sale";
  price: number;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  furnishing: "furnished" | "semifurnished" | "unfurnished" | null;
  amenities: string[] | null;
  images: string[] | null;
  user?: ApiUser | null;
  created_at: string;
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
  furnishing: (p.furnishing || undefined) as Property["furnishing"],
  amenities: p.amenities ?? [],
  images: (p.images ?? []).map(absolutize).filter(Boolean) as string[],
  listedDate: p.created_at,
  owner: {
    name: p.user?.name || "",
    phone: p.user?.phone || "",
    email: p.user?.email || "",
  },
});

type FeaturedListingsProps = {
  coords: { lat: number; lng: number } | null;
  radiusMeters?: number;
};

const FeaturedListings: React.FC<FeaturedListingsProps> = ({
  coords,
  radiusMeters = 10000,
}) => {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(!!coords);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadNearby() {
      if (!coords) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);
      try {
        const url = `${API_URL}/properties?lat=${coords.lat}&lng=${coords.lng}&radius=${radiusMeters}&per_page=6`;

        const res = await fetch(url);

        const json = await res.json();

        const list: ApiProperty[] = Array.isArray(json?.data) ? json.data : [];

        const mapped = list.map(toProperty);
        if (!cancelled) setItems(mapped);
      } catch (e: any) {
        console.error("[FeaturedListings] fetch error:", e);
        if (!cancelled) setErr(e.message || "Failed to load nearby properties");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNearby();
    return () => {
      cancelled = true;
    };
  }, [coords, radiusMeters]);

  const heading = coords ? "Properties near you" : "Fetching your location…";

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pb-4 flex justify-center">
          <h2 className="relative inline-block text-center text-2xl md:text-3xl font-bold text-gray-900">
            {heading}
            <span
              aria-hidden
              className="absolute left-1/2 -bottom-2 h-1 w-24 md:w-28 -translate-x-1/2 rounded-full bg-[#2AB09C]"
            />
          </h2>
        </div>

        {err && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-lg shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : !coords ? (
          <div className="text-gray-600">Waiting for location…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">
            No properties found near your location.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Centered View All at bottom */}
        <div className="mt-10 flex justify-center">
          <Link
            to={
              coords
                ? `/properties?lat=${coords.lat}&lng=${coords.lng}&radius=${radiusMeters}`
                : "/properties"
            }
            className="inline-flex items-center text-[#2AB09C] hover:text-[#1C7E70FF] font-medium"
          >
            View All
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
