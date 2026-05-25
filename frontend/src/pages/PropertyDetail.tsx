import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
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
  DumbbellIcon,
  ShieldIcon,
} from "lucide-react";
import PropertyGallery from "../components/properties/PropertyGallery";
import PropertyContactInfo from "../components/properties/PropertyContactInfo";
import type { Property as BaseProperty } from "../data/mockData";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  ElevatorIcon,
  FridgeIcon,
  GeyserIcon,
  KitchenIcon,
  LaundryIcon,
  ROIcon,
  SnowflakeIcon,
  SwimmingIcon,
} from "@/components/properties/AmenitiesIcon";
import { ScrollToTop } from "@/utils/import";
import CTASection from "@/components/home/CTASection";

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
  "http://admin.grihya.in/api";

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
  sharing_type?: string;
  food_included?: boolean | null;
  notice_period?: string;
  floor_number?: number | null;
  total_floors?: number | null;
  facing?: string;
  parking?: string;
  age_of_property?: number | null;
  property_sub_type?: string;
  parking_spaces?: number | null;
  power_backup?: boolean | null;
  washrooms?: number | null;
  pantry?: boolean | null;
  plot_type?: string;
  zoning?: string;
  frontage?: number | null;
  depth?: number | null;
  access_road?: boolean | null;
  boundary_wall?: boolean | null;
  gated_community?: boolean | null;
  rejection_reason?: string;
  status?: string | null;
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

  // Category-specific fields
  sharing_type?: string | null;
  food_included?: boolean | number | null;
  notice_period?: string | null;
  floor_number?: number | string | null;
  total_floors?: number | string | null;
  facing?: string | null;
  parking?: string | null;
  age_of_property?: number | string | null;
  property_sub_type?: string | null;
  parking_spaces?: number | string | null;
  power_backup?: boolean | number | null;
  washrooms?: number | string | null;
  pantry?: boolean | number | null;
  plot_type?: string | null;
  zoning?: string | null;
  frontage?: number | string | null;
  depth?: number | string | null;
  access_road?: boolean | number | null;
  boundary_wall?: boolean | number | null;
  gated_community?: boolean | number | null;
  rejection_reason?: string | null;

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

    // Category-specific fields
    sharing_type: p.sharing_type ?? undefined,
    food_included: asBool(p.food_included),
    notice_period: p.notice_period ?? undefined,
    floor_number: p.floor_number != null ? Number(p.floor_number) : null,
    total_floors: p.total_floors != null ? Number(p.total_floors) : null,
    facing: p.facing ?? undefined,
    parking: p.parking ?? undefined,
    age_of_property:
      p.age_of_property != null ? Number(p.age_of_property) : null,
    property_sub_type: p.property_sub_type ?? undefined,
    parking_spaces: p.parking_spaces != null ? Number(p.parking_spaces) : null,
    power_backup: asBool(p.power_backup),
    washrooms: p.washrooms != null ? Number(p.washrooms) : null,
    pantry: asBool(p.pantry),
    plot_type: p.plot_type ?? undefined,
    zoning: p.zoning ?? undefined,
    frontage: p.frontage != null ? Number(p.frontage) : null,
    depth: p.depth != null ? Number(p.depth) : null,
    access_road: asBool(p.access_road),
    boundary_wall: asBool(p.boundary_wall),
    gated_community: asBool(p.gated_community),
    rejection_reason: p.rejection_reason ?? undefined,
    status: p.status ?? null,
  };
};

const PropertyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<ViewProperty | null>(null);
  const [similar, setSimilar] = useState<ViewProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [showAreaUnits, setShowAreaUnits] = useState(false);

  const areaConversions = useMemo(() => {
    if (!property?.area) {
      return {
        sqFt: 0,
        sqM: 0,
        sqYd: 0,
        acres: 0,
        hectares: 0,
        bigha: 0,
        kanal: 0,
        marla: 0,
      };
    }

    const sqFt = Number(property.area);

    return {
      sqFt,
      sqM: sqFt * 0.09290304,
      sqYd: sqFt / 9,
      acres: sqFt / 43560,
      hectares: sqFt / 107639.104167,
      bigha: sqFt / 27225,
      kanal: sqFt / 5445,
      marla: sqFt / 272.25,
    };
  }, [property?.area]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  // Navigate to chat section in contact page
  const navigateToChat = () => {
    navigate("/contact");
    setTimeout(() => {
      const chatsection = document.getElementById("chat");
      if (chatsection) {
        chatsection.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };

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
        prev !== null ? (prev + 1) % property.images.length : 0,
      );
    }
  };

  const prevImage = () => {
    if (property && property.images && selectedImageIndex !== null) {
      setSelectedImageIndex((prev) =>
        prev !== null
          ? (prev - 1 + property.images.length) % property.images.length
          : 0,
      );
    }
  };

  if (loading) {
    return (
      <>
        <ScrollToTop />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-6 h-64 rounded-lg bg-gray-300"></div>
            <div className="mb-4 h-8 w-3/4 rounded bg-gray-300"></div>
            <div className="mb-6 h-4 w-1/2 rounded bg-gray-300"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <div className="mb-6 h-32 rounded-lg bg-gray-300"></div>
                <div className="h-64 rounded-lg bg-gray-300"></div>
              </div>
              <div className="h-64 rounded-lg bg-gray-300"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (err || !property) {
    return (
      <>
        <ScrollToTop />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {err ? "Something went wrong" : "Property Not Found"}
          </h2>
          <p className="mb-6 text-gray-600">
            {err
              ? err
              : "The property you are looking for does not exist or has been removed."}
          </p>
          <Link
            to="/properties"
            className="inline-block rounded-md bg-[#2DB8D1] px-6 py-2 text-white transition-colors hover:bg-[#229882]"
          >
            Browse Properties
          </Link>
        </div>
      </>
    );
  }

  const galleryImages = property.images?.length
    ? property.images.map((img) => img.replace("/storage/", "/public/storage/"))
    : ["https://via.placeholder.com/1200x800?text=No+Image"];

  console.log(galleryImages);

  const getAmenityIcon = (amenity: string) => {
    const a = (amenity || "").toLowerCase().trim();

    if (/\blift\b/.test(a) || /\belevator\b/.test(a)) {
      return <ElevatorIcon className="h-5 w-5 text-[#2DB8D1]" />;
    }

    switch (a) {
      case "wifi":
        return <WifiIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "parking":
        return <CarIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "tv":
        return <TvIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "ac":
        return <SnowflakeIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "gym":
        return <DumbbellIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "swimming pool":
        return <SwimmingIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "laundry":
        return <LaundryIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "security":
        return <ShieldIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "cafeteria":
        return <CoffeeIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "kitchen":
        return <KitchenIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "geyser":
      case "gyser":
        return <GeyserIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "fridge":
      case "refrigerator":
        return <FridgeIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "ro":
      case "water purifier":
      case "ro purifier":
        return <ROIcon className="h-5 w-5 text-[#2DB8D1]" />;
      case "bathroom":
        return <BathIcon className="h-5 w-5 text-[#2DB8D1]" />;
      default:
        return <CheckIcon className="h-5 w-5 text-[#2DB8D1]" />;
    }
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-4 flex w-full flex-col items-start justify-center sm:mb-8 sm:max-w-5xl sm:px-4 md:mx-auto">
            <div className="mb-4 flex w-fit items-center gap-2 rounded-full bg-[#2DB8D1] px-4 py-2 sm:mb-6">
              <span className="text-sm font-medium text-white sm:text-base">
                For {property.for === "rent" ? "Rent" : "Sale"}
              </span>
            </div>
            <h1 className="mb-1 w-full text-4xl font-medium tracking-tighter sm:mb-4 sm:w-[70%] sm:text-5xl">
              {property.title}
            </h1>
            {property.area && (
              <div className="mb-4 flex items-center">
                <div className="text-xl font-medium text-gray-600">
                  {property.area} sq.ft
                </div>
              </div>
            )}
            <div className="text-4xl font-medium text-black md:text-3xl">
              ₹{property.price.toLocaleString()}
              {property.for === "rent" ? "/month" : ""}
            </div>
          </div>

          {/* Status Banner for non-active properties */}
          {property.status && property.status !== "active" && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                property.status === "rejected"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-yellow-200 bg-yellow-50 text-yellow-700"
              }`}
            >
              {property.status === "rejected"
                ? "⚠️ This property was rejected. Please edit and resubmit for review."
                : "⏳ This property is pending admin approval and is not visible to other users."}
              {property.status === "rejected" && property.rejection_reason && (
                <div className="mt-1 text-xs">
                  Reason: {property.rejection_reason}
                </div>
              )}
            </div>
          )}

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
              <div className="relative w-full max-w-5xl">
                <img
                  src={galleryImages[selectedImageIndex]}
                  alt={`Full-screen property image ${selectedImageIndex + 1}`}
                  className="h-auto max-h-[90vh] w-full rounded-md object-contain"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/1200x800?text=No+Image";
                  }}
                />
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-4 top-4 w-[9%] rounded-full bg-white/80 p-2 text-black transition-colors hover:bg-white sm:w-[4%]"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/80 p-2 text-black transition-colors hover:bg-white"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/80 p-2 text-black transition-colors hover:bg-white"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm text-white">
                      {selectedImageIndex + 1} / {galleryImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div>
            {/* {property.description && (
              <div className="mx-auto my-6 w-fit text-3xl font-medium text-gray-700 sm:my-4 sm:text-4xl">
                {property.description}
              </div>
            )} */}
            <div className="mt-2 flex items-center text-gray-600">
              <MapPinIcon className="mr-1 h-5 w-5 flex-shrink-0 text-black sm:h-7 sm:w-7" />
              <span className="text-xl font-medium text-black sm:text-2xl">
                {property.location}
              </span>
            </div>
            {(property.display_label || property.formatted_address) && (
              <div className="mt-1 text-sm text-gray-500">
                {property.display_label || property.formatted_address}
              </div>
            )}
          </div>

          {/* Main and Sidebar */}
          <div className="px- mx-auto my-10 max-w-7xl lg:px-6">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
              <div className="space-y-10 lg:col-span-2">
                {/* Property Details */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8">
                  <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                    Property Details
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    {property.bedrooms && (
                      <div className="flex items-start gap-4">
                        <BedIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">Bedrooms</div>
                          <div className="text-lg font-medium text-gray-900">
                            {property.bedrooms}
                          </div>
                        </div>
                      </div>
                    )}

                    {property.bathrooms && (
                      <div className="flex items-start gap-4">
                        <BathIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">Bathrooms</div>
                          <div className="text-lg font-medium text-gray-900">
                            {property.bathrooms}
                          </div>
                        </div>
                      </div>
                    )}

                    {property.area && (
                      <div className="flex items-start gap-4">
                        <SquareIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div className="relative">
                          <div className="text-sm text-gray-500">Area</div>

                          <div className="flex items-center gap-2">
                            <div className="text-lg font-medium text-gray-900">
                              {property.area} sq.ft
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowAreaUnits((prev) => !prev)}
                              className="text-sm font-medium text-[#2DB8D1] hover:underline"
                            >
                              {showAreaUnits ? "Hide" : "Convert"}
                            </button>
                          </div>

                          {showAreaUnits && (
                            <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                              <div className="grid grid-cols-2 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Sq. meters:
                                  </span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {areaConversions.sqM.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Sq. yards:
                                  </span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {areaConversions.sqYd.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Acres:</span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {areaConversions.acres.toFixed(4)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Hectares:
                                  </span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {areaConversions.hectares.toFixed(4)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Bigha:</span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {areaConversions.bigha.toFixed(4)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Kanal:</span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {areaConversions.kanal.toFixed(4)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Marla:</span>{" "}
                                  <span className="font-medium text-gray-900">
                                    {areaConversions.marla.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {property.furnishing && (
                      <div className="flex items-start gap-4">
                        <HomeIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Furnishing
                          </div>
                          <div className="text-lg font-medium capitalize text-gray-900">
                            {property.furnishing}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <BuildingIcon className="h-6 w-6 text-[#2DB8D1]" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Property Type
                        </div>
                        <div className="text-lg font-medium capitalize text-gray-900">
                          {property.type === "pg"
                            ? "PG Accommodation"
                            : property.type === "flat"
                              ? "Apartment / Flat"
                              : property.type === "house"
                                ? "Independent House / Villa"
                                : property.type === "commercial"
                                  ? "Commercial Property"
                                  : "Plot / Land"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CalendarIcon className="h-6 w-6 text-[#2DB8D1]" />
                      <div>
                        <div className="text-sm text-gray-500">Listed Date</div>
                        <div className="text-lg font-medium text-gray-900">
                          {new Date(property.listedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PG-specific fields */}
                    {property.type === "pg" && property.sharing_type && (
                      <div className="flex items-start gap-4">
                        <BedIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">Sharing</div>
                          <div className="text-lg font-medium capitalize text-gray-900">
                            {property.sharing_type} Sharing
                          </div>
                        </div>
                      </div>
                    )}
                    {property.type === "pg" &&
                      property.food_included !== null &&
                      property.food_included !== undefined && (
                        <div className="flex items-start gap-4">
                          <CoffeeIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Food Included
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.food_included ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )}
                    {property.type === "pg" && property.notice_period && (
                      <div className="flex items-start gap-4">
                        <CalendarIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">
                            Notice Period
                          </div>
                          <div className="text-lg font-medium text-gray-900">
                            {property.notice_period}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Flat/House-specific fields */}
                    {["flat", "house"].includes(property.type) &&
                      property.floor_number != null && (
                        <div className="flex items-start gap-4">
                          <BuildingIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">Floor</div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.floor_number}
                              {property.total_floors
                                ? ` / ${property.total_floors}`
                                : ""}
                            </div>
                          </div>
                        </div>
                      )}
                    {["flat", "house"].includes(property.type) &&
                      property.facing && (
                        <div className="flex items-start gap-4">
                          <HomeIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">Facing</div>
                            <div className="text-lg font-medium capitalize text-gray-900">
                              {property.facing}
                            </div>
                          </div>
                        </div>
                      )}
                    {["flat", "house"].includes(property.type) &&
                      property.parking &&
                      property.parking !== "none" && (
                        <div className="flex items-start gap-4">
                          <CarIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">Parking</div>
                            <div className="text-lg font-medium capitalize text-gray-900">
                              {property.parking}
                            </div>
                          </div>
                        </div>
                      )}
                    {["flat", "house"].includes(property.type) &&
                      property.age_of_property != null && (
                        <div className="flex items-start gap-4">
                          <CalendarIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Age of Property
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.age_of_property} years
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Commercial-specific fields */}
                    {property.type === "commercial" &&
                      property.property_sub_type && (
                        <div className="flex items-start gap-4">
                          <BuildingIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Sub Type
                            </div>
                            <div className="text-lg font-medium capitalize text-gray-900">
                              {property.property_sub_type}
                            </div>
                          </div>
                        </div>
                      )}
                    {property.type === "commercial" &&
                      property.parking_spaces != null && (
                        <div className="flex items-start gap-4">
                          <CarIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Parking Spaces
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.parking_spaces}
                            </div>
                          </div>
                        </div>
                      )}
                    {property.type === "commercial" &&
                      property.power_backup !== null &&
                      property.power_backup !== undefined && (
                        <div className="flex items-start gap-4">
                          <CheckIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Power Backup
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.power_backup ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )}
                    {property.type === "commercial" &&
                      property.washrooms != null && (
                        <div className="flex items-start gap-4">
                          <BathIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Washrooms
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.washrooms}
                            </div>
                          </div>
                        </div>
                      )}
                    {property.type === "commercial" &&
                      property.pantry !== null &&
                      property.pantry !== undefined && (
                        <div className="flex items-start gap-4">
                          <KitchenIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">Pantry</div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.pantry ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Land-specific fields */}
                    {property.type === "land" && property.plot_type && (
                      <div className="flex items-start gap-4">
                        <SquareIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">Plot Type</div>
                          <div className="text-lg font-medium capitalize text-gray-900">
                            {property.plot_type}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.type === "land" && property.zoning && (
                      <div className="flex items-start gap-4">
                        <HomeIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">Zoning</div>
                          <div className="text-lg font-medium capitalize text-gray-900">
                            {property.zoning}
                          </div>
                        </div>
                      </div>
                    )}
                    {property.type === "land" && property.frontage != null && (
                      <div className="flex items-start gap-4">
                        <SquareIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">Frontage</div>
                          <div className="text-lg font-medium text-gray-900">
                            {property.frontage} ft
                          </div>
                        </div>
                      </div>
                    )}
                    {property.type === "land" && property.depth != null && (
                      <div className="flex items-start gap-4">
                        <SquareIcon className="h-6 w-6 text-[#2DB8D1]" />
                        <div>
                          <div className="text-sm text-gray-500">Depth</div>
                          <div className="text-lg font-medium text-gray-900">
                            {property.depth} ft
                          </div>
                        </div>
                      </div>
                    )}
                    {property.type === "land" &&
                      property.access_road !== null &&
                      property.access_road !== undefined && (
                        <div className="flex items-start gap-4">
                          <CheckIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Access Road
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.access_road ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )}
                    {property.type === "land" &&
                      property.boundary_wall !== null &&
                      property.boundary_wall !== undefined && (
                        <div className="flex items-start gap-4">
                          <ShieldIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Boundary Wall
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.boundary_wall ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )}
                    {property.type === "land" &&
                      property.gated_community !== null &&
                      property.gated_community !== undefined && (
                        <div className="flex items-start gap-4">
                          <ShieldIcon className="h-6 w-6 text-[#2DB8D1]" />
                          <div>
                            <div className="text-sm text-gray-500">
                              Gated Community
                            </div>
                            <div className="text-lg font-medium text-gray-900">
                              {property.gated_community ? "Yes" : "No"}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Description */}
                  <h3 className="mb-3 mt-10 text-xl font-semibold text-gray-900">
                    Description
                  </h3>
                  <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-gray-600">
                    {property.description}
                  </p>

                  {/* Amenities */}
                  {property.amenities && (
                    <>
                      <h3 className="mb-4 mt-10 text-xl font-semibold text-gray-900">
                        Amenities
                      </h3>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {property.amenities.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 rounded-lg border px-4 py-2 text-sm text-gray-700"
                          >
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Location */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8">
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    Location
                  </h2>

                  {(property.display_label || property.formatted_address) && (
                    <div className="mb-4 text-sm text-gray-500">
                      {property.display_label || property.formatted_address}
                    </div>
                  )}

                  {property.lat && property.lng ? (
                    <>
                      <div className="overflow-hidden rounded-lg border">
                        <MapContainer
                          center={[property.lat, property.lng]}
                          zoom={15}
                          style={{ height: 240, width: "100%" }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[property.lat, property.lng]} />
                        </MapContainer>
                      </div>

                      <a
                        href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm font-medium text-[#2DB8D1] hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Map not available for this listing.
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6 lg:sticky lg:top-24">
                <button
                  onClick={navigateToChat}
                  className="w-full rounded-xl bg-[#2DB8D1] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Chat with Us to get personlized properties.
                </button>
                <PropertyContactInfo
                  ownerName={property.owner.name}
                  ownerPhone={property.owner.phone}
                  ownerEmail={property.owner.email}
                />

                {/* Similar Properties */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8">
                  <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                    Similar Properties:
                  </h2>

                  <div className="">
                    {similar.map((sp) => (
                      <Link
                        key={sp.id}
                        to={`/properties/${sp.id}`}
                        className="flex w-full gap-4 rounded-xl border border-gray-100 p-3 transition hover:shadow-sm"
                      >
                        <img
                          src={
                            sp.images?.[0] || "https://via.placeholder.com/300"
                          }
                          alt={sp.title}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                        <div>
                          <h3 className="line-clamp-1 text-sm font-medium text-gray-900">
                            {sp.title}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-[#2DB8D1]">
                            ₹{sp.price.toLocaleString()}
                            {sp.for === "rent" && "/month"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CTASection />
    </>
  );
};

export default PropertyDetail;
