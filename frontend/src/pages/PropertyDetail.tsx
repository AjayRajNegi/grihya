import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  MapPinIcon,
  BedIcon,
  BathIcon,
  SquareIcon,
  CheckIcon,
  WifiIcon,
  CoffeeIcon,
  CarIcon,
  TvIcon,
  HomeIcon,
  BuildingIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Share2Icon,
  ChevronsUpDown as LiftIcon,
} from "lucide-react";
import PropertyGallery from "../components/properties/PropertyGallery";
import PropertyContactInfo from "../components/properties/PropertyContactInfo";
import type { Property as BaseProperty } from "../data/mockData";

// Keep: import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

// Robust marker icon fix for Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://grihya/api";

// Derive backend origin for absolutizing relative image paths
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Make relative URLs absolute (and allow data: URLs)
const absolutize = (u?: string | null) => {
  if (!u) return "";
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(u) || u.startsWith("data:"))
    return u; // already absolute
  return `${API_ORIGIN}/${u.replace(/^\/+/, "")}`;
};

type ApiUser = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
};

type ExtraFields = {
  display_label?: string | null;
  formatted_address?: string | null;
  lat?: number | null;
  lng?: number | null;
  available_immediately?: boolean | null;
  available_from_date?: string | null; // YYYY-MM-DD
  ready_to_move?: boolean | null;
  possession_date?: string | null; // YYYY-MM-DD
  preferred_tenants?: "family" | "bachelor" | "both" | null;
};

type ViewProperty = BaseProperty & ExtraFields;

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

  // New/geo fields from backend
  display_label?: string | null;
  formatted_address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  available_immediately?: boolean | number | null;
  available_from_date?: string | null;
  ready_to_move?: boolean | number | null;
  possession_date?: string | null;
  preferred_tenants?: "family" | "bachelor" | "both" | null;

  status?: string | null;
  user?: ApiUser | null;
  created_at: string;
};

const toProperty = (p: ApiProperty): ViewProperty => {
  const asBool = (v: any): boolean | null => {
    if (v === null || typeof v === "undefined" || v === "") return null;
    const s = String(v).toLowerCase();
    return v === true || v === 1 || s === "1" || s === "true" || s === "yes";
  };

  return {
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
    furnishing: (p.furnishing || undefined) as BaseProperty["furnishing"],
    amenities: p.amenities ?? [],
    images: (p.images ?? []).map(absolutize).filter(Boolean) as string[],
    listedDate: p.created_at,
    owner: {
      name: p.user?.name || "",
      phone: p.user?.phone || "",
      email: p.user?.email || "",
    },

    // Extra fields from backend
    display_label: p.display_label ?? null,
    formatted_address: p.formatted_address ?? null,
    lat: p.lat != null ? Number(p.lat) : null,
    lng: p.lng != null ? Number(p.lng) : null,
    available_immediately: asBool(p.available_immediately),
    available_from_date: p.available_from_date ?? null,
    ready_to_move: asBool(p.ready_to_move),
    possession_date: p.possession_date ?? null,
    preferred_tenants: (p.preferred_tenants ??
      null) as ExtraFields["preferred_tenants"],
  };
};

const PropertyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<ViewProperty | null>(null);
  const [similar, setSimilar] = useState<ViewProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // Share feedback state
  const [sharing, setSharing] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${API_URL}/properties/${id}`);
        if (!res.ok) throw new Error(`Failed to load property (${res.status})`);
        const json = (await res.json()) as ApiProperty;
        const mapped = toProperty(json);
        if (!cancelled) setProperty(mapped);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Failed to load property");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load similar properties after the main property is loaded
  useEffect(() => {
    let cancelled = false;
    async function loadSimilar() {
      if (!property) return;
      setLoadingSimilar(true);
      try {
        const qs = new URLSearchParams();
        qs.set("type", property.type);
        qs.set("per_page", "4");
        const res = await fetch(`${API_URL}/properties?${qs.toString()}`);
        if (!res.ok)
          throw new Error(`Failed to load similar properties (${res.status})`);
        const json = await res.json();
        const items: ApiProperty[] = Array.isArray(json) ? json : json.data;
        const mapped = items
          .map(toProperty)
          .filter((p) => p.id !== property.id)
          .slice(0, 3);
        if (!cancelled) setSimilar(mapped);
      } catch (e) {
        // ignore similar errors silently
      } finally {
        if (!cancelled) setLoadingSimilar(false);
      }
    }
    loadSimilar();
    return () => {
      cancelled = true;
    };
  }, [property]);

  const handleImageClick = (image: string) => {
    if (property && property.images) {
      const index = property.images.indexOf(image);
      if (index !== -1) {
        setSelectedImageIndex(index);
      }
    }
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (property && property.images && selectedImageIndex !== null) {
      setSelectedImageIndex((prev) =>
        prev !== null ? (prev + 1) % property.images.length : 0
      );
    }
  };

  const prevImage = () => {
    if (property && property.images && selectedImageIndex !== null) {
      setSelectedImageIndex((prev) =>
        prev !== null
          ? (prev - 1 + property.images.length) % property.images.length
          : 0
      );
    }
  };

  // Add these helpers near the top of the component (before handleShare)
  function isMobileUA() {
    if (typeof navigator === "undefined") return false;
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  }
  function canUseNativeShare(shareData?: ShareData) {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return false;
    const secure = window.isSecureContext;
    const hasShare = "share" in navigator;

    const canShare =
      typeof navigator.canShare === "function"
        ? navigator.canShare(shareData || {})
        : true;
    return secure && hasShare && isMobileUA() && canShare;
  }

  async function copyToClipboard(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }

  // Replace your handleShare with this version
  async function handleShare() {
    if (!property) return;

    const url = window.location.href;
    const title = property.title;
    const text = `Check this property on EasyLease: ${property.title} • ${
      property.location
    } • ₹${property.price.toLocaleString()}${
      property.for === "rent" ? "/month" : ""
    }`;

    // Try native share ONLY on supported mobile + https
    // Some UAs only accept url; try minimal data first.
    try {
      const minimalData: ShareData = { url };
      if (canUseNativeShare(minimalData)) {
        setSharing(true);

        await navigator.share(minimalData);
        setSharing(false);
        return;
      }
    } catch {
      // fall through to next attempt
      setSharing(false);
    }

    // Try full data on mobile if first attempt didn’t run
    try {
      const fullData: ShareData = { title, text, url };
      if (canUseNativeShare(fullData)) {
        setSharing(true);

        await navigator.share(fullData);
        setSharing(false);
        return;
      }
    } catch {
      setSharing(false);
    }

    // Fallbacks:
    // 1) WhatsApp Web (works on desktop/mobile) – opens a new tab with prefilled text
    try {
      const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
      window.open(wa, "_blank", "noopener,noreferrer");
      return;
    } catch {
      // ignore and try copy
    }

    const ok = await copyToClipboard(url);
    setShareNotice(
      ok
        ? "Link copied to clipboard"
        : "Unable to share. Copy the link manually."
    );
    window.setTimeout(() => setShareNotice(null), ok ? 2000 : 2500);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-32 bg-gray-300 rounded-lg mb-6"></div>
              <div className="h-64 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="h-64 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (err || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {err ? "Something went wrong" : "Property Not Found"}
        </h2>
        <p className="text-gray-600 mb-6">
          {err
            ? err
            : "The property you are looking for does not exist or has been removed."}
        </p>
        <Link
          to="/properties"
          className="inline-block px-6 py-2 rounded-md text-white bg-[#2AB09C] hover:bg-[#229882] transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  const galleryImages = property.images?.length
    ? property.images
    : ["https://via.placeholder.com/1200x800?text=No+Image"];

  // Amenity icon map
  const getAmenityIcon = (amenity: string) => {
    const a = (amenity || "").toLowerCase().trim();

    // Handle synonyms and loose matches first (covers e.g., "lift available")
    if (/\blift\b/.test(a) || /\belevator\b/.test(a)) {
      return <ElevatorIcon className="h-5 w-5 text-[#2AB09C]" />;
    }

    switch (a) {
      case "wifi":
        return <WifiIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "parking":
        return <CarIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "tv":
        return <TvIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "ac":
        return <SnowflakeIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "gym":
        return <DumbbellIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "swimming pool":
        return <SwimmingIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "laundry":
        return <LaundryIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "security":
        return <ShieldIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "cafeteria":
        return <CoffeeIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "kitchen":
        return <KitchenIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "geyser":
      case "gyser":
        return <GeyserIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "fridge":
      case "refrigerator":
        return <FridgeIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "ro":
      case "water purifier":
      case "ro purifier":
        return <ROIcon className="h-5 w-5 text-[#2AB09C]" />;
      case "bathroom":
        return <BathIcon className="h-5 w-5 text-[#2AB09C]" />;
      default:
        return <CheckIcon className="h-5 w-5 text-[#2AB09C]" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-gray-600">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="inline-flex h-5 w-5 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95 cursor-pointer"
            title="Back"
          >
            <span className="text-2xl md:text-3xl font-extrabold leading-none">
              <img src="/less_than_icon.png" alt="Back-Icon" />
            </span>
          </button>
          <Link to="/" className="hover:text-[#2AB09C]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/properties" className="hover:text-[#2AB09C]">
            Properties
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{property.title}</span>
        </nav>

        {/* Gallery */}
        <PropertyGallery
          images={galleryImages}
          title={property.title}
          onImageClick={handleImageClick}
        />

        {/* Full-screen Image Modal */}
        {selectedImageIndex !== null && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80"
            onClick={closeModal}
          >
            <div className="relative max-w-5xl w-full">
              <img
                src={galleryImages[selectedImageIndex]}
                alt={`Full-screen property image ${selectedImageIndex + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/1200x800?text=No+Image";
                }}
              />
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white/80 text-black rounded-full p-2 hover:bg-white transition-colors w-[9%] sm:w-[4%]"
                aria-label="Close full-screen image"
              >
                ✕
              </button>
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-black rounded-full p-2 hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-black rounded-full p-2 hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Title & Pricing + Share */}
        <div className="mt-6 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500 text-white">
                  For {property.for === "rent" ? "Rent" : "Sale"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {property.title}
              </h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
              {(property.display_label || property.formatted_address) && (
                <div className="mt-1 text-sm text-gray-500">
                  {property.display_label || property.formatted_address}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-gray-600 text-sm">
                {/* {property.for === 'rent' ? 'Rent' : 'Price'} */}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[#2AB09C]">
                ₹{property.price.toLocaleString()}
                {property.for === "rent" ? "/month" : ""}
              </div>

              {/* Share button + feedback */}
              <div className="mt-3 flex items-center justify-start gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#2AB09C] text-[#2AB09C] rounded-md hover:bg-[#E6F7F3] disabled:opacity-60 transition"
                  aria-label="Share this property"
                  title="Share this property"
                >
                  <Share2Icon className="h-4 w-4" />
                  Share
                </button>
                <div></div>
              </div>
              {shareNotice && (
                <div className="text-xs text-gray-600 mt-1">{shareNotice}</div>
              )}
            </div>
          </div>
        </div>

        {/* Main and sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <BedIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                      <div className="font-medium">{property.bedrooms}</div>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <BathIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                      <div className="font-medium">{property.bathrooms}</div>
                    </div>
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center">
                    <SquareIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Area</div>
                      <div className="font-medium">{property.area} sq.ft</div>
                    </div>
                  </div>
                )}
                {property.furnishing && (
                  <div className="flex items-center">
                    <HomeIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Furnishing</div>
                      <div className="font-medium capitalize">
                        {property.furnishing}
                      </div>
                    </div>
                  </div>
                )}
                {/* Availability / Readiness */}
                {property.for === "rent" && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Immediately Available
                      </div>
                      <div className="font-medium">
                        {property.available_immediately == null
                          ? "—"
                          : property.available_immediately
                          ? "Yes"
                          : "No"}
                        {!property.available_immediately &&
                        property.available_from_date
                          ? ` ( From ${new Date(
                              property.available_from_date
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })} )`
                          : ""}
                      </div>
                    </div>
                  </div>
                )}

                {property.for === "sale" && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Ready to Move</div>
                      <div className="font-medium">
                        {property.ready_to_move == null
                          ? "—"
                          : property.ready_to_move
                          ? "Yes"
                          : "No"}
                        {!property.ready_to_move && property.possession_date
                          ? ` ( From ${new Date(
                              property.possession_date
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })} )`
                          : ""}
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferred Tenants (same visibility rule as form) */}
                {property.for === "rent" &&
                  (property.type === "pg" ||
                    property.type === "flat" ||
                    property.type === "house") && (
                    <div className="flex items-center">
                      <HomeIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">
                          Preferred Tenants
                        </div>
                        <div className="font-medium capitalize">
                          {property.preferred_tenants
                            ? property.preferred_tenants === "both"
                              ? "Both (Family and Bachelor)"
                              : property.preferred_tenants
                            : "—"}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="flex items-center">
                  <BuildingIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Property Type</div>
                    <div className="font-medium capitalize">
                      {property.type === "pg"
                        ? "PG Accommodation"
                        : property.type === "flat"
                        ? "Apartment/Flat"
                        : property.type === "house"
                        ? "Independent House/Villa"
                        : property.type === "commercial"
                        ? "Commercial Property"
                        : "Plot/Land"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-[#2AB09C] mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Listed Date</div>
                    <div className="font-medium">
                      {new Date(property.listedDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-line">
                {property.description}
              </p>

              {property.amenities && property.amenities.length > 0 && (
                <>
                  <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        {getAmenityIcon(amenity)}
                        <span className="ml-2">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              {property.lat != null && property.lng != null ? (
                <>
                  {(property.display_label || property.formatted_address) && (
                    <div className="text-sm text-gray-600 mb-3">
                      {property.display_label || property.formatted_address}
                    </div>
                  )}
                  <div className="rounded overflow-hidden border">
                    <MapContainer
                      center={[property.lat!, property.lng!]}
                      zoom={15}
                      style={{ height: 240, width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[property.lat!, property.lng!]} />
                    </MapContainer>
                  </div>
                  <div className="mt-2 text-sm">
                    <a
                      href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2AB09C] hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-gray-600 text-sm">
                  Map not available for this listing. Address:{" "}
                  {property.display_label ||
                    property.formatted_address ||
                    property.location}
                </div>
              )}
            </div>

            {/* Similar properties */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Similar Properties</h2>
              {loadingSimilar && (
                <div className="text-gray-500 text-sm">Loading…</div>
              )}
              {!loadingSimilar && similar.length === 0 && (
                <div className="text-gray-500 text-sm">
                  No similar properties found.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similar.map((sp) => (
                  <Link
                    key={sp.id}
                    to={`/properties/${sp.id}`}
                    className="flex bg-gray-50 rounded-md overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={
                          sp.images?.[0] ||
                          "https://via.placeholder.com/300x300?text=No+Image"
                        }
                        alt={sp.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x300?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                        {sp.title}
                      </h3>
                      <p className="text-[#2AB09C] font-medium text-sm">
                        ₹{sp.price.toLocaleString()}
                        {sp.for === "rent" ? "/month" : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <PropertyContactInfo
              ownerName={property.owner.name}
              ownerPhone={property.owner.phone}
              ownerEmail={property.owner.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Additional icons for amenities (custom)
const SnowflakeIcon = ({ className }: { className?: string }) => (
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
    <path d="M12 2v20M4.93 4.93l14.14 14.14M20 12H4M19.07 4.93 4.93 19.07"></path>
  </svg>
);
const DumbbellIcon = ({ className }: { className?: string }) => (
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
    <path d="m6.5 6.5 11 11"></path>
    <path d="m21 21-1-1"></path>
    <path d="m3 3 1 1"></path>
    <path d="m18 22 4-4"></path>
    <path d="m2 6 4-4"></path>
    <path d="m3 10 7-7"></path>
    <path d="m14 21 7-7"></path>
  </svg>
);
const SwimmingIcon = ({ className }: { className?: string }) => (
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
    <path d="M4 11 3 9a5.73 5.73 0 0 1 8-3"></path>
    <path d="M14 10 9 5l1-1 5 5"></path>
    <path d="M7 21a4.73 4.73 0 0 1-3-7"></path>
    <path d="M3 16c0 2.72 2 5 5.5 5s5.5-2.28 5.5-5c0-2.72-2-5-5.5-5S3 13.28 3 16z"></path>
  </svg>
);
const LaundryIcon = ({ className }: { className?: string }) => (
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
    <rect width="18" height="20" x="3" y="2" rx="2"></rect>
    <circle cx="12" cy="14" r="4"></circle>
    <circle cx="8" cy="6" r="1"></circle>
    <circle cx="16" cy="6" r="1"></circle>
  </svg>
);
const ShieldIcon = ({ className }: { className?: string }) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
  </svg>
);

const KitchenIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Simple fork and spoon */}
    <path d="M6 3v7" />
    <path d="M4 3v7" />
    <path d="M8 3v7" />
    <path d="M6 10v11" />
    <circle cx="14" cy="6" r="2" />
    <path d="M14 8v13" />
  </svg>
);

const GeyserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Vertical tank */}
    <rect x="7" y="2" width="10" height="16" rx="2" />
    {/* Indicator light */}
    <circle cx="12" cy="8" r="1" />
    {/* Hot water drop */}
    <path d="M12 18c2 0 3-1.5 3-3 0-1.2-.8-2.4-3-4-2.2 1.6-3 2.8-3 4 0 1.5 1 3 3 3z" />
  </svg>
);

const FridgeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="9" y1="7" x2="9" y2="9" />
    <line x1="9" y1="15" x2="9" y2="17" />
  </svg>
);

const ROIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {/* Water droplet */}
    <path d="M12 3C9 6 7 9 7 12a5 5 0 0 0 10 0c0-3-2-6-5-9z" />
    {/* Filter housing */}
    <rect x="5" y="14.5" width="14" height="3" rx="1.5" />
  </svg>
);

const ElevatorIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Elevator frame */}
    <rect x="4" y="3" width="16" height="18" rx="2" />
    {/* Up arrow */}
    <path d="M12 6v6" />
    <path d="M9 9l3-3 3 3" />
    {/* Down arrow */}
    <path d="M12 12v6" />
    <path d="M15 15l-3 3-3-3" />
  </svg>
);

export default PropertyDetail;
