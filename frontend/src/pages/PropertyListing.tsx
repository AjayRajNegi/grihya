import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/properties/PropertyCard";
import PropertyFilters from "../components/properties/PropertyFilters";
import type { Property } from "../data/mockData";
import PropertiesSearch from "@/components/properties/PropertiesSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BathIcon,
  BedIcon,
  SquareIcon,
} from "@/components/properties/AmenitiesIcon";
import CTASection from "@/components/home/CTASection";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://grihya/api";

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
  status?: string | null;
  user?: ApiUser | null;
  created_at: string;
};

type ApiPaginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

const PropertyListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = Number(searchParams.get("page") || 1);
  const perPage = 12;
  const [total, setTotal] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);

  const filters = useMemo(() => {
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const radiusStr = searchParams.get("radius");
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const userIdStr = searchParams.get("user_id");
    return {
      q: searchParams.get("q") || "",
      location: searchParams.get("location") || "",
      type: searchParams.get("type") || "",
      for: searchParams.get("for") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      bathrooms: searchParams.get("bathrooms") || "",
      priceRange: (searchParams.get("price") || "").replace(/[–—]/g, "-"),
      furnishing: searchParams.get("furnishing") || "",
      amenities: searchParams.getAll("amenities") || [],

      ready_to_move: searchParams.get("ready_to_move") || "",
      listed_by: searchParams.get("listed_by") || "",
      minPrice: minPriceStr ? parseInt(minPriceStr, 10) : null,
      maxPrice: maxPriceStr ? parseInt(maxPriceStr, 10) : null,
      user_id: userIdStr || "",
      preferred_tenants: searchParams.get("preferred_tenants") || "",
      available_immediately: searchParams.get("available_immediately") || "",

      lat: latStr ? parseFloat(latStr) : null,
      lng: lngStr ? parseFloat(lngStr) : null,
      radius: radiusStr ? parseInt(radiusStr, 10) : null,
    };
  }, [searchParams]);

  useEffect(() => {
    const hasLat = searchParams.get("lat");
    const hasLng = searchParams.get("lng");
    const hasTextQuery = searchParams.get("q") || searchParams.get("location");
    if (hasLat && hasLng) return;
    if (hasTextQuery) return;

    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      ["localhost", "127.0.0.1"].includes(location.hostname);

    if (!isSecure || !("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const params = new URLSearchParams(searchParams);
        params.set("lat", String(latitude));
        params.set("lng", String(longitude));
        if (!params.get("radius")) params.set("radius", "20000"); // 20 km default
        params.set("page", "1");
        setSearchParams(params);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

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
    images: p.images ?? [],
    listedDate: p.created_at,
    owner: {
      name: p.user?.name || "",
      phone: p.user?.phone || "",
      email: p.user?.email || "",
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProperties() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();

        // Nearby filters
        if (filters.lat != null && filters.lng != null) {
          qs.set("lat", String(filters.lat));
          qs.set("lng", String(filters.lng));
          if (filters.radius) qs.set("radius", String(filters.radius));
        }

        const hasCoords = filters.lat != null && filters.lng != null;

        // Only send text filters if we're NOT in nearby mode
        if (!hasCoords && filters.q) qs.set("q", filters.q);

        // Only send location text in text-mode
        if (!hasCoords && filters.location)
          qs.set("location", filters.location);

        // Filters
        if (filters.type) qs.set("type", filters.type);
        if (filters.for) qs.set("for", filters.for);
        if (filters.bedrooms) qs.set("bedrooms", filters.bedrooms);
        if (filters.bathrooms) qs.set("bathrooms", filters.bathrooms);
        if (filters.ready_to_move)
          qs.set("ready_to_move", String(filters.ready_to_move));
        if (filters.listed_by) qs.set("listed_by", filters.listed_by);
        if (filters.user_id) qs.set("user_id", String(filters.user_id));
        if (filters.preferred_tenants)
          qs.set("preferred_tenants", filters.preferred_tenants);
        if (filters.available_immediately)
          qs.set(
            "available_immediately",
            String(filters.available_immediately),
          );

        // Price
        if (filters.priceRange) {
          const normalized = filters.priceRange.replace(/[–—]/g, "-");
          qs.set("price", normalized);
          if (normalized.includes("-")) {
            const [min, max] = normalized
              .split("-")
              .map((n) => parseInt(n, 10));
            if (!Number.isNaN(min)) qs.set("minPrice", String(min));
            if (!Number.isNaN(max)) qs.set("maxPrice", String(max));
          } else if (normalized.endsWith("+")) {
            const min = parseInt(normalized, 10);
            if (!Number.isNaN(min)) qs.set("minPrice", String(min));
          }
        } else {
          // ADD: forward explicit minPrice/maxPrice if present
          if (filters.minPrice != null)
            qs.set("minPrice", String(filters.minPrice));
          if (filters.maxPrice != null)
            qs.set("maxPrice", String(filters.maxPrice));
        }

        if (filters.furnishing) qs.set("furnishing", filters.furnishing);
        if (filters.amenities?.length) {
          filters.amenities.forEach((a) => qs.append("amenities[]", a));
        }

        // Sorting and pagination
        if (sortBy) qs.set("sortBy", sortBy);
        qs.set("page", String(page));
        qs.set("per_page", String(perPage));

        const url = `${API_URL}/properties?${qs.toString()}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok)
          throw new Error(`Failed to load properties (${res.status})`);

        const json = (await res.json()) as
          | ApiPaginated<ApiProperty>
          | ApiProperty[];
        const items: ApiProperty[] = Array.isArray(json) ? json : json.data;

        let mapped = items.map(toProperty);

        // Client-side fallback for "4+" / "3+"
        if (filters.bedrooms === "4+")
          mapped = mapped.filter((p) => (p.bedrooms ?? 0) >= 4);
        if (filters.bathrooms === "3+")
          mapped = mapped.filter((p) => (p.bathrooms ?? 0) >= 3);

        // Client-side fallback sorting
        if (sortBy === "newest") {
          mapped.sort(
            (a, b) =>
              new Date(b.listedDate).getTime() -
              new Date(a.listedDate).getTime(),
          );
        } else if (sortBy === "oldest") {
          mapped.sort(
            (a, b) =>
              new Date(a.listedDate).getTime() -
              new Date(b.listedDate).getTime(),
          );
        } else if (sortBy === "priceLowToHigh") {
          mapped.sort((a, b) => a.price - b.price);
        } else if (sortBy === "priceHighToLow") {
          mapped.sort((a, b) => b.price - a.price);
        }

        setProperties(mapped);
        if (Array.isArray(json)) {
          setTotal(mapped.length);
          setLastPage(1);
        } else {
          setTotal(json.total);
          setLastPage(json.last_page);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
    return () => controller.abort();
  }, [filters, sortBy, page]);

  // Preserve lat/lng/radius across filter changes unless the user changes the location text
  const handleFilterChange = (f: any) => {
    const params: Record<string, string | string[]> = {};
    if (f.location) params.location = f.location;
    if (f.type) params.type = f.type;
    if (f.for) params.for = f.for;
    if (f.bedrooms) params.bedrooms = f.bedrooms;
    if (f.bathrooms) params.bathrooms = f.bathrooms;
    if (f.priceRange) params.price = String(f.priceRange).replace(/[–—]/g, "-");
    if (f.furnishing) params.furnishing = f.furnishing;
    if (Array.isArray(f.amenities) && f.amenities.length)
      params.amenities = f.amenities;

    const current = Object.fromEntries(searchParams.entries());
    const sameLocation = (f.location || "") === (current.location || "");

    if (sameLocation) {
      if (current.lat) params.lat = current.lat;
      if (current.lng) params.lng = current.lng;
      if (current.radius) params.radius = current.radius;
    }

    if (!(params as any).for && current.for) (params as any).for = current.for;
    if (!(params as any).type && current.type)
      (params as any).type = current.type;

    if (current.ready_to_move)
      (params as any).ready_to_move = current.ready_to_move;
    if (current.listed_by) (params as any).listed_by = current.listed_by;
    if ((current as any).minPrice)
      (params as any).minPrice = (current as any).minPrice;
    if ((current as any).maxPrice)
      (params as any).maxPrice = (current as any).maxPrice;
    if ((current as any).user_id)
      (params as any).user_id = (current as any).user_id;
    if ((current as any).preferred_tenants)
      (params as any).preferred_tenants = (current as any).preferred_tenants;
    if ((current as any).available_immediately)
      (params as any).available_immediately = (
        current as any
      ).available_immediately;

    (params as any).page = "1";
    setSearchParams(params as any);
  };

  const setPage = (p: number) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, page: String(p) });
  };

  const nearbyMode = filters.lat != null && filters.lng != null;

  return (
    <div className="min-h-screen bg-white">
      <PropertiesSearch />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Filters sidebar */}
          <div className="md:w-1/4">
            <PropertyFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          {/* Main content */}
          <div className="md:w-3/4">
            {/* Sort and view controls */}
            <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Sort by:
                </span>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>

                  <SelectContent className="rounded-xl bg-white/80">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="priceLowToHigh">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="priceHighToLow">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <p className="mb-6 text-gray-600">
              {loading
                ? "Loading…"
                : `${total} ${total === 1 ? "property" : "properties"} found`}
              {!loading && nearbyMode ? "" : ""}
            </p>

            {/* Error state */}
            {error && (
              <div className="mb-6 rounded bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    : "space-y-6"
                }
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-lg bg-white shadow-sm"
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && properties.length === 0 && (
              <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  No properties found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}

            {/* Property cards */}
            {!loading &&
              properties.length > 0 &&
              (viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm sm:flex-row"
                    >
                      <div className="h-48 sm:h-auto sm:w-1/3">
                        <img
                          src={
                            property.images?.[0] ||
                            "https://via.placeholder.com/600x400?text=No+Image"
                          }
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 sm:p-6">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          {property.title}
                        </h3>
                        <p className="mb-2 text-gray-600">
                          {property.location}
                        </p>
                        <p className="mb-2 text-lg font-bold text-[#35B1C6]">
                          ₹{property.price.toLocaleString()}
                          {property.for === "rent" ? "/month" : ""}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {property.bedrooms && (
                            <div className="flex items-center">
                              <BedIcon className="mr-1 h-4 w-4" />
                              <span>
                                {property.bedrooms}{" "}
                                {property.bedrooms === 1 ? "Bed" : "Beds"}
                              </span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center">
                              <BathIcon className="mr-1 h-4 w-4" />
                              <span>
                                {property.bathrooms}{" "}
                                {property.bathrooms === 1 ? "Bath" : "Baths"}
                              </span>
                            </div>
                          )}
                          {property.area && (
                            <div className="flex items-center">
                              <SquareIcon className="mr-1 h-4 w-4" />
                              <span>{property.area} sq.ft</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

            {/* Simple pagination */}
            {!loading && lastPage > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Page {page} of {lastPage}
                </span>
                <button
                  disabled={page >= lastPage}
                  onClick={() => setPage(page + 1)}
                  className="rounded border px-3 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <CTASection />
    </div>
  );
};

export default PropertyListing;
