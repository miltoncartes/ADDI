export type RolUsuario = "clinico" | "administrativo" | "auditor";

export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

const TOKEN_KEY = "addi_token";
const USUARIO_KEY = "addi_usuario";
/** Evento propio (localStorage no dispara "storage" en la misma pestaña que escribe). */
export const AUTH_CHANGED_EVENT = "addi-auth-changed";

function notificarCambio() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function guardarSesion(accessToken: string, usuario: UsuarioSesion) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  notificarCambio();
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function obtenerUsuario(): UsuarioSesion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? (JSON.parse(raw) as UsuarioSesion) : null;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  notificarCambio();
}
