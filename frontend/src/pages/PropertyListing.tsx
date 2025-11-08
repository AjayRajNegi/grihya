import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ListIcon, GridIcon } from "lucide-react";
import PropertyCard from "../components/properties/PropertyCard";
import PropertyFilters from "../components/properties/PropertyFilters";
import type { Property } from "../data/mockData"; // type-only import

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
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = Number(searchParams.get("page") || 1);
  const perPage = 12;
  const [total, setTotal] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);

  // Read filters (including lat/lng/radius) from URL
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

      // ADD THIS LINE
      ready_to_move: searchParams.get("ready_to_move") || "",
      listed_by: searchParams.get("listed_by") || "",
      minPrice: minPriceStr ? parseInt(minPriceStr, 10) : null,
      maxPrice: maxPriceStr ? parseInt(maxPriceStr, 10) : null,
      user_id: userIdStr || "",
      preferred_tenants: searchParams.get("preferred_tenants") || "",
      available_immediately: searchParams.get("available_immediately") || "",

      // nearby filters
      lat: latStr ? parseFloat(latStr) : null,
      lng: lngStr ? parseFloat(lngStr) : null,
      radius: radiusStr ? parseInt(radiusStr, 10) : null,
    };
  }, [searchParams]);

  // Ask for geolocation on first load if lat/lng are not present in the URL
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Map API property -> UI Property
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
            String(filters.available_immediately)
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
              new Date(a.listedDate).getTime()
          );
        } else if (sortBy === "oldest") {
          mapped.sort(
            (a, b) =>
              new Date(a.listedDate).getTime() -
              new Date(b.listedDate).getTime()
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95 cursor-pointer"
            title="Back"
          >
            <span className="text-2xl md:text-3xl font-extrabold leading-none">
              <img src="less_than_icon.png" alt="Back-Icon" />
            </span>
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {nearbyMode ? "Properties near you" : "Property Listings"}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
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
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-700">View:</span>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-[#CCF0E1FF] text-[#2AB09C]"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <GridIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md ${
                    viewMode === "list"
                      ? "bg-[#CCF0E1FF] text-[#2AB09C]"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <ListIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results count */}
            <p className="text-gray-600 mb-6">
              {loading
                ? "Loading…"
                : `${total} ${total === 1 ? "property" : "properties"} found`}
              {!loading && nearbyMode ? "" : ""}
            </p>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
                {error}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm animate-pulse h-64"
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && properties.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row"
                    >
                      <div className="sm:w-1/3 h-48 sm:h-auto">
                        <img
                          src={
                            property.images?.[0] ||
                            "https://via.placeholder.com/600x400?text=No+Image"
                          }
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 sm:p-6 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {property.location}
                        </p>
                        <p className="text-[#2AB09C] font-bold text-lg mb-2">
                          ₹{property.price.toLocaleString()}
                          {property.for === "rent" ? "/month" : ""}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {property.bedrooms && (
                            <div className="flex items-center">
                              <BedIcon className="h-4 w-4 mr-1" />
                              <span>
                                {property.bedrooms}{" "}
                                {property.bedrooms === 1 ? "Bed" : "Beds"}
                              </span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center">
                              <BathIcon className="h-4 w-4 mr-1" />
                              <span>
                                {property.bathrooms}{" "}
                                {property.bathrooms === 1 ? "Bath" : "Baths"}
                              </span>
                            </div>
                          )}
                          {property.area && (
                            <div className="flex items-center">
                              <SquareIcon className="h-4 w-4 mr-1" />
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
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Page {page} of {lastPage}
                </span>
                <button
                  disabled={page >= lastPage}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons for the list view
const BedIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4v16"></path>
    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
    <path d="M2 17h20"></path>
    <path d="M6 8v9"></path>
  </svg>
);

const BathIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
    <line x1="10" x2="8" y1="5" y2="7"></line>
    <line x1="2" x2="22" y1="12" y2="12"></line>
    <line x1="7" x2="7" y1="19" y2="21"></line>
    <line x1="17" x2="17" y1="19" y2="21"></line>
  </svg>
);

const SquareIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
  </svg>
);

export default PropertyListing;
