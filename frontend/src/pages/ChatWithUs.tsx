import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Send, ChevronRight, Phone, Mail, LogIn } from "lucide-react";

// Lazy-load Echo only if configured
let EchoCtor: any = null;
let PusherCtor: any = null;

// IMPORTANT: Your base already includes /api
const API = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  ""
).replace(/\/$/, "");
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || "";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || "ap2";
const REALTIME_ENABLED = Boolean(PUSHER_KEY);

type Msg = {
  id?: number;
  temp_id?: string;
  from: "user" | "admin";
  text: string;
  ts: number;
};
type ServerMsg = {
  id: number;
  conversation_id: number;
  sender: "user" | "admin";
  body: string;
  created_at: string;
};

const getBearer = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("token") ||
  "";

const baseHeaders = () => {
  const h: Record<string, string> = { Accept: "application/json" };
  const bearer = getBearer();
  if (bearer) h["Authorization"] = `Bearer ${bearer}`;
  return h;
};

const baseFetchInit = (init: RequestInit = {}): RequestInit => {
  // If your app uses Sanctum SPA cookie session, uncomment credentials:
  // return { ...init, headers: { ...(init.headers || {}), ...baseHeaders() }, credentials: 'include' };
  return { ...init, headers: { ...(init.headers || {}), ...baseHeaders() } };
};

const ChatWithUs: React.FC = () => {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement | null>(null);

  // Require login
  const isLoggedIn = useMemo(() => {
    return Boolean(
      localStorage.getItem("access_token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("user")
    );
  }, []);

  const [conversation, setConversation] = useState<{
    id: number;
    token: string;
  } | null>(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      temp_id: "greeting",
      from: "admin",
      text: "Hi! 👋 How can we help today? You can ask about loans, listings, or anything else.",
      ts: Date.now(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const echoRef = useRef<any>(null);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, isTyping]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const boot = async () => {
      const saved = localStorage.getItem("chat_conversation");

      if (REALTIME_ENABLED) {
        const [{ default: Echo }, { default: Pusher }] = await Promise.all([
          import("laravel-echo"),
          import("pusher-js"),
        ]);
        EchoCtor = Echo;
        PusherCtor = Pusher;
      }

      if (saved) {
        const meta = JSON.parse(saved) as { id: number; public_token: string };
        setConversation({ id: meta.id, token: meta.public_token });

        if (REALTIME_ENABLED) {
          subscribe(meta.public_token);
          await fetchMessages(meta.public_token);
        } else {
          startPolling(meta.public_token);
        }
      } else if (API) {
        const ok = await ensureConversation();
        if (ok) {
          if (REALTIME_ENABLED) subscribe(ok.public_token);
          else startPolling(ok.public_token);
        }
      }
    };

    boot();

    return () => {
      if (echoRef.current) echoRef.current.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isLoggedIn]);

  function startPolling(token: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(token), 5000);
  }

  async function fetchMessages(token: string) {
    try {
      const res = await fetch(
        `${API}/chat/conversations/${token}/messages`,
        baseFetchInit()
      );
      if (!res.ok) {
        console.warn(
          "fetchMessages failed",
          res.status,
          await safeResText(res)
        );
        return;
      }
      const data = await res.json();
      const msgs: Msg[] = (data.data as ServerMsg[]).map((m) => ({
        id: m.id,
        from: m.sender,
        text: m.body,
        ts: new Date(m.created_at).getTime(),
      }));

      // Replace current list with server list, keeping the greeting if it’s at index 0
      setMessages((prev) => {
        const base = prev.length && !prev[0].id ? [prev[0]] : [];
        return [...base, ...msgs];
      });
    } catch (e) {
      // silent
    }
  }

  function subscribe(token: string) {
    if (!REALTIME_ENABLED) return;
    (window as any).Pusher = PusherCtor;
    const echo = new EchoCtor({
      broadcaster: "pusher",
      key: PUSHER_KEY,
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });
    echoRef.current = echo;

    // Dedupe helper: try to upgrade a pending optimistic message
    const normalize = (s: string) =>
      s.replace(/\s+/g, " ").trim().toLowerCase();

    echo
      .channel(`chat.conversation.${token}`)
      .listen(".message.sent", (payload: ServerMsg) => {
        setMessages((m) => {
          // 1) Try to upgrade an optimistic message (same sender + same normalized text)
          const idx = m.findIndex(
            (x) =>
              !x.id &&
              x.temp_id &&
              x.from === payload.sender &&
              normalize(x.text) === normalize(payload.body)
          );
          if (idx !== -1) {
            const copy = m.slice();
            copy[idx] = {
              ...copy[idx],
              id: payload.id,
              ts: new Date(payload.created_at).getTime(),
            };
            return copy;
          }

          // 2) Otherwise, append only if we don’t already have this id
          if (m.some((x) => x.id === payload.id)) return m;
          return [
            ...m,
            {
              id: payload.id,
              from: payload.sender,
              text: payload.body,
              ts: new Date(payload.created_at).getTime(),
            },
          ];
        });
      });
  }

  async function ensureConversation(): Promise<{
    id: number;
    public_token: string;
  } | null> {
    try {
      const res = await fetch(
        `${API}/chat/start`,
        baseFetchInit({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      );
      if (!res.ok) {
        console.error("chat/start failed", res.status, await safeResText(res));
        return null;
      }
      const data = await res.json();
      const meta = {
        id: data.conversation.id,
        public_token: data.conversation.public_token,
      };
      localStorage.setItem("chat_conversation", JSON.stringify(meta));
      setConversation({ id: meta.id, token: meta.public_token });
      return meta;
    } catch (e) {
      console.error("ensureConversation error", e);
      return null;
    }
  }

  const send = async (preset?: string) => {
    const t = (preset ?? text).trim();
    if (!t) return;
    if (!isLoggedIn) return;

    let token = conversation?.token;
    if (!token) {
      const c = await ensureConversation();
      token = c?.public_token;
      if (!token) return;
    }

    const tempId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { temp_id: tempId, from: "user", text: t, ts: Date.now() },
    ]);
    setText("");

    // Try sending once; if 404, refresh conversation and retry once
    const trySend = async (tk: string) => {
      // IMPORTANT: include X-Socket-ID so toOthers() will exclude this client
      const socketId =
        (echoRef.current &&
          typeof echoRef.current.socketId === "function" &&
          echoRef.current.socketId()) ||
        ((window as any).Echo &&
          typeof (window as any).Echo.socketId === "function" &&
          (window as any).Echo.socketId()) ||
        undefined;

      const res = await fetch(
        `${API}/chat/conversations/${tk}/messages`,
        baseFetchInit({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(socketId ? { "X-Socket-ID": socketId } : {}),
          },
          body: JSON.stringify({ body: t, sender: "user", temp_id: tempId }),
        })
      );

      if (res.status === 404) return false;
      if (!res.ok) throw new Error(await safeResText(res));

      const data = await res.json();
      // Upgrade the optimistic message by temp_id
      setMessages((m) =>
        m.map((msg) =>
          msg.temp_id === tempId
            ? {
                id: data.message.id,
                from: "user",
                text: data.message.body,
                ts: new Date(data.message.created_at).getTime(),
              }
            : msg
        )
      );
      return true;
    };

    try {
      let ok = await trySend(token!);
      if (!ok) {
        localStorage.removeItem("chat_conversation");
        const c = await ensureConversation();
        if (!c) throw new Error("conversation start failed");
        ok = await trySend(c.public_token);
        if (!ok) throw new Error("conversation not found after refresh");
      }
    } catch (e) {
      // revert on error
      setMessages((m) => m.filter((x) => x.temp_id !== tempId));
      setText(t);
      console.error("send failed", e);
    }
  };

  const topics = [
    {
      label: "Home loan rates",
      text: "I’d like to know current home loan rates.",
    },
    {
      label: "Eligibility check",
      text: "Help me check home loan eligibility.",
    },
    {
      label: "Post my property",
      text: "How can I post my property on EasyLease?",
    },
    // { label: 'Area conversion', text: 'Convert 1200 sqft to sqm and gaj.' },
  ];

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="mb-6">
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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Chat with Us
            </h1>
          </div>
          <p className="mt-2 text-slate-600">
            Start a conversation. We typically respond within minutes during
            business hours.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Chat panel */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[560px]">
            {/* Header (agent status) */}
            <div className="border-b border-slate-200 p-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                Support
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    isLoggedIn ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {isLoggedIn ? "Online" : "Offline"}
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-4">
              {!isLoggedIn ? (
                <div className="h-full flex items-center justify-center">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <LogIn className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="font-semibold text-slate-900">
                      Please login to start chat
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      You need an account to message our support team.
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Link
                        to="/account"
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-white text-sm hover:bg-emerald-700"
                      >
                        Login
                      </Link>
                      <Link
                        to="/account"
                        className="rounded-md border border-emerald-600 px-3 py-1.5 text-emerald-700 text-sm hover:bg-emerald-50"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div
                      key={m.id ?? m.temp_id ?? i}
                      className={`mb-3 flex ${
                        m.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="max-w-[80%]">
                        <div
                          className={[
                            "rounded-2xl px-3 py-2 text-sm",
                            m.from === "user"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-900",
                          ].join(" ")}
                        >
                          {m.text}
                        </div>
                        <div
                          className={`mt-1 text-[10px] ${
                            m.from === "user"
                              ? "text-right text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {formatTime(m.ts)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="mb-3 flex justify-start">
                      <div className="rounded-2xl px-3 py-2 text-sm bg-slate-100 text-slate-900 inline-flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={
                    isLoggedIn
                      ? "Type your message..."
                      : "Login to start chatting"
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isLoggedIn) send();
                  }}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  disabled={!isLoggedIn}
                />
                <button
                  type="button"
                  onClick={() => send()}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
                  disabled={!isLoggedIn || !text.trim()}
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
              {isLoggedIn && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => send(t.text)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs hover:bg-white"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right rail */}
          {/* <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Quick links
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                <Link
                  to="/help-center"
                  className="group flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50"
                >
                  Help Center{" "}
                  <ChevronRight className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
                </Link>
                <Link
                  to="/home-loans/emi-calculator"
                  className="group flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50"
                >
                  EMI Calculator{" "}
                  <ChevronRight className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
                </Link>
                <Link
                  to="/area-converter"
                  className="group flex items-center justify-between rounded border border-slate-200 p-3 hover:bg-slate-50"
                >
                  Area Converter{" "}
                  <ChevronRight className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Contact options
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <a
                  href="mailto:support@easylease.in"
                  className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50"
                >
                  <Mail className="h-4 w-4 text-emerald-600" />{" "}
                  support@easylease.in
                </a>
                <a
                  href="tel:+918448163874"
                  className="flex items-center gap-2 rounded-md border border-slate-200 p-2 hover:bg-slate-50"
                >
                  <Phone className="h-4 w-4 text-emerald-600" /> +91 8448163874
                </a>
              </div>
            </div>
          </div> */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// helpers
async function safeResText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "(no body)";
  }
}

export default ChatWithUs;
