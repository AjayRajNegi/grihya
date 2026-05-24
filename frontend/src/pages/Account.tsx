import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginModal";
import SignupForm from "../components/auth/SignupModal";
import { useAuth } from "../context/AuthContext";
import {
  Building2 as BuildingIcon,
  Edit3 as EditIcon,
  Save as SaveIcon,
  X as XIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Eye as EyeIcon,
  LogOut as LogOutIcon,
  Trash2 as TrashIcon,
  MoreVertical as MoreIcon,
} from "lucide-react";
import { Listbox } from "@headlessui/react";
import ReactCountryFlag from "react-country-flag";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, Variants } from "framer-motion";
import { ScrollToTop } from "@/utils/import";

type CountryOpt = { code: string; label: string; dial: string; flag: string };

const COUNTRY_OPTIONS: CountryOpt[] = [
  { code: "IN", label: "India", dial: "+91", flag: "🇮🇳" },
];

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://admin.grihya.in/api";

const absolutize = (url: string) => {
  if (!url) return "";
  if (url.includes("/public/storage/")) return url;
  if (url.includes("/storage/")) {
    return url.replace("/storage/", "/public/storage/");
  }
  return url;
};

type ApiProperty = {
  id: string | number;
  title: string;
  type: "pg" | "flat" | "house" | "commercial" | "land";
  for: "rent" | "sale";
  price: number;
  location: string;
  images?: string[] | null;
  status?: "pending" | "active" | "rejected" | null;
  created_at: string;
};

type ApiPaginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type Role = "tenant" | "owner" | "broker" | "builder";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const Account: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const { isAuthenticated, user, logout } = auth;
  const setUser = auth?.setUser as ((u: any) => void) | undefined;

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneLocal: "",
    city: user?.city || "",
  });
  const [country, setCountry] = useState<CountryOpt>(COUNTRY_OPTIONS[0]);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
  }>({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Listings
  const [myProps, setMyProps] = useState<ApiProperty[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propsError, setPropsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [lastPage, setLastPage] = useState(1);
  const [totalListings, setTotalListings] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Delete modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [listMessage, setListMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id?: string | number;
    title?: string;
  }>({ open: false });
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "rejected"
  >("all");

  const role = (user?.role || "tenant").toLowerCase();
  const isLister = role === "owner" || role === "broker" || role === "builder";

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const digits = (s: string) => s.replace(/\D/g, "");

  function splitE164ToCountryAndLocal(p: string) {
    const raw = (p || "").trim();
    if (!raw) return { c: COUNTRY_OPTIONS[0], local: "" };
    for (const opt of COUNTRY_OPTIONS) {
      if (raw.startsWith(opt.dial)) {
        return { c: opt, local: digits(raw.slice(opt.dial.length)) };
      }
    }
    const fallback = COUNTRY_OPTIONS[0];
    const withoutPlus = raw.startsWith("+") ? raw.slice(1) : raw;
    return { c: fallback, local: digits(withoutPlus) };
  }

  useEffect(() => {
    if (user) {
      const { c, local } = splitE164ToCountryAndLocal(user.phone || "");
      setCountry(c);
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phoneLocal: local,
        city: user.city || "",
      });
      setFieldErrors({});
    }
  }, [user]);

  const fullPhone = useMemo(
    () => `${country.dial}${digits(profile.phoneLocal)}`,
    [country, profile.phoneLocal],
  );

  const needsCity = !user?.city || !String(user.city).trim();

  const hasChanges = useMemo(() => {
    if (!user) return false;
    const currentFull = (user.phone || "").trim();
    return (
      (profile.name || "") !== (user.name || "") ||
      (profile.email || "") !== (user.email || "") ||
      fullPhone !== currentFull ||
      (profile.city || "") !== (user.city || "")
    );
  }, [profile, fullPhone, user]);

  useEffect(() => {
    if (statusFilter !== "all" && page !== 1) setPage(1);
  }, [statusFilter]);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!editingProfile || !user) return;
    const emailTrim = profile.email.trim();
    if (!emailTrim || emailTrim === (user.email || "")) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
      setEmailChecking(false);
      return;
    }
    if (!isValidEmail(emailTrim)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
      setEmailChecking(false);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setEmailChecking(true);
        const res = await fetch(
          `${API_URL}/auth/available?email=${encodeURIComponent(
            emailTrim,
          )}&exclude=${encodeURIComponent(String(user.id))}`,
          { signal: controller.signal },
        );
        const json = await res.json().catch(() => null);
        if (json && json.available === false) {
          setFieldErrors((prev) => ({
            ...prev,
            email: "This email is already in use.",
          }));
        } else {
          setFieldErrors((prev) => ({ ...prev, email: undefined }));
        }
      } catch {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Unable to check email availability. Please try again.",
        }));
      } finally {
        setEmailChecking(false);
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [editingProfile, profile.email, user]);

  useEffect(() => {
    if (!editingProfile || !user) return;

    const d = digits(profile.phoneLocal);
    if (d) {
      if (!/^[6-9]\d{9}$/.test(d)) {
        setFieldErrors((prev) => ({
          ...prev,
          phone: "Enter a valid 10-digit mobile number.",
        }));
        return;
      } else {
        setFieldErrors((prev) => ({ ...prev, phone: undefined }));
      }
    }

    if (!d) {
      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setPhoneChecking(true);
        const res = await fetch(
          `${API_URL}/auth/available?phone=${encodeURIComponent(
            fullPhone,
          )}&exclude=${encodeURIComponent(String(user.id))}`,
          { signal: controller.signal },
        );
        const json = await res.json().catch(() => null);
        if (json && json.available === false) {
          setFieldErrors((prev) => ({
            ...prev,
            phone: "This phone number is already in use.",
          }));
        } else {
          setFieldErrors((prev) => ({ ...prev, phone: undefined }));
        }
      } catch {
        setFieldErrors((prev) => ({
          ...prev,
          phone: "Unable to check phone number availability. Please try again.",
        }));
      } finally {
        setPhoneChecking(false);
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [editingProfile, fullPhone, profile.phoneLocal, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || !isLister) return;

    let cancelled = false;
    async function loadMyProps() {
      setLoadingProps(true);
      setPropsError(null);
      const authToken =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";

      try {
        const qs = new URLSearchParams({
          page: String(page),
          per_page: String(perPage),
        });
        if (statusFilter !== "all") {
          qs.set("status", statusFilter);
        }

        const res = await fetch(`${API_URL}/my/properties?${qs.toString()}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });

        if (res.status === 204) {
          if (!cancelled) {
            setMyProps([]);
            setLastPage(1);
            setTotalListings(0);
          }
          return;
        }

        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setMyProps([]);
              setLastPage(1);
              setTotalListings(0);
            }
            return;
          }
          if (res.status === 401) {
            if (!cancelled)
              setPropsError("Your session expired. Please sign in again.");
            return;
          }
          if (res.status === 429)
            throw new Error(
              "You’ve tried too many times. Please wait a moment and try again.",
            );
          throw new Error("Unable to load your properties.");
        }

        const json = (await res.json()) as
          | ApiPaginated<ApiProperty>
          | ApiProperty[];
        const items: ApiProperty[] = Array.isArray(json)
          ? json
          : (json.data ?? []);

        if (!cancelled) {
          setMyProps(items);
          setLastPage(Array.isArray(json) ? 1 : (json.last_page ?? 1));
          setTotalListings(
            Array.isArray(json) ? items.length : (json.total ?? items.length),
          );
        }
      } catch (e: any) {
        if (!cancelled)
          setPropsError(
            e.message || "Unable to load your properties. Please try again.",
          );
      } finally {
        if (!cancelled) setLoadingProps(false);
      }
    }

    loadMyProps();
    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    isLister,
    page,
    perPage,
    user,
    statusFilter,
    refreshKey,
  ]);

  const handleProfileSave = async () => {
    setProfileError(null);
    setProfileMessage(null);
    setFieldErrors({});
    if (!user) {
      setProfileError("No user logged in. Please sign in again.");
      return;
    }

    if (emailChecking || phoneChecking) {
      setProfileError("Please wait while we check your details.");
      return;
    }
    if (
      fieldErrors.email ||
      fieldErrors.phone ||
      fieldErrors.name ||
      fieldErrors.city
    ) {
      setProfileError("Please fix the errors in the fields above.");
      return;
    }

    const nameTrim = (profile.name || "").trim();
    const emailTrim = (profile.email || "").trim();
    const fullPhoneTrim = fullPhone.trim();
    const cityTrim = (profile.city || "").trim();

    if (cityTrim.length > 100) {
      setFieldErrors((prev) => ({
        ...prev,
        city: "City must be at most 100 characters.",
      }));
      return;
    }

    const payload: Record<string, string> = {};
    if (nameTrim !== (user.name || "")) payload.name = nameTrim;
    if (emailTrim !== (user.email || "")) payload.email = emailTrim;
    if (fullPhoneTrim !== (user.phone || "").trim())
      payload.phone = fullPhoneTrim;
    if (cityTrim !== (user.city || "")) payload.city = cityTrim;

    if (Object.keys(payload).length === 0) {
      setEditingProfile(false);
      return;
    }

    const authToken =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    if (!authToken) {
      setProfileError("Your session has expired. Please sign in again.");
      return;
    }

    if (payload.phone) {
      const localDigits = digits(profile.phoneLocal);
      if (localDigits && !/^[6-9]\d{9}$/.test(localDigits)) {
        setFieldErrors((prev) => ({
          ...prev,
          phone: "Enter a valid 10-digit mobile number.",
        }));
        return;
      }
    }

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 429)
          throw new Error(
            "You’ve tried too many times. Please wait a moment and try again.",
          );
        throw new Error(data?.message || "Unable to save your changes.");
      }

      if (data?.pending_email_change) {
        const verifyData = { email: data.email, resendUrl: data.resend_url };
        sessionStorage.setItem("verifyEmail", JSON.stringify(verifyData));
        setEditingProfile(false);
        navigate("/verify-email?kind=email_change", { state: verifyData });
        return;
      }

      setProfileMessage("Your profile has been updated.");
      setEditingProfile(false);

      if (setUser) {
        setUser({
          id: String(data.id),
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: (data.role || user.role) as Role,
          city: data.city,
        });
      }

      const { c, local } = splitE164ToCountryAndLocal(data.phone || "");
      setCountry(c);
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phoneLocal: local,
        city: data.city || "",
      });
    } catch (e: any) {
      setProfileError(
        e.message || "Unable to save your changes. Please try again.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSetStatus = async (
    propId: string | number,
    next: "active" | "pending",
  ) => {
    setPropsError(null);
    setListMessage(null);

    const idStr = String(propId);
    const authToken =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    if (!authToken) {
      setPropsError("Your session has expired. Please sign in again.");
      return;
    }

    try {
      setStatusSavingId(idStr);

      const res = await fetch(`${API_URL}/properties/${propId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: next }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 429)
          throw new Error(
            "You’ve tried too many times. Please wait a moment and try again.",
          );
        throw new Error(data?.message || "Unable to update the status.");
      }

      const updatedStatus: "active" | "pending" =
        data?.status === "active" ? "active" : "pending";

      setMyProps((prev) =>
        prev.map((p) =>
          String(p.id) === idStr ? { ...p, status: updatedStatus } : p,
        ),
      );
      const message = `Status updated to ${
        updatedStatus === "active" ? "Active" : "Inactive"
      }.`;
      setListMessage(message);

      setTimeout(() => {
        setListMessage(null);
      }, 5000);
    } catch (e: any) {
      setPropsError(
        e.message || "Unable to update the status. Please try again.",
      );
    } finally {
      setStatusSavingId(null);
      setMenuOpenId(null);
    }
  };

  const handleDelete = async (propId: string | number) => {
    setPropsError(null);
    setListMessage(null);
    const idStr = String(propId);

    try {
      setDeletingId(idStr);
      const authToken =
        localStorage.getItem("token") || sessionStorage.getItem("token") || "";

      const res = await fetch(`${API_URL}/properties/${propId}`, {
        method: "DELETE",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (!res.ok) {
        if (res.status === 429)
          throw new Error(
            "You’ve tried too many times. Please wait a moment and try again.",
          );
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Unable to delete the property.");
      }

      setMyProps((prev) => prev.filter((p) => String(p.id) !== idStr));
      setTotalListings((t) => Math.max(0, t - 1));
      setListMessage("Property deleted successfully.");
      if (myProps.length === 1 && page > 1) setPage(page - 1);
    } catch (e: any) {
      setPropsError(
        e.message || "Unable to delete the property. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteConfirm = (prop: ApiProperty) =>
    setConfirmDialog({ open: true, id: prop.id, title: prop.title });
  const closeDeleteConfirm = () => setConfirmDialog({ open: false });
  const confirmDelete = async () => {
    if (!confirmDialog.id) return;
    await handleDelete(confirmDialog.id);
    closeDeleteConfirm();
  };

  if (isAuthenticated && user) {
    const initialLetter = (user.name || user.email || "U")
      .toString()
      .trim()
      .charAt(0)
      .toUpperCase();
    const roleLabel =
      role === "owner"
        ? "Owner"
        : role === "broker"
          ? "Broker"
          : role === "builder"
            ? "Builder"
            : "Tenant";

    return (
      <>
        <ScrollToTop />
        <Navbar />
        <main className="bg-white">
          <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 md:pb-8 lg:px-8">
            {/* User Name Header */}
            <div className="mb-5 text-center text-3xl font-medium tracking-tighter md:text-5xl">
              Welcome back, {user.name}
            </div>
            <div className="relative rounded-2xl border border-gray-300 bg-white shadow-sm">
              {/* subtle brand header */}
              <div className="h-24 rounded-t-2xl bg-gradient-to-r from-[#c7f3f3] to-[#F0FBF9]" />

              <div className="relative -mt-12 px-6 pb-6 md:px-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                  {/* LEFT */}
                  <div className="flex gap-5">
                    {/* Avatar */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white ring-4 ring-[#c7f3f3] md:h-20 md:w-20">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c7f3f3] text-2xl font-bold text-[#2DB8D1] md:h-16 md:w-16">
                        {initialLetter}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold text-gray-900">
                          {user.name || "User"}
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#E6F7F3] px-3 py-1 text-xs font-semibold text-[#2DB8D1]">
                          <BuildingIcon className="h-3.5 w-3.5" />
                          {roleLabel}
                        </span>
                      </div>

                      {/* VIEW MODE */}
                      {!editingProfile ? (
                        <div className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                            <MailIcon className="h-4 w-4 text-gray-400" />
                            <span>{user.email || " - "}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span>{user.phone || " - "}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                            <MapPinIcon className="h-4 w-4 text-gray-400" />
                            <span>{user.city || " - "}</span>
                          </div>

                          {needsCity && (
                            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 sm:col-span-2">
                              <span>
                                Please enter your city to complete your profile.
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProfile(true);
                                  setProfileMessage(null);
                                  setProfileError(null);
                                }}
                                className="font-medium underline"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-5 rounded-xl bg-gray-50 p-4">
                          <div>
                            <label className="mb-1 block text-sm text-gray-600">
                              Name
                            </label>
                            <input
                              className={`w-full rounded border px-3 py-2 focus:border-[#2DB8D1] focus:ring-[#2DB8D1] ${
                                fieldErrors.name
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              value={profile.name}
                              onChange={(e) => {
                                setProfile({
                                  ...profile,
                                  name: e.target.value,
                                });
                                if (fieldErrors.name)
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    name: undefined,
                                  }));
                              }}
                            />
                            {fieldErrors.name && (
                              <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-1 block text-sm text-gray-600">
                              Email
                            </label>
                            <input
                              type="email"
                              className={`w-full rounded border px-3 py-2 focus:border-[#2DB8D1] focus:ring-[#2DB8D1] ${
                                fieldErrors.email
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              value={profile.email}
                              onChange={(e) => {
                                setProfile({
                                  ...profile,
                                  email: e.target.value,
                                });
                                if (fieldErrors.email)
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    email: undefined,
                                  }));
                              }}
                            />
                            {emailChecking && !fieldErrors.email && (
                              <p className="mt-1 text-xs text-gray-500">
                                Checking…
                              </p>
                            )}
                            {fieldErrors.email && (
                              <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.email}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-1 block text-sm text-gray-600">
                              City
                            </label>
                            <input
                              className={`w-full rounded border px-3 py-2 focus:border-[#2DB8D1] focus:ring-[#2DB8D1] ${
                                fieldErrors.city
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              value={profile.city}
                              onChange={(e) => {
                                setProfile({
                                  ...profile,
                                  city: e.target.value,
                                });
                                if (fieldErrors.city)
                                  setFieldErrors((prev) => ({
                                    ...prev,
                                    city: undefined,
                                  }));
                              }}
                              placeholder="e.g., Dehradun"
                            />
                            {fieldErrors.city && (
                              <p className="mt-1 text-xs text-red-600">
                                {fieldErrors.city}
                              </p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm text-gray-600">
                              Mobile number
                            </label>

                            {/* Responsive container */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto,1fr]">
                              {/* Country selector */}
                              <div>
                                <Listbox
                                  value={country}
                                  onChange={(c) => {
                                    setCountry(c);
                                    if (fieldErrors.phone)
                                      setFieldErrors((prev) => ({
                                        ...prev,
                                        phone: undefined,
                                      }));
                                  }}
                                >
                                  <div className="relative w-full sm:w-28">
                                    <Listbox.Button className="relative w-full cursor-default rounded-[8px] border border-gray-300 bg-white py-2 pl-9 pr-7 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#2DB8D1]">
                                      <span className="absolute inset-y-0 left-2 flex items-center">
                                        <ReactCountryFlag
                                          svg
                                          countryCode={country.code}
                                          style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 2,
                                          }}
                                        />
                                      </span>
                                      <span className="block truncate">
                                        {country.code}
                                      </span>
                                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          className="text-gray-500"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </span>
                                    </Listbox.Button>

                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[8px] border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none">
                                      {COUNTRY_OPTIONS.map((c) => (
                                        <Listbox.Option
                                          key={c.code}
                                          value={c}
                                          className={({ active }) =>
                                            `relative cursor-pointer select-none py-2 pl-8 pr-2 ${
                                              active ? "bg-gray-100" : ""
                                            }`
                                          }
                                        >
                                          <span className="absolute inset-y-0 left-2 flex items-center">
                                            <ReactCountryFlag
                                              svg
                                              countryCode={c.code}
                                              style={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: 2,
                                              }}
                                            />
                                          </span>
                                          <span className="truncate">
                                            {c.dial} – {c.label}
                                          </span>
                                        </Listbox.Option>
                                      ))}
                                    </Listbox.Options>
                                  </div>
                                </Listbox>
                              </div>

                              {/* Phone input */}
                              <div className="flex">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-700">
                                  {country.dial}
                                </span>
                                <input
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel"
                                  maxLength={country.code === "IN" ? 10 : 15}
                                  value={profile.phoneLocal}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    const limited =
                                      country.code === "IN"
                                        ? raw.slice(0, 10)
                                        : raw.slice(0, 15);
                                    setProfile({
                                      ...profile,
                                      phoneLocal: limited,
                                    });
                                    if (fieldErrors.phone)
                                      setFieldErrors((prev) => ({
                                        ...prev,
                                        phone: undefined,
                                      }));
                                  }}
                                  className={`w-full rounded-r-md border px-3 py-2 outline-none focus:ring-2 focus:ring-[#2DB8D1] ${
                                    fieldErrors.phone
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="9xxxxxxxxx"
                                />
                              </div>
                            </div>

                            {/* Helper / error */}
                            <div className="mt-1 text-xs">
                              {phoneChecking && !fieldErrors.phone && (
                                <span className="text-gray-500">Checking…</span>
                              )}
                              {fieldErrors.phone && (
                                <p className="text-red-600">
                                  {fieldErrors.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Messages */}
                      {profileMessage && !editingProfile && (
                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                          {profileMessage}
                        </div>
                      )}
                      {profileError && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {profileError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3">
                    {!editingProfile ? (
                      <>
                        <button
                          onClick={() => {
                            setEditingProfile(true);
                            setProfileMessage(null);
                            setProfileError(null);
                            setFieldErrors({});
                          }}
                          className="inline-flex items-center gap-2 rounded-[8px] border border-[#2DB8D1] px-4 py-2 text-sm font-medium text-[#2DB8D1] hover:bg-[#E6F7F3]"
                        >
                          <EditIcon className="h-4 w-4" /> Edit Profile
                        </button>
                        <button
                          onClick={logout}
                          className="inline-flex items-center gap-2 rounded-[8px] bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                        >
                          <LogOutIcon className="h-4 w-4" /> Sign out
                        </button>
                        <p
                          onClick={() => navigate("/reset-password-confirm")}
                          className="inline-flex text-xs text-[#2DB8D1] hover:text-[#2391a5]"
                        >
                          Reset Password
                        </p>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleProfileSave}
                          disabled={savingProfile || !hasChanges}
                          className="inline-flex items-center gap-2 rounded-[8px] bg-[#2DB8D1] px-5 py-2 text-sm font-medium text-white hover:bg-[#229882] disabled:opacity-60"
                        >
                          <SaveIcon className="h-4 w-4" />
                          {savingProfile ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingProfile(false);
                            setProfileError(null);
                            setFieldErrors({});
                            const { c, local } = splitE164ToCountryAndLocal(
                              user?.phone || "",
                            );
                            setCountry(c);
                            setProfile({
                              name: user?.name || "",
                              email: user?.email || "",
                              phoneLocal: local,
                              city: user?.city || "",
                            });
                          }}
                          className="inline-flex items-center gap-2 rounded-[8px] border px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <XIcon className="h-4 w-4" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* LISTER METRICS */}
                {isLister && (
                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">
                        Total Properties
                      </div>
                      <div className="mt-1 text-3xl font-semibold text-gray-900">
                        {totalListings}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-gray-50 p-4">
                      <div className="text-sm text-gray-500">Account Role</div>
                      <div className="mt-1 text-xl font-semibold text-[#2DB8D1]">
                        {roleLabel}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-gradient-to-r from-[#2DB8D1] to-[#3EC9B0] p-4 text-white">
                      <div className="text-sm opacity-90">Quick Action</div>
                      <Link
                        to="/list-property"
                        className="mt-2 inline-block rounded-[8px] bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
                      >
                        + Add New Property
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isLister && (
              <section className="mt-10">
                {/* Header */}
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Your Listings
                  </h2>

                  {/* Status Filter */}
                  <div className="inline-flex w-fit rounded-[8px] border bg-white p-1 shadow-sm">
                    {["all", "active", "inactive", "rejected"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s as any)}
                        aria-pressed={statusFilter === s}
                        className={`rounded-[8px] px-4 py-1.5 text-sm font-medium transition ${
                          statusFilter === s
                            ? "bg-[#2DB8D1] text-white shadow"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info note */}
                <div className="mb-5 flex items-start gap-2 rounded-[8px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-blue-400 bg-white font-bold">
                    !
                  </span>
                  <p>
                    Mark the status to Active or Inactive. Only Active
                    properties are showed to users.
                  </p>
                </div>

                {/* Main Card */}
                <div className="rounded-xl border bg-white p-5 shadow-sm md:p-6">
                  {listMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
                      {listMessage}
                    </div>
                  )}

                  {propsError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {propsError}
                    </div>
                  )}

                  {/* Loading */}
                  {loadingProps ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-44 animate-pulse rounded-xl bg-gray-100"
                        />
                      ))}
                    </div>
                  ) : myProps.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">
                      {statusFilter === "all"
                        ? "You haven’t listed any properties yet."
                        : "No properties found for the selected filter."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {myProps.map((p) => {
                        const img =
                          absolutize(p.images?.[0] || "") ||
                          "https://via.placeholder.com/600x400?text=No+Image";
                        console.log(img);
                        const ts = new Date(p.created_at);
                        const isDeleting = deletingId === String(p.id);

                        return (
                          <div
                            key={String(p.id)}
                            className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                          >
                            {/* Image */}
                            <div className="relative h-36 w-full overflow-hidden">
                              {p.status != null && (
                                <span
                                  className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold shadow ${
                                    p.status === "active"
                                      ? "bg-green-600 text-white"
                                      : p.status === "rejected"
                                        ? "bg-red-600 text-white"
                                        : "bg-yellow-500 text-white"
                                  }`}
                                >
                                  {p.status === "active"
                                    ? "Active"
                                    : p.status === "rejected"
                                      ? "Rejected"
                                      : "Pending Review"}
                                </span>
                              )}

                              <img
                                src={img}
                                alt={p.title}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/600x400?text=No+Image";
                                }}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col p-4">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-1 font-semibold text-gray-900">
                                  {p.title}
                                </h3>

                                {/* Menu */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setMenuOpenId((cur) =>
                                        cur === String(p.id)
                                          ? null
                                          : String(p.id),
                                      );
                                    }}
                                    className="rounded-[8px] p-1.5 text-gray-500 hover:bg-gray-100"
                                  >
                                    <MoreIcon className="h-4 w-4" />
                                  </button>

                                  {menuOpenId === String(p.id) && (
                                    <div
                                      className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-[8px] border bg-white shadow-lg"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {p.status === "rejected" ? (
                                        <div className="px-3 py-2 text-xs text-red-600">
                                          This property was rejected. Please
                                          edit and resubmit.
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            type="button"
                                            disabled={
                                              statusSavingId === String(p.id) ||
                                              p.status === "active"
                                            }
                                            onClick={() =>
                                              handleSetStatus(p.id, "active")
                                            }
                                            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-60"
                                          >
                                            Active
                                          </button>
                                          <button
                                            type="button"
                                            disabled={
                                              statusSavingId === String(p.id) ||
                                              p.status === "pending" ||
                                              p.status === null
                                            }
                                            onClick={() =>
                                              handleSetStatus(p.id, "pending")
                                            }
                                            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-60"
                                          >
                                            Inactive
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="mt-1 font-bold text-[#2DB8D1]">
                                ₹{Number(p.price).toLocaleString()}
                                {p.for === "rent" ? "/month" : ""}
                              </div>

                              <div className="mt-1 flex items-center text-xs text-gray-600">
                                <MapPinIcon className="mr-1 h-4 w-4" />
                                {p.location}
                              </div>

                              {/* Actions */}
                              <div className="mt-4 flex flex-wrap gap-2">
                                <Link
                                  to={`/properties/${p.id}`}
                                  className="inline-flex items-center gap-1 rounded-[8px] border px-3 py-1.5 text-sm hover:bg-gray-50"
                                >
                                  <EyeIcon className="h-4 w-4" /> View
                                </Link>

                                <Link
                                  to={`/properties/${p.id}/edit`}
                                  className="inline-flex items-center gap-1 rounded-[8px] border border-[#2DB8D1] px-3 py-1.5 text-sm text-[#2DB8D1] hover:bg-[#E6F7F3]"
                                >
                                  <EditIcon className="h-4 w-4" /> Edit
                                </Link>

                                <button
                                  onClick={() => openDeleteConfirm(p)}
                                  disabled={isDeleting}
                                  className="inline-flex items-center gap-1 rounded-[8px] border border-red-500 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  {isDeleting ? "Deleting…" : "Delete"}
                                </button>
                              </div>

                              <div className="mt-2 text-xs text-gray-400">
                                Listed on {ts.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {!loadingProps && lastPage > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="rounded-[8px] border px-4 py-1.5 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {page} of {lastPage}
                      </span>
                      <button
                        disabled={page >= lastPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-[8px] border px-4 py-1.5 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
        <Footer />

        {/* Delete confirmation modal */}
        {confirmDialog.open && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40"
              aria-hidden="true"
              onClick={closeDeleteConfirm}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-title"
                className="w-full max-w-md rounded-xl bg-white shadow-xl"
              >
                <div className="flex items-center justify-between px-4 pt-3">
                  <h3
                    id="confirm-delete-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Delete Property
                  </h3>
                  <button
                    onClick={closeDeleteConfirm}
                    className="rounded p-1 hover:bg-gray-100"
                    aria-label="Close"
                  >
                    <XIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="px-4 py-4 text-gray-700">
                  Are you sure you want to delete
                  {confirmDialog.title ? (
                    <>
                      “
                      <span className="font-semibold">
                        {confirmDialog.title}
                      </span>
                      ”
                    </>
                  ) : (
                    " this property"
                  )}
                  ? This action cannot be undone.
                </div>
                <div className="flex justify-end gap-2 px-4 pb-3">
                  <button
                    onClick={closeDeleteConfirm}
                    className="rounded-[8px] border px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deletingId === String(confirmDialog.id)}
                    className="rounded-[8px] bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {deletingId === String(confirmDialog.id)
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto mb-8"
          >
            <h1 className="text-center text-4xl font-medium tracking-tighter text-gray-900 md:text-5xl">
              Sign Up and Explore <br /> properties from
              <span className="text-[#2DB8D1]"> Grihya</span>
            </h1>
          </motion.div>
          {/* Tabs */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setMode("login")}
              className={`rounded-[8px] px-4 py-2 ${
                mode === "login"
                  ? "bg-[#2DB8D1] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`rounded-[8px] px-4 py-2 ${
                mode === "signup"
                  ? "bg-[#2DB8D1] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Sign up
            </button>
          </div>

          {mode === "login" ? (
            <>
              <div>
                <div className="mx-auto max-w-[500px] rounded-3xl border bg-white p-6 shadow-md sm:p-8">
                  <LoginForm onSwitch={() => setMode("signup")} />
                </div>
              </div>
            </>
          ) : (
            <SignupForm onSwitch={() => setMode("login")} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Account;
