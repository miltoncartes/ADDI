"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AUTH_CHANGED_EVENT, cerrarSesion as limpiarSesion, obtenerToken, obtenerUsuario, type UsuarioSesion } from "./auth";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
  };
}

function getServerSnapshot(): UsuarioSesion | null {
  return null;
}

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  salir: () => void;
}

const AuthContext = createContext<AuthContextValue>({ usuario: null, salir: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Sincroniza con localStorage (fuente externa) sin pasar por un efecto + setState.
  const usuario = useSyncExternalStore(subscribe, obtenerUsuario, getServerSnapshot);

  useEffect(() => {
    if (!obtenerToken() && pathname !== "/login") {
      router.replace("/login");
    }
  }, [pathname, router]);

  const salir = () => {
    limpiarSesion();
    router.replace("/login");
  };

  const puedeRenderizar = usuario !== null || pathname === "/login";

  return <AuthContext.Provider value={{ usuario, salir }}>{puedeRenderizar ? children : null}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
