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
  pendiente: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  confirmada: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  atendida: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  cancelada: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  no_asistio: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

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

  const Fila = ({ cita }: { cita: Cita }) => (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div>
        <p className="font-medium text-zinc-900 dark:text-zinc-50">
          {new Date(cita.fechaHora).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Agenda</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Todas las citas registradas, de todos los pacientes.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {cargando ? (
        <p className="text-sm text-zinc-500">Cargando...</p>
      ) : citas.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Aún no hay citas registradas. Se agregan desde la ficha de cada paciente.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Próximas ({proximas.length})
            </h2>
            {proximas.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin citas próximas.</p>
            ) : (
              <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
                {proximas.map((c) => (
                  <Fila key={c.id} cita={c} />
                ))}
              </ul>
            )}
          </section>

          {pasadas.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Pasadas ({pasadas.length})
              </h2>
              <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 opacity-75 dark:divide-zinc-800 dark:border-zinc-800">
                {pasadas
                  .slice()
                  .reverse()
                  .map((c) => (
                    <Fila key={c.id} cita={c} />
                  ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
