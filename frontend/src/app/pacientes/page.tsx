"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const inputClase =
  "rounded-md border border-[var(--sonda-border)] bg-white px-3 py-2 text-sm text-[var(--sonda-ink)] outline-none focus:border-[var(--sonda-teal)]";

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(vacio);
  const [guardando, setGuardando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");

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
      setMostrarForm(false);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear paciente");
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter(
      (p) => `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) || p.rut.toLowerCase().includes(q),
    );
  }, [pacientes, busqueda]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--sonda-ink)]">Pacientes</h1>
          <p className="text-sm text-[var(--sonda-ink-soft)]">Registro de pacientes de la clínica.</p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-md bg-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--sonda-teal-dark)]"
        >
          {mostrarForm ? "Cancelar" : "+ Nuevo paciente"}
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={crearPaciente}
          className="grid grid-cols-1 gap-3 rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4 sm:grid-cols-2"
        >
          <input
            required
            placeholder="RUT (12345678-9)"
            value={form.rut}
            onChange={(e) => setForm({ ...form, rut: e.target.value })}
            className={inputClase}
          />
          <select
            value={form.sexo}
            onChange={(e) => setForm({ ...form, sexo: e.target.value as SexoPaciente })}
            className={inputClase}
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
            className={inputClase}
          />
          <input
            required
            placeholder="Apellidos"
            value={form.apellidos}
            onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            className={inputClase}
          />
          <input
            required
            type="date"
            value={form.fechaNacimiento}
            onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
            className={inputClase}
          />
          <input
            placeholder="Teléfono (opcional)"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            className={inputClase}
          />
          <input
            placeholder="Email (opcional)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`${inputClase} sm:col-span-2`}
          />
          <button
            type="submit"
            disabled={guardando}
            className="rounded-md bg-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2 hover:bg-[var(--sonda-teal-dark)]"
          >
            {guardando ? "Guardando..." : "Agregar paciente"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-[var(--sonda-red)]">{error}</p>}

      {!cargando && pacientes.length > 0 && (
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o RUT..."
          className={inputClase}
        />
      )}

      {cargando ? (
        <p className="text-sm text-[var(--sonda-ink-faint)]">Cargando...</p>
      ) : pacientes.length === 0 ? (
        <p className="text-sm text-[var(--sonda-ink-faint)]">Aún no hay pacientes registrados.</p>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-[var(--sonda-ink-faint)]">Sin resultados para &quot;{busqueda}&quot;.</p>
      ) : (
        <ul className="divide-y divide-[var(--sonda-border)] rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)]">
          {filtrados.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pacientes/${p.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--sonda-surface-2)]"
              >
                <span className="font-medium text-[var(--sonda-ink)]">
                  {p.nombres} {p.apellidos}
                </span>
                <span className="text-sm text-[var(--sonda-ink-faint)]">{p.rut}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
