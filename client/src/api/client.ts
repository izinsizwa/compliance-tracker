const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {}

function getToken(): string | null {
  return localStorage.getItem("compliance_tracker_token");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? "Something went wrong. Try again.");
  }

  return data as T;
}
