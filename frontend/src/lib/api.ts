import { cerrarSesion, obtenerToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = obtenerToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401 && path !== "/auth/login") {
    cerrarSesion();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      // Este módulo no es un componente (no hay useRouter aquí) y queremos además
      // descartar todo el estado en memoria de la app al expirar la sesión.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada, inicia sesión de nuevo");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error ${res.status} en ${path}: ${body}`);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
