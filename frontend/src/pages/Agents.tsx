import React, { useEffect, useMemo, useState } from "react";
import {
  useSearchParams,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  Search as SearchIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Lock as LockIcon,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://admin.grihya.in/api";

type Agent = {
  id: number | string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  city?: string | null; // ensure backend returns city (see backend section)
};

type ApiPaginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

const Agents: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page") || 1);
  const perPage = 12;

  // Simple auth check (replace with your auth context if you have one)
  const isAuthed = useMemo(() => {
    return Boolean(
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token"),
    );
  }, []);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [q, setQ] = useState("");
  const [contacts, setContacts] = useState<
    Record<
      string,
      {
        phone?: string | null;
        email?: string | null;
        loading?: boolean;
        error?: string | null;
      }
    >
  >({});

  async function fetchContact(agentId: string | number) {
    setContacts((prev) => ({
      ...prev,
      [String(agentId)]: {
        ...(prev[String(agentId)] || {}),
        loading: true,
        error: null,
      },
    }));

    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_URL}/agents/${agentId}/contact`, {
        credentials: "include",
        headers,
      });

      if (res.status === 401) {
        setContacts((prev) => ({
          ...prev,
          [String(agentId)]: {
            ...(prev[String(agentId)] || {}),
            loading: false,
            error: "Login required",
          },
        }));
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed (${res.status})`);
      }

      const data = (await res.json()) as {
        phone?: string | null;
        email?: string | null;
      };
      setContacts((prev) => ({
        ...prev,
        [String(agentId)]: {
          phone: data.phone ?? null,
          email: data.email ?? null,
          loading: false,
          error: null,
        },
      }));
    } catch (e: any) {
      setContacts((prev) => ({
        ...prev,
        [String(agentId)]: {
          ...(prev[String(agentId)] || {}),
          loading: false,
          error: e.message || "Error",
        },
      }));
    }
  }

  useEffect(() => {
    let cancel = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const qs = new URLSearchParams();
        qs.set("per_page", String(perPage));
        qs.set("page", String(page));
        const url = `${API_URL}/agents?${qs.toString()}`;
        const token =
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          localStorage.getItem("access_token");

        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(url, {
          credentials: "include", // keep if you use Sanctum cookies
          headers,
        });
        if (!res.ok) throw new Error(`Failed to load agents (${res.status})`);
        const json = (await res.json()) as ApiPaginated<Agent>;
        if (!cancel) {
          setAgents(json.data || []);
          setTotal(json.total || 0);
          setLastPage(json.last_page || 1);
        }
      } catch (e: any) {
        if (!cancel) setErr(e.message || "Failed to load agents");
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    load();
    return () => {
      cancel = true;
    };
  }, [page]);

  const handleRevealClick = (id: string | number) => {
    if (!isAuthed) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    setReveal((r) => ({ ...r, [String(id)]: !r[String(id)] }));
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return agents;
    return agents.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(needle) ||
        (a.city || "").toLowerCase().includes(needle),
    );
  }, [agents, q]);

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className="-ml-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95"
                title="Back"
              >
                <span className="text-2xl font-extrabold leading-none md:text-3xl">
                  <img src="/less_than_icon.png" alt="Back-Icon" />
                </span>
              </button>
              <div className="">
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Property Agents
                </h1>
              </div>
            </div>
            <p className="mt-1 text-slate-600">
              Showing all brokers{total ? ` · ${total} ` : ""}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or city"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{err}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded bg-white p-6 shadow-sm">No agents found.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => {
                const show = !!reveal[String(a.id)];
                const initials = (a.name || "")
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-[#2AB09C]">
                        {initials || "BR"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-slate-900">
                          {a.name || "Broker"}
                        </div>
                        <div className="text-xs text-slate-500">Agents</div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPinIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>{a.city || "—"}</span>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {/* Contact (gated) */}
                      {!show ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (isAuthed) {
                              setReveal((r) => ({
                                ...r,
                                [String(a.id)]: true,
                              }));
                              await fetchContact(a.id);
                            }
                          }}
                          disabled={!isAuthed}
                          className={[
                            "inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm",
                            isAuthed
                              ? "border-[#2AB09C] text-emerald-700 hover:bg-emerald-50"
                              : "cursor-not-allowed border-slate-300 bg-slate-50 text-slate-500",
                          ].join(" ")}
                          title={
                            isAuthed ? "View contact details" : "Login to see"
                          }
                          aria-disabled={!isAuthed}
                        >
                          {!isAuthed && <LockIcon className="mr-1.5 h-4 w-4" />}
                          {isAuthed ? "View contact details" : "Login to see"}
                        </button>
                      ) : (
                        <div className="space-y-1.5 rounded-md border border-emerald-200 p-3 text-sm">
                          {contacts[String(a.id)]?.loading ? (
                            <div className="text-slate-600">
                              Loading contact…
                            </div>
                          ) : contacts[String(a.id)]?.error ? (
                            <div className="text-red-600">
                              {contacts[String(a.id)]?.error}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-slate-700">
                                <PhoneIcon className="h-4 w-4" />
                                <a
                                  href={
                                    contacts[String(a.id)]?.phone
                                      ? `tel:${contacts[String(a.id)]?.phone}`
                                      : "#"
                                  }
                                  className="font-medium text-[#2AB09C]"
                                >
                                  {contacts[String(a.id)]?.phone || "—"}
                                </a>
                              </div>
                              <div className="flex items-center gap-2 text-slate-700">
                                <MailIcon className="h-4 w-4" />
                                <a
                                  href={
                                    contacts[String(a.id)]?.email
                                      ? `mailto:${
                                          contacts[String(a.id)]?.email
                                        }`
                                      : "#"
                                  }
                                  className="font-medium text-[#2AB09C]"
                                >
                                  {contacts[String(a.id)]?.email || "—"}
                                </a>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* See all properties -> new page */}
                      <Link
                        to={`/agents/${a.id}/properties`}
                        className="inline-flex items-center justify-center rounded-md bg-[#2AB09C] px-3 py-2 text-sm text-white hover:bg-[#2AB09C]"
                      >
                        See all properties
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {lastPage > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>
                <span className="text-sm text-slate-700">
                  Page {page} of {lastPage} · {total} total
                </span>
                <button
                  className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-50"
                  disabled={page >= lastPage}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Agents;
