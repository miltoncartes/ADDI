"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { guardarSesion, type UsuarioSesion } from "@/lib/auth";

interface LoginResponse {
  accessToken: string;
  usuario: UsuarioSesion;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const { accessToken, usuario } = await api.post<LoginResponse>("/auth/login", { email, password });
      guardarSesion(accessToken, usuario);
      router.push("/pacientes");
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center">
      <div className="w-full max-w-sm rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--sonda-teal)]">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 stroke-white">
              <path d="M12 2c-3 0-5 2-5 5 0 4 1 6 1 9 0 3 1.5 4 2.5 4s1.8-1.5 1.8-3.5c0-1.5.7-2 .7-2s.7.5.7 2C13.7 19.5 14.5 21 15.5 21s2.5-1 2.5-4c0-3 1-5 1-9 0-3-2-5-5-5z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[var(--sonda-ink)]">ADDI</h1>
          <p className="text-sm text-[var(--sonda-ink-soft)]">Asistente Dental Digital</p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--sonda-ink-soft)]">Email</label>
            <input
              required
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-[var(--sonda-border)] px-3 py-2 text-sm outline-none focus:border-[var(--sonda-teal)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--sonda-ink-soft)]">Contraseña</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-[var(--sonda-border)] px-3 py-2 text-sm outline-none focus:border-[var(--sonda-teal)]"
            />
          </div>

          {error && <p className="text-sm text-[var(--sonda-red)]">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 rounded-md bg-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[var(--sonda-teal-dark)]"
          >
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
