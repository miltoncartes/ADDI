"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Paciente, SexoPaciente } from "@/lib/types";

const vacio = {
  rut: "",
  nombres: "",
  apellidos: "",
  fechaNacimiento: "",
  sexo: "masculino" as SexoPaciente,
  telefono: "",
  email: "",
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(vacio);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    try {
      const data = await api.get<Paciente[]>("/pacientes");
      setPacientes(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar pacientes");
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial declarada dentro del efecto (no reutiliza `cargar`): así el linter de
  // React puede verificar que el efecto no dispara un setState en cadena.
  useEffect(() => {
    async function cargarInicial() {
      try {
        const data = await api.get<Paciente[]>("/pacientes");
        setPacientes(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar pacientes");
      } finally {
        setCargando(false);
      }
    }
    cargarInicial();
  }, []);

  const crearPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api.post("/pacientes", {
        ...form,
        telefono: form.telefono || undefined,
        email: form.email || undefined,
      });
      setForm(vacio);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear paciente");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Pacientes</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Registro de pacientes de la clínica.
        </p>
      </div>

      <form
        onSubmit={crearPaciente}
        className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800"
      >
        <input
          required
          placeholder="RUT (12345678-9)"
          value={form.rut}
          onChange={(e) => setForm({ ...form, rut: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          value={form.sexo}
          onChange={(e) => setForm({ ...form, sexo: e.target.value as SexoPaciente })}
          className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>
        <input
          required
          placeholder="Nombres"
          value={form.nombres}
          onChange={(e) => setForm({ ...form, nombres: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          required
          placeholder="Apellidos"
          value={form.apellidos}
          onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          required
          type="date"
          value={form.fechaNacimiento}
          onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          placeholder="Teléfono (opcional)"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          placeholder="Email (opcional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900 sm:col-span-2"
        />
        <button
          type="submit"
          disabled={guardando}
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {guardando ? "Guardando..." : "Agregar paciente"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {cargando ? (
        <p className="text-sm text-zinc-500">Cargando...</p>
      ) : pacientes.length === 0 ? (
        <p className="text-sm text-zinc-500">Aún no hay pacientes registrados.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {pacientes.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pacientes/${p.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {p.nombres} {p.apellidos}
                </span>
                <span className="text-sm text-zinc-500">{p.rut}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
