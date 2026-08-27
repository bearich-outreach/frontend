export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

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

  if (
    res.status === 401 &&
    !path.startsWith("/api/login") &&
    !path.startsWith("/api/me")
  ) {
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