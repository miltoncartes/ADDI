"use client";

import { useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  FDI_INFERIOR,
  FDI_SUPERIOR,
  SECUENCIA_EXAMEN,
  SITIOS_TABLA,
  SITIOS_ZONA,
  parseUtterance,
  type EventoVoz,
} from "@/lib/periodontal-voice";
import {
  SITIO_CORTO,
  calcularResumen,
  type SesionPeriodontal,
  type SitioDental,
  type SitioPeriodontal,
} from "@/lib/periodontal";

interface Props {
  sesion: SesionPeriodontal;
  sitiosIniciales: SitioPeriodontal[];
  onSesionFinalizada: () => void;
}

function claveSitio(numeroPieza: number, sitio: SitioDental) {
  return `${numeroPieza}-${sitio}`;
}

export default function DictadoPeriodontal({ sesion, sitiosIniciales, onSesionFinalizada }: Props) {
  const [soportaVoz] = useState(
    () => typeof window !== "undefined" && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  );
  const [escuchando, setEscuchando] = useState(false);
  const [transcripcionParcial, setTranscripcionParcial] = useState("");
  const [log, setLog] = useState<{ hora: string; texto: string }[]>([]);
  const [piezaActiva, setPiezaActiva] = useState<number>(FDI_SUPERIOR[0]);
  const [sitios, setSitios] = useState<Map<string, SitioPeriodontal>>(
    () => new Map(sitiosIniciales.map((s) => [claveSitio(s.numeroPieza, s.sitio), s])),
  );
  const [armado, setArmado] = useState<SitioDental | null>(null);
  const [simulado, setSimulado] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const piezaActivaRef = useRef(piezaActiva);
  const indiceSitioRef = useRef(0);
  const sitiosRef = useRef(sitios);
  const colaRef = useRef<Promise<void>>(Promise.resolve());

  const resumen = useMemo(() => calcularResumen(Array.from(sitios.values())), [sitios]);
  const examinados = useMemo(
    () => new Set(Array.from(sitios.values()).map((s) => s.numeroPieza)).size,
    [sitios],
  );
  const sitios5mm = useMemo(
    () => Array.from(sitios.values()).filter((s) => s.profundidadSondaje >= 5).length,
    [sitios],
  );

  const registrarSitio = async (
    numeroPieza: number,
    sitio: SitioDental,
    cambios: Partial<Pick<SitioPeriodontal, "profundidadSondaje" | "recesion" | "sangrado">>,
  ) => {
    const clave = claveSitio(numeroPieza, sitio);
    const existente = sitiosRef.current.get(clave);
    const payload = {
      sesionId: sesion.id,
      numeroPieza,
      sitio,
      profundidadSondaje: cambios.profundidadSondaje ?? existente?.profundidadSondaje ?? 0,
      recesion: cambios.recesion ?? existente?.recesion ?? 0,
      sangrado: cambios.sangrado ?? existente?.sangrado ?? false,
    };
    const guardado = await api.post<SitioPeriodontal>("/periodontograma/sitios", payload);
    const nuevoMapa = new Map(sitiosRef.current);
    nuevoMapa.set(clave, guardado);
    sitiosRef.current = nuevoMapa;
    setSitios(nuevoMapa);
    return guardado;
  };

  const seleccionarPieza = (numero: number) => {
    piezaActivaRef.current = numero;
    indiceSitioRef.current = 0;
    setPiezaActiva(numero);
    setArmado(null);
  };

  const avanzarSiguientePieza = () => {
    const idx = SECUENCIA_EXAMEN.indexOf(piezaActivaRef.current);
    const siguiente = idx >= 0 && idx < SECUENCIA_EXAMEN.length - 1 ? SECUENCIA_EXAMEN[idx + 1] : SECUENCIA_EXAMEN[0];
    seleccionarPieza(siguiente);
  };

  const retrocederPieza = () => {
    const idx = SECUENCIA_EXAMEN.indexOf(piezaActivaRef.current);
    const anterior = idx > 0 ? SECUENCIA_EXAMEN[idx - 1] : SECUENCIA_EXAMEN[SECUENCIA_EXAMEN.length - 1];
    seleccionarPieza(anterior);
  };

  const ultimoSitioTocado = (): SitioDental => SITIOS_TABLA[Math.max(Math.min(indiceSitioRef.current, SITIOS_TABLA.length) - 1, 0)];

  const procesarEvento = async (evento: EventoVoz) => {
    switch (evento.tipo) {
      case "pieza": {
        seleccionarPieza(evento.numeroPieza);
        break;
      }
      case "zona": {
        const sitiosZona = SITIOS_ZONA[evento.zona];
        for (let k = 0; k < evento.valores.length && k < 3; k++) {
          const sitio = sitiosZona[k];
          if (evento.modo === "recesion") {
            await registrarSitio(piezaActivaRef.current, sitio, { recesion: evento.valores[k] });
          } else {
            await registrarSitio(piezaActivaRef.current, sitio, { profundidadSondaje: evento.valores[k] });
          }
        }
        break;
      }
      case "profundidades": {
        for (const valor of evento.valores) {
          if (indiceSitioRef.current >= SITIOS_TABLA.length) indiceSitioRef.current = 0;
          const sitio = SITIOS_TABLA[indiceSitioRef.current];
          await registrarSitio(piezaActivaRef.current, sitio, { profundidadSondaje: valor });
          indiceSitioRef.current += 1;
        }
        break;
      }
      case "sangrado": {
        const objetivo = evento.sitios.length > 0 ? evento.sitios : [ultimoSitioTocado()];
        for (const sitio of objetivo) {
          await registrarSitio(piezaActivaRef.current, sitio, { sangrado: evento.valor });
        }
        break;
      }
      case "recesion": {
        const objetivo = evento.sitios.length > 0 ? evento.sitios : [ultimoSitioTocado()];
        for (const sitio of objetivo) {
          await registrarSitio(piezaActivaRef.current, sitio, { recesion: evento.valor });
        }
        break;
      }
      case "siguiente": {
        avanzarSiguientePieza();
        break;
      }
      case "anterior": {
        retrocederPieza();
        break;
      }
      case "borrar": {
        for (const sitio of SITIOS_TABLA) {
          await registrarSitio(piezaActivaRef.current, sitio, { profundidadSondaje: 0, recesion: 0, sangrado: false });
        }
        break;
      }
      case "repetir":
      case "deshacer": {
        indiceSitioRef.current = Math.max(indiceSitioRef.current - 1, 0);
        break;
      }
      case "guardar": {
        await api.patch(`/periodontograma/sesiones/${sesion.id}/finalizar`, {});
        detener();
        onSesionFinalizada();
        break;
      }
    }
  };

  const agregarLog = (texto: string) => {
    const hora = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLog((prev) => [{ hora, texto }, ...prev].slice(0, 40));
  };

  const procesarTranscripcion = (texto: string) => {
    const eventos = parseUtterance(texto);
    agregarLog(eventos.length > 0 ? texto : `${texto} (sin comandos reconocidos)`);
    colaRef.current = colaRef.current.then(async () => {
      for (const evento of eventos) {
        await procesarEvento(evento);
      }
    });
  };

  const iniciar = () => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "es-CL";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultado = event.results[i];
        const texto = resultado[0]?.transcript ?? "";
        if (resultado.isFinal) {
          procesarTranscripcion(texto);
        } else {
          interim += texto;
        }
      }
      setTranscripcionParcial(interim);
    };
    recognition.onerror = () => agregarLog("Error del reconocimiento de voz.");
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          setEscuchando(false);
        }
      }
    };
    recognition.start();
    recognitionRef.current = recognition;
    setEscuchando(true);
  };

  const detener = () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.stop();
    setEscuchando(false);
    setTranscripcionParcial("");
  };

  const procesarSimulado = () => {
    if (!simulado.trim()) return;
    procesarTranscripcion(simulado);
    setSimulado("");
  };

  const toothHasData = (numero: number) => Array.from(sitios.values()).some((s) => s.numeroPieza === numero);
  const toothHasBop = (numero: number) =>
    Array.from(sitios.values()).some((s) => s.numeroPieza === numero && s.sangrado);

  const ToothButton = ({ numero }: { numero: number }) => {
    const activo = numero === piezaActiva;
    const conDatos = toothHasData(numero);
    const conSangrado = toothHasBop(numero);
    return (
      <button
        type="button"
        onClick={() => seleccionarPieza(numero)}
        className={`relative flex h-[34px] w-[30px] items-center justify-center rounded-md border font-[family-name:var(--sonda-mono)] text-[11px] ${
          activo
            ? "border-[var(--sonda-teal)] bg-[var(--sonda-teal)] font-bold text-white"
            : "border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] text-[var(--sonda-ink-soft)] hover:border-[var(--sonda-teal)]"
        }`}
      >
        {numero}
        <span
          className={`absolute bottom-[2px] h-[4px] w-[4px] rounded-full ${
            conSangrado ? "bg-[var(--sonda-red)]" : conDatos ? "bg-[var(--sonda-teal)]" : "bg-[var(--sonda-ink-faint)]"
          }`}
        />
      </button>
    );
  };

  const SiteCard = ({ sitio }: { sitio: SitioDental }) => {
    const dato = sitios.get(claveSitio(piezaActiva, sitio));
    const estaArmado = armado === sitio;
    return (
      <button
        type="button"
        onClick={() => setArmado(sitio)}
        className={`flex w-[76px] flex-col items-center rounded-lg border px-1 py-2 text-center ${
          dato?.sangrado ? "border-[var(--sonda-red)] bg-[var(--sonda-red-soft)]" : "border-[var(--sonda-border)] bg-[var(--sonda-surface-2)]"
        } ${estaArmado ? "ring-2 ring-[var(--sonda-teal-soft)] border-[var(--sonda-teal)]" : ""} hover:border-[var(--sonda-teal)]`}
      >
        <span className="text-[9.5px] tracking-wide text-[var(--sonda-ink-faint)]">{SITIO_CORTO[sitio]}</span>
        <span className={`my-0.5 font-[family-name:var(--sonda-mono)] text-[19px] font-bold ${dato ? "text-[var(--sonda-ink)]" : "text-[var(--sonda-ink-faint)] font-normal"}`}>
          {dato ? dato.profundidadSondaje : "·"}
        </span>
        <span className="font-[family-name:var(--sonda-mono)] text-[10.5px] text-[var(--sonda-amber)]">
          {dato && dato.recesion !== 0 ? (dato.recesion > 0 ? `+${dato.recesion}` : dato.recesion) : ""}
        </span>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1fr_380px]">
      {/* Columna izquierda: captura */}
      <div className="rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-[18px]">
        <h2 className="sonda-no-print mb-[14px] text-[12.5px] font-semibold uppercase tracking-[.07em] text-[var(--sonda-ink-faint)]">
          Captura por voz
        </h2>

        <div className="sonda-no-print flex flex-col items-center gap-[10px] pb-[22px]">
          <button
            type="button"
            onClick={escuchando ? detener : iniciar}
            disabled={!soportaVoz}
            className={`sonda-mic relative flex h-[88px] w-[88px] items-center justify-center rounded-full border-none shadow-[0_4px_14px_rgba(14,124,123,0.28)] transition disabled:opacity-40 ${
              escuchando ? "listening bg-[var(--sonda-red)] shadow-[0_4px_18px_rgba(192,57,43,0.35)]" : "bg-[var(--sonda-teal)] hover:bg-[var(--sonda-teal-dark)]"
            }`}
          >
            <span className="sonda-ring r1" />
            <span className="sonda-ring r2" />
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="relative z-[2] h-8 w-8 stroke-white">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <div className={`text-center text-[12.5px] ${escuchando ? "font-semibold text-[var(--sonda-red)]" : "text-[var(--sonda-ink-soft)]"}`}>
            {soportaVoz ? (escuchando ? "Escuchando…" : "Toca para dictar") : "Sin soporte de voz — usa el simulador abajo"}
          </div>
          <div className="min-h-[18px] max-w-[520px] text-center font-[family-name:var(--sonda-mono)] text-[12.5px] text-[var(--sonda-ink-faint)]">
            {transcripcionParcial}
          </div>
        </div>

        <div className="mb-1.5 text-center text-[10px] uppercase tracking-[.08em] text-[var(--sonda-ink-faint)]">Superior · 18→28</div>
        <div className="mb-1.5 flex flex-wrap justify-center gap-1">
          {FDI_SUPERIOR.map((n) => (
            <ToothButton key={n} numero={n} />
          ))}
        </div>
        <div className="mb-1.5 mt-2 text-center text-[10px] uppercase tracking-[.08em] text-[var(--sonda-ink-faint)]">Inferior · 48→38</div>
        <div className="flex flex-wrap justify-center gap-1">
          {FDI_INFERIOR.map((n) => (
            <ToothButton key={n} numero={n} />
          ))}
        </div>

        <div className="mt-4 border-t border-[var(--sonda-border)] pt-4">
          <div className="mb-3.5 flex items-baseline gap-2">
            <span className="font-[family-name:var(--sonda-mono)] text-[26px] font-bold text-[var(--sonda-teal-dark)]">{piezaActiva}</span>
            <span className="text-[12px] text-[var(--sonda-ink-soft)]">diente activo — toca un punto para corregir manualmente</span>
          </div>
          <div className="mb-1 text-center text-[10px] uppercase tracking-[.08em] text-[var(--sonda-ink-faint)]">Vestibular</div>
          <div className="mb-2 flex justify-center gap-2.5">
            {SITIOS_ZONA.vestibular.map((s) => (
              <SiteCard key={s} sitio={s} />
            ))}
          </div>
          <div className="mb-1 text-center text-[10px] uppercase tracking-[.08em] text-[var(--sonda-ink-faint)]">Palatino / Lingual</div>
          <div className="mb-2 flex justify-center gap-2.5">
            {SITIOS_ZONA.palatino.map((s) => (
              <SiteCard key={s} sitio={s} />
            ))}
          </div>

          {armado && (
            <div className="sonda-no-print mt-3.5 rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] p-3">
              <div className="mb-2 text-[11px] text-[var(--sonda-ink-faint)]">
                Diente {piezaActiva} · punto {SITIO_CORTO[armado]}
              </div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {Array.from({ length: 13 }, (_, n) => n).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => registrarSitio(piezaActiva, armado, { profundidadSondaje: n })}
                    className="h-[30px] min-w-[34px] rounded-md border border-[var(--sonda-border)] bg-white px-2 font-[family-name:var(--sonda-mono)] text-[12.5px] hover:border-[var(--sonda-teal)] hover:bg-[var(--sonda-teal-soft)]"
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const dato = sitios.get(claveSitio(piezaActiva, armado));
                    registrarSitio(piezaActiva, armado, { sangrado: !dato?.sangrado });
                  }}
                  className={`h-[30px] rounded-md border px-2 text-[12.5px] ${
                    sitios.get(claveSitio(piezaActiva, armado))?.sangrado
                      ? "border-[var(--sonda-red)] bg-[var(--sonda-red)] text-white"
                      : "border-[var(--sonda-border)] bg-white"
                  }`}
                >
                  Sangrado
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cur = sitios.get(claveSitio(piezaActiva, armado))?.recesion ?? 0;
                    registrarSitio(piezaActiva, armado, { recesion: cur - 1 });
                  }}
                  className="h-[30px] rounded-md border border-[var(--sonda-border)] bg-white px-2 text-[12.5px]"
                >
                  Rec −1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cur = sitios.get(claveSitio(piezaActiva, armado))?.recesion ?? 0;
                    registrarSitio(piezaActiva, armado, { recesion: cur + 1 });
                  }}
                  className="h-[30px] rounded-md border border-[var(--sonda-border)] bg-white px-2 text-[12.5px]"
                >
                  Rec +1
                </button>
                <button
                  type="button"
                  onClick={() => registrarSitio(piezaActiva, armado, { profundidadSondaje: 0, recesion: 0, sangrado: false })}
                  className="h-[30px] rounded-md border border-[var(--sonda-border)] bg-white px-2 text-[12.5px]"
                >
                  Borrar punto
                </button>
                <button
                  type="button"
                  onClick={() => setArmado(null)}
                  className="h-[30px] rounded-md border border-[var(--sonda-ink)] bg-[var(--sonda-ink)] px-2 text-[12.5px] text-white"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sonda-no-print mt-4 flex gap-2 border-t border-[var(--sonda-border)] pt-4">
          <input
            value={simulado}
            onChange={(e) => setSimulado(e.target.value)}
            placeholder='Simular transcripción, ej: "diente 16 vestibular 3 2 3 sangrado vestibular"'
            className="flex-1 rounded-md border border-[var(--sonda-border)] px-2 py-1.5 text-[13px]"
          />
          <button
            type="button"
            onClick={procesarSimulado}
            className="rounded-md border border-[var(--sonda-border)] bg-[var(--sonda-surface)] px-3 py-1.5 text-[12.5px] text-[var(--sonda-ink-soft)] hover:bg-[var(--sonda-surface-2)]"
          >
            Procesar
          </button>
        </div>

        {log.length > 0 && (
          <div className="sonda-no-print mt-3.5 max-h-[150px] overflow-y-auto border-t border-[var(--sonda-border)] pt-2.5 font-[family-name:var(--sonda-mono)] text-[11.5px] leading-[1.6] text-[var(--sonda-ink-soft)]">
            {log.map((entrada, i) => (
              <div key={i}>
                <span className="mr-1.5 text-[var(--sonda-ink-faint)]">{entrada.hora}</span>
                {entrada.texto}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Columna derecha: resumen */}
      <div className="rounded-[10px] border border-[var(--sonda-border)] bg-[var(--sonda-surface)] p-[18px]">
        <h2 className="mb-[14px] text-[12.5px] font-semibold uppercase tracking-[.07em] text-[var(--sonda-ink-faint)]">Resumen clínico</h2>
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-3 py-2.5">
            <div className="font-[family-name:var(--sonda-mono)] text-[20px] font-bold text-[var(--sonda-teal-dark)]">{examinados}/32</div>
            <div className="mt-0.5 text-[10.5px] uppercase tracking-[.05em] text-[var(--sonda-ink-faint)]">Dientes examinados</div>
          </div>
          <div className="rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-3 py-2.5">
            <div className="font-[family-name:var(--sonda-mono)] text-[20px] font-bold text-[var(--sonda-red)]">{resumen.porcentajeSangrado}%</div>
            <div className="mt-0.5 text-[10.5px] uppercase tracking-[.05em] text-[var(--sonda-ink-faint)]">Sangrado (BOP)</div>
          </div>
          <div className="rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-3 py-2.5">
            <div className="font-[family-name:var(--sonda-mono)] text-[20px] font-bold text-[var(--sonda-teal-dark)]">
              {resumen.totalSitios > 0 ? `${resumen.profundidadPromedio} mm` : "—"}
            </div>
            <div className="mt-0.5 text-[10.5px] uppercase tracking-[.05em] text-[var(--sonda-ink-faint)]">Profundidad media</div>
          </div>
          <div className="rounded-lg border border-[var(--sonda-border)] bg-[var(--sonda-surface-2)] px-3 py-2.5">
            <div className="font-[family-name:var(--sonda-mono)] text-[20px] font-bold text-[var(--sonda-red)]">{sitios5mm}</div>
            <div className="mt-0.5 text-[10.5px] uppercase tracking-[.05em] text-[var(--sonda-ink-faint)]">Sitios ≥ 5mm</div>
          </div>
        </div>

        <h2 className="mb-[14px] text-[12.5px] font-semibold uppercase tracking-[.07em] text-[var(--sonda-ink-faint)]">Ficha completa</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-[family-name:var(--sonda-mono)] text-[10.5px]">
            <thead>
              <tr>
                <th className="p-[3px_2px] text-center text-[9px] font-semibold uppercase text-[var(--sonda-ink-faint)]">Diente</th>
                {SITIOS_TABLA.map((s) => (
                  <th key={s} className="p-[3px_2px] text-center text-[9px] font-semibold uppercase text-[var(--sonda-ink-faint)]">
                    {SITIO_CORTO[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECUENCIA_EXAMEN.map((numero) => (
                <tr key={numero}>
                  <td className="border-b border-[var(--sonda-surface-2)] bg-[var(--sonda-surface-2)] p-[3px_1px] text-center font-bold text-[var(--sonda-teal-dark)]">
                    {numero}
                  </td>
                  {SITIOS_TABLA.map((s) => {
                    const dato = sitios.get(claveSitio(numero, s));
                    return (
                      <td
                        key={s}
                        className={`border-b border-[var(--sonda-surface-2)] p-[3px_1px] text-center ${
                          dato?.sangrado
                            ? "bg-[var(--sonda-red-soft)] font-bold text-[var(--sonda-red)]"
                            : dato && dato.profundidadSondaje >= 5
                              ? "font-bold text-[var(--sonda-red)]"
                              : ""
                        }`}
                      >
                        {dato ? dato.profundidadSondaje : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
