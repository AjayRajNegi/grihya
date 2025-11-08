// src/lib/api.ts
const BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

function buildUrl(path: string): string {
  return `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildQuery(
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.append(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

class ApiError<T = any> extends Error {
  response: { status: number; data: T };
  constructor(message: string, status: number, data: T) {
    super(message);
    this.name = "ApiError";
    this.response = { status, data };
  }
}

let bearerToken: string | null = null;

export function setToken(token?: string) {
  bearerToken = token && token.length ? token : null;
}

type RequestConfig = {
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: any;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};

type ApiResponse<T = any> = {
  data: T;
  status: number;
  headers: Headers;
  raw: Response;
};

async function request<T = any>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const url = buildUrl(path) + buildQuery(config.params);
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(config.headers || {}),
  };

  if (bearerToken) {
    (headers as Record<string, string>)[
      "Authorization"
    ] = `Bearer ${bearerToken}`;
  }

  const isFormData =
    typeof FormData !== "undefined" && config.body instanceof FormData;
  const hasBody = config.body !== undefined && config.body !== null;

  if (hasBody && !isFormData && !(typeof config.body === "string")) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: config.credentials ?? "include",
    body: hasBody
      ? isFormData
        ? (config.body as BodyInit)
        : typeof config.body === "string"
        ? config.body
        : JSON.stringify(config.body)
      : undefined,
    signal: config.signal,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let errorData: any = null;
    try {
      errorData = isJson ? await res.json() : await res.text();
    } catch {
      errorData = null;
    }
    const message =
      (errorData &&
        typeof errorData === "object" &&
        "message" in errorData &&
        (errorData as any).message) ||
      res.statusText ||
      "Request failed";
    throw new ApiError(message as string, res.status, errorData);
  }

  let data: any = null;
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  return {
    data: data as T,
    status: res.status,
    headers: res.headers,
    raw: res,
  };
}

export const api = {
  get<T = any>(path: string, config?: Omit<RequestConfig, "body">) {
    return request<T>("GET", path, config);
  },
  post<T = any>(
    path: string,
    body?: any,
    config?: Omit<RequestConfig, "body">
  ) {
    return request<T>("POST", path, { ...config, body });
  },
  put<T = any>(path: string, body?: any, config?: Omit<RequestConfig, "body">) {
    return request<T>("PUT", path, { ...config, body });
  },
  patch<T = any>(
    path: string,
    body?: any,
    config?: Omit<RequestConfig, "body">
  ) {
    return request<T>("PATCH", path, { ...config, body });
  },
  delete<T = any>(path: string, config?: Omit<RequestConfig, "body">) {
    return request<T>("DELETE", path, config);
  },
};

// Convenience helpers used elsewhere in your app
export async function apiGet<T = any>(
  path: string,
  init?: RequestConfig
): Promise<T> {
  const { data } = await api.get<T>(path, init);
  return data;
}

export async function apiPost<T = any, B = unknown>(
  path: string,
  body?: B,
  init?: RequestConfig
): Promise<T> {
  const { data } = await api.post<T>(path, body, init);
  return data;
}
