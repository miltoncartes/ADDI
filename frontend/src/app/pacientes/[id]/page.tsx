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

  if (cargando) return <p className="text-sm text-zinc-500">Cargando...</p>;
  if (error && !paciente) return <p className="text-sm text-red-600">{error}</p>;
  if (!paciente) return null;

  const proximaCita = citas
    .filter((c) => new Date(c.fechaHora).getTime() >= ahora)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {paciente.nombres} {paciente.apellidos}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          RUT {paciente.rut} · Nacimiento {paciente.fechaNacimiento} · {paciente.sexo}
        </p>
        {(paciente.telefono || paciente.email) && (
          <p className="text-sm text-zinc-500">
            {[paciente.telefono, paciente.email].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "border-b-2 border-zinc-900 px-3 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }
          >
            {t.label}
          </button>
        ))}
        <Link
          href={`/pacientes/${id}/periodontograma`}
          className="border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          Periodontograma ↗
        </Link>
      </div>

      {tab === "resumen" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Ficha clínica</p>
            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {ficha ? "Registrada" : "Sin registrar"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Odontograma</p>
            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {piezas.length} {piezas.length === 1 ? "pieza registrada" : "piezas registradas"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Próxima cita</p>
            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {proximaCita
                ? new Date(proximaCita.fechaHora).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })
                : "Sin citas agendadas"}
            </p>
          </div>
        </div>
      )}

      {tab === "ficha" && (
        <form onSubmit={guardarFicha} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <textarea
            placeholder="Antecedentes médicos"
            value={fichaForm.antecedentesMedicos}
            onChange={(e) => setFichaForm({ ...fichaForm, antecedentesMedicos: e.target.value })}
            className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <textarea
            placeholder="Alergias"
            value={fichaForm.alergias}
            onChange={(e) => setFichaForm({ ...fichaForm, alergias: e.target.value })}
            className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <textarea
            placeholder="Medicamentos actuales"
            value={fichaForm.medicamentosActuales}
            onChange={(e) => setFichaForm({ ...fichaForm, medicamentosActuales: e.target.value })}
            className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <textarea
            placeholder="Observaciones"
            value={fichaForm.observaciones}
            onChange={(e) => setFichaForm({ ...fichaForm, observaciones: e.target.value })}
            className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={guardandoFicha}
            className="self-start rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {guardandoFicha ? "Guardando..." : ficha ? "Actualizar ficha" : "Crear ficha"}
          </button>
        </form>
      )}

      {tab === "odontograma" && <Odontograma piezas={piezas} onRegistrar={registrarPieza} />}

      {tab === "agenda" && (
        <div className="flex flex-col gap-3">
          <form onSubmit={crearCita} className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-3 dark:border-zinc-800">
            <input
              required
              placeholder="Profesional"
              value={citaForm.profesional}
              onChange={(e) => setCitaForm({ ...citaForm, profesional: e.target.value })}
              className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              required
              type="datetime-local"
              value={citaForm.fechaHora}
              onChange={(e) => setCitaForm({ ...citaForm, fechaHora: e.target.value })}
              className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              placeholder="Motivo (opcional)"
              value={citaForm.motivo}
              onChange={(e) => setCitaForm({ ...citaForm, motivo: e.target.value })}
              className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={guardandoCita}
              className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 sm:col-span-3 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {guardandoCita ? "Guardando..." : "Agendar cita"}
            </button>
          </form>

          {citas.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin citas registradas.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {citas.map((c) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-3">
                  <span>
                    {new Date(c.fechaHora).toLocaleString("es-CL")} · {c.profesional}
                    {c.motivo ? ` · ${c.motivo}` : ""}
                  </span>
                  <span className="text-sm text-zinc-500">{c.estado}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
