import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setToken } from "../lib/api";

type UserRole = "tenant" | "owner" | "broker" | "builder";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  city?: string;
};

type SignupPayload = {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
};

type RegisterResponse = {
  pending_verification?: boolean;
  email?: string;
  resend_url?: string;
  message?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
  refreshMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (payload: SignupPayload) => Promise<RegisterResponse>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  const refreshMe = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    try {
      setToken(token);
      const { data: me } = await api.get("/auth/me");
      setUser({
        id: String(me.id),
        name: me.name,
        email: me.email,
        phone: me.phone,
        role: (me.role || "tenant") as UserRole,
        city: me.city,
      });
    } catch {
      setToken("");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    setToken(token);
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "verified_event" && e.newValue) {
        refreshMe();
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOtp = async (phone: string) => {
    await api.post("/auth/otp/send", { phone });
  };

  const verifyOtp = async (phone: string, code: string) => {
    await api.post("/auth/otp/verify", { phone, code });
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUser({
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: (data.user.role || "tenant") as UserRole,
        city: data.user.city,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const payload = err?.response?.data;
      const e: any = new Error(payload?.message || "Login failed");
      if (status === 403 && payload?.code === "EMAIL_NOT_VERIFIED") {
        e.code = "EMAIL_NOT_VERIFIED";
        e.resend_url = payload?.resend_url;
      }
      throw e;
    }
  };

  const loginWithGoogle = async (accessToken: string) => {
    try {
      const { data } = await api.post("/auth/google", {
        access_token: accessToken,
      });
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUser({
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: (data.user.role || "tenant") as UserRole,
        city: data.user.city,
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const payload = err?.response?.data;
      const e: any = new Error(payload?.message || "Google login failed");
      if (status === 404) {
        e.code = "USER_NOT_FOUND";
        e.google = payload?.google;
      }
      if (status === 403 && payload?.code === "EMAIL_NOT_VERIFIED") {
        e.code = "EMAIL_NOT_VERIFIED";
        e.resend_url = payload?.resend_url;
      }
      throw e;
    }
  };

  const signup = async (payload: SignupPayload): Promise<RegisterResponse> => {
    try {
      const { data } = await api.post<RegisterResponse>(
        "/auth/register",
        payload
      );
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      const payloadData = err?.response?.data;
      const message = payloadData?.message || "Signup failed";
      const e: any = new Error(message);
      e.status = status;
      e.data = payloadData;
      if (/banned|blocked/i.test(message)) {
        e.code = "BANNED";
      }
      throw e;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setToken("");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      setUser,
      isAuthenticated,
      refreshMe,
      login,
      loginWithGoogle,
      logout,
      signup,
      sendOtp,
      verifyOtp,
    }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
