"use client";

import { useState } from "react";
import type { EstadoPiezaDental, PiezaOdontograma } from "@/lib/types";

const CUADRANTE_SUPERIOR_DERECHO = [18, 17, 16, 15, 14, 13, 12, 11];
const CUADRANTE_SUPERIOR_IZQUIERDO = [21, 22, 23, 24, 25, 26, 27, 28];
const CUADRANTE_INFERIOR_DERECHO = [48, 47, 46, 45, 44, 43, 42, 41];
const CUADRANTE_INFERIOR_IZQUIERDO = [31, 32, 33, 34, 35, 36, 37, 38];

export const ESTADOS_PIEZA: { value: EstadoPiezaDental; label: string; color: string }[] = [
  { value: "sano", label: "Sano", color: "bg-white border-[var(--sonda-border)]" },
  { value: "caries", label: "Caries", color: "bg-[var(--sonda-red-soft)] border-[var(--sonda-red)]" },
  { value: "obturado", label: "Obturado", color: "bg-[var(--sonda-teal-soft)] border-[var(--sonda-teal)]" },
  { value: "ausente", label: "Ausente", color: "bg-[var(--sonda-surface-2)] border-[var(--sonda-ink-faint)]" },
  { value: "corona", label: "Corona", color: "bg-[var(--sonda-amber-soft)] border-[var(--sonda-amber)]" },
  { value: "endodoncia", label: "Endodoncia", color: "bg-purple-100 border-purple-400" },
  { value: "extraccion_indicada", label: "Extracción indicada", color: "bg-orange-100 border-orange-400" },
  { value: "implante", label: "Implante", color: "bg-emerald-100 border-emerald-500" },
];

function estadoInfo(estado: EstadoPiezaDental | undefined) {
  return ESTADOS_PIEZA.find((e) => e.value === estado) ?? ESTADOS_PIEZA[0];
}

interface OdontogramaProps {
  piezas: PiezaOdontograma[];
  onRegistrar: (numeroPieza: number, estado: EstadoPiezaDental, observaciones: string) => Promise<void>;
}

/** Muestra, por pieza, el registro más reciente (mayor fechaRegistro). */
function piezaActual(piezas: PiezaOdontograma[], numeroPieza: number) {
  return piezas
    .filter((p) => p.numeroPieza === numeroPieza)
    .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())[0];
}

function Diente({
  numero,
  actual,
  onClick,
}: {
  numero: number;
  actual: PiezaOdontograma | undefined;
  onClick: () => void;
}) {
  const info = estadoInfo(actual?.estado);
  return (
    <button
      type="button"
      onClick={onClick}
      title={actual ? `${numero} — ${info.label}${actual.observaciones ? `: ${actual.observaciones}` : ""}` : `${numero} — sin registro`}
      className={`flex h-12 w-9 flex-col items-center justify-center rounded border-2 text-[11px] font-medium text-[var(--sonda-ink)] transition hover:scale-105 ${info.color}`}
    >
      {numero}
    </button>
  );
}

function Fila({
  numeros,
  piezas,
  onAbrir,
}: {
  numeros: number[];
  piezas: PiezaOdontograma[];
  onAbrir: (numero: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {numeros.map((n) => (
        <Diente key={n} numero={n} actual={piezaActual(piezas, n)} onClick={() => onAbrir(n)} />
      ))}
    </div>
  );
}

export default function Odontograma({ piezas, onRegistrar }: OdontogramaProps) {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [estado, setEstado] = useState<EstadoPiezaDental>("caries");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  const abrir = (numero: number) => {
    const actual = piezaActual(piezas, numero);
    setSeleccionada(numero);
    setEstado(actual?.estado ?? "caries");
    setObservaciones(actual?.observaciones ?? "");
  };

  const guardar = async () => {
    if (seleccionada === null) return;
    setGuardando(true);
    try {
      await onRegistrar(seleccionada, estado, observaciones);
      setSeleccionada(null);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 overflow-x-auto rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4">
        <div className="flex gap-2">
          <Fila numeros={CUADRANTE_SUPERIOR_DERECHO} piezas={piezas} onAbrir={abrir} />
          <Fila numeros={CUADRANTE_SUPERIOR_IZQUIERDO} piezas={piezas} onAbrir={abrir} />
        </div>
        <div className="my-1 h-px w-full bg-[var(--sonda-border)]" />
        <div className="flex gap-2">
          <Fila numeros={CUADRANTE_INFERIOR_DERECHO} piezas={piezas} onAbrir={abrir} />
          <Fila numeros={CUADRANTE_INFERIOR_IZQUIERDO} piezas={piezas} onAbrir={abrir} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[var(--sonda-ink-soft)]">
        {ESTADOS_PIEZA.map((e) => (
          <span key={e.value} className="flex items-center gap-1">
            <span className={`h-3 w-3 rounded border ${e.color}`} />
            {e.label}
          </span>
        ))}
      </div>

      {seleccionada !== null && (
        <div className="flex flex-col gap-3 rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-4">
          <p className="font-medium text-[var(--sonda-ink)]">Pieza {seleccionada}</p>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPiezaDental)}
            className="rounded-md border border-[var(--sonda-border)] px-2 py-1.5 text-sm"
          >
            {ESTADOS_PIEZA.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          <input
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones (opcional)"
            className="rounded-md border border-[var(--sonda-border)] px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="rounded-md bg-[var(--sonda-teal)] px-3 py-1.5 text-sm text-white disabled:opacity-50 hover:bg-[var(--sonda-teal-dark)]"
            >
              {guardando ? "Guardando..." : "Registrar"}
            </button>
            <button
              type="button"
              onClick={() => setSeleccionada(null)}
              className="rounded-md border border-[var(--sonda-border)] px-3 py-1.5 text-sm hover:bg-[var(--sonda-surface-2)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
