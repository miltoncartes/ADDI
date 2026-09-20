"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { RolUsuario, UsuarioSesion } from "@/lib/auth";

const ROL_LABEL: Record<RolUsuario, string> = {
  clinico: "Clínico",
  administrativo: "Administrativo",
  auditor: "Auditor",
};

const vacio = { email: "", password: "", nombre: "", rol: "clinico" as RolUsuario };

export default function UsuariosPage() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioSesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(vacio);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const data = await api.get<UsuarioSesion[]>("/auth/usuarios");
        setUsuarios(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar usuarios");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const nuevo = await api.post<UsuarioSesion>("/auth/usuarios", form);
      setUsuarios((prev) => [...prev, nuevo]);
      setForm(vacio);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear usuario");
    } finally {
      setGuardando(false);
    }
  };

  if (usuario && usuario.rol !== "administrativo") {
    return <p className="text-sm text-[var(--sonda-red)]">No tienes permisos para ver esta sección.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--sonda-ink)]">Usuarios</h1>
        <p className="text-sm text-[var(--sonda-ink-soft)]">Cuentas con acceso a ADDI y su rol.</p>
      </div>

      <form
        onSubmit={crear}
        className="grid grid-cols-1 gap-3 rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4 sm:grid-cols-2"
      >
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-md border border-[var(--sonda-border)] px-2 py-1.5 text-sm"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder="Contraseña (mínimo 8 caracteres)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-md border border-[var(--sonda-border)] px-2 py-1.5 text-sm"
        />
        <input
          required
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="rounded-md border border-[var(--sonda-border)] px-2 py-1.5 text-sm"
        />
        <select
          value={form.rol}
          onChange={(e) => setForm({ ...form, rol: e.target.value as RolUsuario })}
          className="rounded-md border border-[var(--sonda-border)] px-2 py-1.5 text-sm"
        >
          <option value="clinico">Clínico</option>
          <option value="administrativo">Administrativo</option>
          <option value="auditor">Auditor</option>
        </select>
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2 hover:bg-[var(--sonda-teal-dark)]"
        >
          {guardando ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      {error && <p className="text-sm text-[var(--sonda-red)]">{error}</p>}

      {cargando ? (
        <p className="text-sm text-[var(--sonda-ink-faint)]">Cargando...</p>
      ) : (
        <ul className="divide-y divide-[var(--sonda-border)] rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)]">
          {usuarios.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-[var(--sonda-ink)]">{u.nombre}</p>
                <p className="text-sm text-[var(--sonda-ink-soft)]">{u.email}</p>
              </div>
              <span className="rounded-full bg-[var(--sonda-teal-soft)] px-2.5 py-1 text-xs font-medium text-[var(--sonda-teal-dark)]">
                {ROL_LABEL[u.rol]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
