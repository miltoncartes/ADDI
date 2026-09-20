"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type {
  Cita,
  EstadoPiezaDental,
  FichaClinica,
  Paciente,
  PiezaOdontograma,
} from "@/lib/types";
import Odontograma from "@/components/Odontograma";

type Tab = "resumen" | "ficha" | "odontograma" | "agenda";

const TABS: { key: Tab; label: string }[] = [
  { key: "resumen", label: "Resumen" },
  { key: "ficha", label: "Ficha clínica" },
  { key: "odontograma", label: "Odontograma" },
  { key: "agenda", label: "Agenda" },
];

const inputClase =
  "rounded-md border border-[var(--sonda-border)] bg-white px-3 py-2 text-sm text-[var(--sonda-ink)] outline-none focus:border-[var(--sonda-teal)]";

export default function PacienteDetallePage() {
  const { id } = useParams<{ id: string }>();

  const [tab, setTab] = useState<Tab>("resumen");
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [ficha, setFicha] = useState<FichaClinica | null>(null);
  const [piezas, setPiezas] = useState<PiezaOdontograma[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ahora] = useState(() => Date.now());

  const [fichaForm, setFichaForm] = useState({
    antecedentesMedicos: "",
    alergias: "",
    medicamentosActuales: "",
    observaciones: "",
  });
  const [guardandoFicha, setGuardandoFicha] = useState(false);

  const [citaForm, setCitaForm] = useState({ profesional: "", fechaHora: "", motivo: "" });
  const [guardandoCita, setGuardandoCita] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function cargar() {
      try {
        const [pacienteData, fichaData, piezasData, citasData] = await Promise.all([
          api.get<Paciente>(`/pacientes/${id}`),
          api.get<FichaClinica | null>(`/fichas-clinicas/paciente/${id}`),
          api.get<PiezaOdontograma[]>(`/odontograma/paciente/${id}`),
          api.get<Cita[]>(`/agenda/paciente/${id}`),
        ]);
        setPaciente(pacienteData);
        setFicha(fichaData);
        if (fichaData) {
          setFichaForm({
            antecedentesMedicos: fichaData.antecedentesMedicos ?? "",
            alergias: fichaData.alergias ?? "",
            medicamentosActuales: fichaData.medicamentosActuales ?? "",
            observaciones: fichaData.observaciones ?? "",
          });
        }
        setPiezas(piezasData);
        setCitas(citasData);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar el paciente");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  const guardarFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoFicha(true);
    setError(null);
    try {
      if (ficha) {
        const actualizada = await api.patch<FichaClinica>(`/fichas-clinicas/${ficha.id}`, fichaForm);
        setFicha(actualizada);
      } else {
        const creada = await api.post<FichaClinica>("/fichas-clinicas", {
          pacienteId: id,
          ...fichaForm,
        });
        setFicha(creada);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar la ficha clínica");
    } finally {
      setGuardandoFicha(false);
    }
  };

  const registrarPieza = async (
    numeroPieza: number,
    estado: EstadoPiezaDental,
    observaciones: string,
  ) => {
    const nueva = await api.post<PiezaOdontograma>("/odontograma", {
      pacienteId: id,
      numeroPieza,
      estado,
      observaciones: observaciones || undefined,
    });
    setPiezas((prev) => [...prev, nueva]);
  };

  const crearCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoCita(true);
    setError(null);
    try {
      const nueva = await api.post<Cita>("/agenda", {
        pacienteId: id,
        profesional: citaForm.profesional,
        fechaHora: new Date(citaForm.fechaHora).toISOString(),
        motivo: citaForm.motivo || undefined,
      });
      setCitas((prev) => [...prev, nueva].sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)));
      setCitaForm({ profesional: "", fechaHora: "", motivo: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear la cita");
    } finally {
      setGuardandoCita(false);
    }
  };

  if (cargando) return <p className="text-sm text-[var(--sonda-ink-faint)]">Cargando...</p>;
  if (error && !paciente) return <p className="text-sm text-[var(--sonda-red)]">{error}</p>;
  if (!paciente) return null;

  const proximaCita = citas
    .filter((c) => new Date(c.fechaHora).getTime() >= ahora)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--sonda-ink)]">
          {paciente.nombres} {paciente.apellidos}
        </h1>
        <p className="text-sm text-[var(--sonda-ink-soft)]">
          RUT {paciente.rut} · Nacimiento {paciente.fechaNacimiento} · {paciente.sexo}
        </p>
        {(paciente.telefono || paciente.email) && (
          <p className="text-sm text-[var(--sonda-ink-faint)]">
            {[paciente.telefono, paciente.email].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-[var(--sonda-red)]">{error}</p>}

      <div className="flex flex-wrap gap-1 border-b border-[var(--sonda-border)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "border-b-2 border-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-[var(--sonda-teal-dark)]"
                : "border-b-2 border-transparent px-3 py-2 text-sm text-[var(--sonda-ink-soft)] hover:text-[var(--sonda-ink)]"
            }
          >
            {t.label}
          </button>
        ))}
        <Link
          href={`/pacientes/${id}/periodontograma`}
          className="border-b-2 border-transparent px-3 py-2 text-sm text-[var(--sonda-ink-soft)] hover:text-[var(--sonda-ink)]"
        >
          Periodontograma ↗
        </Link>
      </div>

      {tab === "resumen" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4">
            <p className="text-xs text-[var(--sonda-ink-faint)]">Ficha clínica</p>
            <p className="mt-1 text-sm font-medium text-[var(--sonda-ink)]">
              {ficha ? "Registrada" : "Sin registrar"}
            </p>
          </div>
          <div className="rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4">
            <p className="text-xs text-[var(--sonda-ink-faint)]">Odontograma</p>
            <p className="mt-1 text-sm font-medium text-[var(--sonda-ink)]">
              {piezas.length} {piezas.length === 1 ? "pieza registrada" : "piezas registradas"}
            </p>
          </div>
          <div className="rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4">
            <p className="text-xs text-[var(--sonda-ink-faint)]">Próxima cita</p>
            <p className="mt-1 text-sm font-medium text-[var(--sonda-ink)]">
              {proximaCita
                ? new Date(proximaCita.fechaHora).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })
                : "Sin citas agendadas"}
            </p>
          </div>
        </div>
      )}

      {tab === "ficha" && (
        <form onSubmit={guardarFicha} className="flex flex-col gap-3 rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4">
          <textarea
            placeholder="Antecedentes médicos"
            value={fichaForm.antecedentesMedicos}
            onChange={(e) => setFichaForm({ ...fichaForm, antecedentesMedicos: e.target.value })}
            className={inputClase}
          />
          <textarea
            placeholder="Alergias"
            value={fichaForm.alergias}
            onChange={(e) => setFichaForm({ ...fichaForm, alergias: e.target.value })}
            className={inputClase}
          />
          <textarea
            placeholder="Medicamentos actuales"
            value={fichaForm.medicamentosActuales}
            onChange={(e) => setFichaForm({ ...fichaForm, medicamentosActuales: e.target.value })}
            className={inputClase}
          />
          <textarea
            placeholder="Observaciones"
            value={fichaForm.observaciones}
            onChange={(e) => setFichaForm({ ...fichaForm, observaciones: e.target.value })}
            className={inputClase}
          />
          <button
            type="submit"
            disabled={guardandoFicha}
            className="self-start rounded-md bg-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[var(--sonda-teal-dark)]"
          >
            {guardandoFicha ? "Guardando..." : ficha ? "Actualizar ficha" : "Crear ficha"}
          </button>
        </form>
      )}

      {tab === "odontograma" && <Odontograma piezas={piezas} onRegistrar={registrarPieza} />}

      {tab === "agenda" && (
        <div className="flex flex-col gap-3">
          <form onSubmit={crearCita} className="grid grid-cols-1 gap-3 rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4 sm:grid-cols-3">
            <input
              required
              placeholder="Profesional"
              value={citaForm.profesional}
              onChange={(e) => setCitaForm({ ...citaForm, profesional: e.target.value })}
              className={inputClase}
            />
            <input
              required
              type="datetime-local"
              value={citaForm.fechaHora}
              onChange={(e) => setCitaForm({ ...citaForm, fechaHora: e.target.value })}
              className={inputClase}
            />
            <input
              placeholder="Motivo (opcional)"
              value={citaForm.motivo}
              onChange={(e) => setCitaForm({ ...citaForm, motivo: e.target.value })}
              className={inputClase}
            />
            <button
              type="submit"
              disabled={guardandoCita}
              className="rounded-md bg-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-3 hover:bg-[var(--sonda-teal-dark)]"
            >
              {guardandoCita ? "Guardando..." : "Agendar cita"}
            </button>
          </form>

          {citas.length === 0 ? (
            <p className="text-sm text-[var(--sonda-ink-faint)]">Sin citas registradas.</p>
          ) : (
            <ul className="divide-y divide-[var(--sonda-border)] rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)]">
              {citas.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[var(--sonda-ink)]">
                    {new Date(c.fechaHora).toLocaleString("es-CL")} · {c.profesional}
                    {c.motivo ? ` · ${c.motivo}` : ""}
                  </span>
                  <span className="text-sm text-[var(--sonda-ink-faint)]">{c.estado}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
