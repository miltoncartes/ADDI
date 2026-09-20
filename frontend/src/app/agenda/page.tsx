"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Cita } from "@/lib/types";

const ESTADO_LABEL: Record<Cita["estado"], string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  atendida: "Atendida",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

const ESTADO_COLOR: Record<Cita["estado"], string> = {
  pendiente: "bg-[var(--sonda-surface-2)] text-[var(--sonda-ink-soft)]",
  confirmada: "bg-[var(--sonda-teal-soft)] text-[var(--sonda-teal-dark)]",
  atendida: "bg-[var(--sonda-teal-soft)] text-[var(--sonda-teal-dark)]",
  cancelada: "bg-[var(--sonda-red-soft)] text-[var(--sonda-red)]",
  no_asistio: "bg-[var(--sonda-amber-soft)] text-[var(--sonda-amber)]",
};

function FilaCita({ cita }: { cita: Cita }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div>
        <p className="font-medium text-[var(--sonda-ink)]">
          {new Date(cita.fechaHora).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <p className="text-sm text-[var(--sonda-ink-soft)]">
          {cita.paciente ? (
            <Link href={`/pacientes/${cita.paciente.id}`} className="hover:underline">
              {cita.paciente.nombres} {cita.paciente.apellidos}
            </Link>
          ) : (
            "Paciente"
          )}{" "}
          · {cita.profesional}
          {cita.motivo ? ` · ${cita.motivo}` : ""}
        </p>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_COLOR[cita.estado]}`}>
        {ESTADO_LABEL[cita.estado]}
      </span>
    </li>
  );
}

export default function AgendaGlobalPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ahora] = useState(() => Date.now());

  useEffect(() => {
    async function cargar() {
      try {
        const data = await api.get<Cita[]>("/agenda");
        setCitas(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar la agenda");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const proximas = citas.filter((c) => new Date(c.fechaHora).getTime() >= ahora);
  const pasadas = citas.filter((c) => new Date(c.fechaHora).getTime() < ahora);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--sonda-ink)]">Agenda</h1>
        <p className="text-sm text-[var(--sonda-ink-soft)]">Todas las citas registradas, de todos los pacientes.</p>
      </div>

      {error && <p className="text-sm text-[var(--sonda-red)]">{error}</p>}

      {cargando ? (
        <p className="text-sm text-[var(--sonda-ink-faint)]">Cargando...</p>
      ) : citas.length === 0 ? (
        <p className="text-sm text-[var(--sonda-ink-faint)]">
          Aún no hay citas registradas. Se agregan desde la ficha de cada paciente.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-[var(--sonda-ink-soft)]">
              Próximas ({proximas.length})
            </h2>
            {proximas.length === 0 ? (
              <p className="text-sm text-[var(--sonda-ink-faint)]">Sin citas próximas.</p>
            ) : (
              <ul className="divide-y divide-[var(--sonda-border)] rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)]">
                {proximas.map((c) => (
                  <FilaCita key={c.id} cita={c} />
                ))}
              </ul>
            )}
          </section>

          {pasadas.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-[var(--sonda-ink-soft)]">
                Pasadas ({pasadas.length})
              </h2>
              <ul className="divide-y divide-[var(--sonda-border)] rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] opacity-75">
                {pasadas
                  .slice()
                  .reverse()
                  .map((c) => (
                    <FilaCita key={c.id} cita={c} />
                  ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
