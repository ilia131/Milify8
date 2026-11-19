export interface PanelUser {
  id: number;
  username: string;
  email: string;
  artist_id: number | null;
  artist_name: string | null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function read<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof result?.detail === "string" ? result.detail :
      result && typeof result === "object" ? Object.entries(result).map(([key, value]) =>
        `${key} — ${Array.isArray(value) ? value.join("، ") : String(value)}`).join(" · ") : "";
    throw new ApiError(response.status, detail || "درخواست انجام نشد.");
  }
  return result as T;
}

export function session(action: "login" | "logout" | "refresh" | "google", body = {}) {
  return fetch(`/api/session/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).then(read<void>);
}

let refreshPromise: Promise<void> | undefined;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const run = () => fetch(`/api/data/${path}`, { ...init, cache: "no-store" });
  let response = await run();
  if (response.status === 401) {
    refreshPromise ??= session("refresh").finally(() => { refreshPromise = undefined; });
    try {
      await refreshPromise;
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) window.dispatchEvent(new Event("milify-session-ended"));
      throw failure;
    }
    if (!init?.signal?.aborted) response = await run();
  }
  return read<T>(response);
}
