import { App } from "@/lib/types";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

export const OUTREACH_API = "/api/apps/outreach";
export const CASHFLOW_API = "/api/apps/cashflow";
export const NOTES_API = "/api/apps/notes";
export const TASKS_API = "/api/apps/tasks";

export function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname === "/login") return;
  const current = window.location.pathname + window.location.search;
  const isRoot = !current || current === "/" || current.startsWith("/?");
  const target = isRoot ? "/login" : `/login?next=${encodeURIComponent(current)}`;
  window.location.replace(target);
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const isPlatform = path.startsWith("/api/platform/");
  if (res.status === 401 && !isPlatform) {
    redirectToLogin();
    throw new Error("Unauthorized");
  }

  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

/* ---------- Platform & Apps auth ---------- */

export async function loginPlatform(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiFetch("/api/platform/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return { ok: res.ok, error: data.error };
}

export async function platformMe(): Promise<boolean> {
  const res = await apiFetch("/api/platform/me");
  return res.ok;
}

export async function fetchApps(): Promise<App[]> {
  const res = await apiFetch("/api/apps");
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = (await res.json()) as { apps: App[] };
  return data.apps;
}

export async function logoutPlatform(): Promise<void> {
  await apiFetch("/api/platform/logout").catch(() => {});
}