"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Paciente } from "@/lib/types";
import type { SesionPeriodontal, SesionPeriodontalDetalle } from "@/lib/periodontal";
import DictadoPeriodontal from "@/components/DictadoPeriodontal";

const RESUMEN_VACIO = {
  totalSitios: 0,
  profundidadPromedio: 0,
  porcentajeSangrado: 0,
  sitiosProfundidad4a5: 0,
  sitiosProfundidad6Mas: 0,
  nivelInsercionClinicaPromedio: 0,
};

export default function PeriodontogramaPage() {
  const { id } = useParams<{ id: string }>();

  const [soportaVoz] = useState(
    () => typeof window !== "undefined" && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  );
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [sesion, setSesion] = useState<SesionPeriodontalDetalle | null>(null);
  const [examinador, setExaminador] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [ayudaVisible, setAyudaVisible] = useState(false);

  // Carga inicial declarada dentro del efecto (no reutiliza una función del componente
  // que setea estado): así el linter de React puede verificar que el efecto no dispara
  // un setState en cadena.
  useEffect(() => {
    if (!id) return;
    async function cargarInicial() {
      try {
        const [pacienteData, sesiones] = await Promise.all([
          api.get<Paciente>(`/pacientes/${id}`),
          api.get<SesionPeriodontal[]>(`/periodontograma/sesiones/paciente/${id}`),
        ]);
        setPaciente(pacienteData);
        const enProgreso = sesiones.find((s) => s.estado === "en_progreso");
        if (enProgreso) {
          const detalle = await api.get<SesionPeriodontalDetalle>(`/periodontograma/sesiones/${enProgreso.id}`);
          setSesion(detalle);
        }
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        setCargando(false);
      }
    }
    cargarInicial();
  }, [id]);

  const crearSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setError(null);
    try {
      const nueva = await api.post<SesionPeriodontal>("/periodontograma/sesiones", {
        pacienteId: id,
        examinador,
      });
      setSesion({ ...nueva, sitios: [], resumen: RESUMEN_VACIO });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear la sesión");
    } finally {
      setCreando(false);
    }
  };

  const nuevaSesion = async () => {
    if (sesion && sesion.estado === "en_progreso") {
      await api.patch(`/periodontograma/sesiones/${sesion.id}/finalizar`, {});
    }
    setSesion(null);
    setExaminador("");
  };

  if (cargando) return <p className="text-sm text-zinc-500">Cargando...</p>;
  if (!paciente) return <p className="text-sm text-red-600">{error ?? "Paciente no encontrado"}</p>;

  return (
    <div className="sonda-theme -mx-6 rounded-2xl p-4 sm:p-5">
      <Link href={`/pacientes/${id}`} className="sonda-no-print mb-3 inline-block text-sm text-[var(--sonda-ink-soft)] hover:underline">
        ← {paciente.nombres} {paciente.apellidos}
      </Link>

      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--sonda-teal)]">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 stroke-white">
              <path d="M12 2c-3 0-5 2-5 5 0 4 1 6 1 9 0 3 1.5 4 2.5 4s1.8-1.5 1.8-3.5c0-1.5.7-2 .7-2s.7.5.7 2C13.7 19.5 14.5 21 15.5 21s2.5-1 2.5-4c0-3 1-5 1-9 0-3-2-5-5-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight">Sonda — Periodontograma por Voz</h1>
            <p className="text-xs text-[var(--sonda-ink-soft)]">Registro de sondaje manos libres</p>
          </div>
        </div>
        <div className="sonda-no-print flex gap-2">
          <button
            type="button"
            onClick={() => setAyudaVisible((v) => !v)}
            className="rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface)] px-3 py-2 text-[12.5px] text-[var(--sonda-ink-soft)] hover:bg-[var(--sonda-surface-2)]"
          >
            Comandos de voz
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface)] px-3 py-2 text-[12.5px] text-[var(--sonda-ink-soft)] hover:bg-[var(--sonda-surface-2)]"
          >
            Imprimir / PDF
          </button>
          {sesion && (
            <button
              type="button"
              onClick={nuevaSesion}
              className="rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface)] px-3 py-2 text-[12.5px] text-[var(--sonda-ink-soft)] hover:bg-[var(--sonda-surface-2)]"
            >
              Nueva sesión
            </button>
          )}
        </div>
      </header>

      {!soportaVoz && (
        <div className="sonda-no-print mb-4 rounded-lg border border-[var(--sonda-amber)] bg-[var(--sonda-amber-soft)] px-3.5 py-2.5 text-[13px] text-[#6b4a1a]">
          Este navegador no soporta reconocimiento de voz (Web Speech API). Usa Chrome de escritorio o Android
          para el modo manos libres. Aun así puedes cargar valores manualmente tocando cada punto del diagrama.
        </div>
      )}

      {ayudaVisible && (
        <div className="sonda-no-print mb-4 rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-[18px] text-[12.5px] leading-[1.7] text-[var(--sonda-ink-soft)]">
          <h2 className="mb-2 text-[12.5px] font-semibold uppercase tracking-[.07em] text-[var(--sonda-ink-faint)]">Vocabulario soportado</h2>
          <p>Habla en frases cortas. Puedes encadenar varios comandos en una sola frase.</p>
          <h3 className="mb-1 mt-3 text-xs font-semibold text-[var(--sonda-ink)]">Seleccionar diente</h3>
          <p>
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              diente 16
            </code>{" "}
            — selecciona el diente por notación FDI (11–48).
          </p>
          <h3 className="mb-1 mt-3 text-xs font-semibold text-[var(--sonda-ink)]">Profundidad de sondaje (mm)</h3>
          <p>
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              vestibular 3 2 3
            </code>{" "}
            — asigna mesio-vestibular, vestibular, disto-vestibular.
          </p>
          <p>
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              palatino 2 2 3
            </code>{" "}
            o{" "}
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              lingual 2 2 3
            </code>{" "}
            — asigna mesio-palatino/lingual, palatino/lingual, disto-palatino/lingual.
          </p>
          <h3 className="mb-1 mt-3 text-xs font-semibold text-[var(--sonda-ink)]">Sangrado al sondaje</h3>
          <p>
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              sangrado vestibular
            </code>{" "}
            ·{" "}
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              sangrado palatino
            </code>{" "}
            ·{" "}
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              sangrado todo
            </code>{" "}
            ·{" "}
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              sangrado no
            </code>
          </p>
          <h3 className="mb-1 mt-3 text-xs font-semibold text-[var(--sonda-ink)]">Recesión gingival (mm)</h3>
          <p>
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              recesión vestibular 1 0 1
            </code>{" "}
            — antes del bloque de zona.
          </p>
          <h3 className="mb-1 mt-3 text-xs font-semibold text-[var(--sonda-ink)]">Navegación</h3>
          <p>
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              siguiente
            </code>{" "}
            ·{" "}
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              anterior
            </code>{" "}
            ·{" "}
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              borrar
            </code>{" "}
            (limpia el diente actual) ·{" "}
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              guardar
            </code>{" "}
            (finaliza la sesión)
          </p>
          <h3 className="mb-1 mt-3 text-xs font-semibold text-[var(--sonda-ink)]">Ejemplo de dictado completo</h3>
          <p>
            <code className="rounded border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-1.5 py-0.5 font-[family-name:var(--sonda-mono)] text-[var(--sonda-teal-dark)]">
              diente 16 vestibular 3 2 3 sangrado vestibular palatino 2 2 3 siguiente
            </code>
          </p>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-[var(--sonda-red)]">{error}</p>}

      {!sesion ? (
        <form
          onSubmit={crearSesion}
          className="flex max-w-sm flex-col gap-3 rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-[18px]"
        >
          <label className="text-sm font-medium">Examinador</label>
          <input
            required
            value={examinador}
            onChange={(e) => setExaminador(e.target.value)}
            placeholder="Dr./Dra. ..."
            className="rounded-md border border-[var(--sonda-border)] px-2 py-1.5"
          />
          <button
            type="submit"
            disabled={creando}
            className="rounded-md bg-[var(--sonda-teal)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[var(--sonda-teal-dark)]"
          >
            {creando ? "Creando..." : "Iniciar sesión de sondaje"}
          </button>
        </form>
      ) : (
        <DictadoPeriodontal sesion={sesion} sitiosIniciales={sesion.sitios} onSesionFinalizada={nuevaSesion} />
      )}
    </div>
  );
}
