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

// useSyncExternalStore exige que getSnapshot devuelva la MISMA referencia mientras los datos
// no cambien; JSON.parse crea un objeto nuevo en cada llamada y provocaba un bucle infinito
// de renders justo después de iniciar sesión. Se cachea según el texto guardado.
let usuarioRawCache: string | null = null;
let usuarioCache: UsuarioSesion | null = null;

export function obtenerUsuario(): UsuarioSesion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (raw !== usuarioRawCache) {
      usuarioRawCache = raw;
      usuarioCache = raw ? (JSON.parse(raw) as UsuarioSesion) : null;
    }
    return usuarioCache;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  notificarCambio();
}
