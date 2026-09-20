import { leerNumero, normalizar } from "./spanish-numbers";
import type { SitioDental } from "./periodontal";

/** Recorrido clínico estándar de sondaje ("en U") — debe calzar con backend/src/periodontograma. */
export const ORDEN_SITIOS: SitioDental[] = [
  "distovestibular",
  "vestibular",
  "mesiovestibular",
  "mesiopalatino",
  "palatino",
  "distopalatino",
];

/** Secuencia FDI típica de un examen periodontal completo (boca completa). */
export const FDI_SUPERIOR: number[] = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const FDI_INFERIOR: number[] = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
export const SECUENCIA_EXAMEN: number[] = [...FDI_SUPERIOR, ...FDI_INFERIOR];

type Zona = "vestibular" | "palatino";

/** Sitios de cada zona, mesial→distal (así se interpreta "vestibular 3 2 3" o "palatino 2 2 3"). */
export const SITIOS_ZONA: Record<Zona, SitioDental[]> = {
  vestibular: ["mesiovestibular", "vestibular", "distovestibular"],
  palatino: ["mesiopalatino", "palatino", "distopalatino"],
};

/** Orden de visualización (tabla y tarjetas de sitio): MV, V, DV, MP, P, DP — como en el POC de referencia. */
export const SITIOS_TABLA: SitioDental[] = [...SITIOS_ZONA.vestibular, ...SITIOS_ZONA.palatino];

const ZONA_PALABRAS: Record<string, Zona> = {
  vestibular: "vestibular",
  bucal: "vestibular",
  palatino: "palatino",
  lingual: "palatino",
};

const SITIO_PALABRAS: Record<string, SitioDental> = {
  mesiovestibular: "mesiovestibular",
  distovestibular: "distovestibular",
  mesiopalatino: "mesiopalatino",
  distopalatino: "distopalatino",
  mesiolingual: "mesiopalatino",
  distolingual: "distopalatino",
  vestibular: "vestibular",
  bucal: "vestibular",
  palatino: "palatino",
  lingual: "palatino",
};

function leerSitio(tokens: string[], indice: number): { sitio?: SitioDental; consumidos: number } {
  if (indice >= tokens.length) return { consumidos: 0 };
  const combinado = tokens[indice + 1] ? tokens[indice] + tokens[indice + 1] : "";
  if (combinado && SITIO_PALABRAS[combinado]) {
    return { sitio: SITIO_PALABRAS[combinado], consumidos: 2 };
  }
  if (SITIO_PALABRAS[tokens[indice]]) {
    return { sitio: SITIO_PALABRAS[tokens[indice]], consumidos: 1 };
  }
  return { consumidos: 0 };
}

/** Lee uno o más sitios separados por "y" o "," a partir de tokens[indice]. */
function leerSitios(tokens: string[], indice: number): { sitios: SitioDental[]; consumidos: number } {
  const sitios: SitioDental[] = [];
  let i = indice;
  while (true) {
    const { sitio, consumidos } = leerSitio(tokens, i);
    if (!sitio) break;
    sitios.push(sitio);
    i += consumidos;
    if (tokens[i] === "y" || tokens[i] === ",") {
      i += 1;
      continue;
    }
    break;
  }
  return { sitios, consumidos: i - indice };
}

/** Lee hasta 3 números consecutivos (mesial→distal de una zona) a partir de tokens[indice]. */
function leerHastaTresNumeros(tokens: string[], indice: number): { valores: number[]; consumidos: number } {
  const valores: number[] = [];
  let i = indice;
  while (valores.length < 3) {
    const n = leerNumero(tokens, i);
    if (!n) break;
    valores.push(n.valor);
    i += n.consumidos;
  }
  return { valores, consumidos: i - indice };
}

export type EventoVoz =
  | { tipo: "pieza"; numeroPieza: number }
  | { tipo: "profundidades"; valores: number[] }
  | { tipo: "zona"; zona: Zona; valores: number[]; modo: "profundidad" | "recesion" }
  | { tipo: "sangrado"; sitios: SitioDental[]; valor: boolean }
  | { tipo: "recesion"; sitios: SitioDental[]; valor: number }
  | { tipo: "siguiente" }
  | { tipo: "anterior" }
  | { tipo: "repetir" }
  | { tipo: "deshacer" }
  | { tipo: "borrar" }
  | { tipo: "guardar" };

const PALABRAS_PIEZA = new Set(["pieza", "diente"]);
const PALABRAS_SANGRADO = new Set(["sangra", "sangrado"]);
const PALABRAS_RECESION = new Set(["recesion"]);
const PALABRAS_GUARDAR = new Set(["guardar", "terminado", "listo", "finalizar"]);

/**
 * Interpreta una frase ya transcrita (un resultado "final" del reconocimiento de voz)
 * y la convierte en una lista de eventos estructurados del protocolo de dictado periodontal.
 * Vocabulario alineado con la prueba de concepto previa (sonda_periodontograma_voz.html):
 * "diente 16", "vestibular 3 2 3", "palatino 2 2 3", "recesión vestibular 1 0 1",
 * "sangrado vestibular/palatino/todo/no", "siguiente", "anterior", "borrar".
 */
export function parseUtterance(rawTranscript: string): EventoVoz[] {
  const texto = normalizar(rawTranscript);
  const tokens = texto.split(/\s+/).filter(Boolean);
  const eventos: EventoVoz[] = [];
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i];

    if (PALABRAS_PIEZA.has(tok)) {
      const n = leerNumero(tokens, i + 1);
      if (n) {
        eventos.push({ tipo: "pieza", numeroPieza: n.valor });
        i += 1 + n.consumidos;
        continue;
      }
    }

    if (tok === "siguiente") {
      eventos.push({ tipo: "siguiente" });
      i += tokens[i + 1] === "pieza" ? 2 : 1;
      continue;
    }

    if (tok === "anterior") {
      eventos.push({ tipo: "anterior" });
      i += 1;
      continue;
    }

    if (tok === "repetir") {
      eventos.push({ tipo: "repetir" });
      i += 1;
      continue;
    }

    if (tok === "deshacer") {
      eventos.push({ tipo: "deshacer" });
      i += 1;
      continue;
    }

    if (tok === "borrar") {
      eventos.push({ tipo: "borrar" });
      i += 1;
      continue;
    }

    if (PALABRAS_GUARDAR.has(tok)) {
      eventos.push({ tipo: "guardar" });
      i += 1;
      continue;
    }

    if (PALABRAS_RECESION.has(tok)) {
      const zonaSiguiente = tokens[i + 1] ? ZONA_PALABRAS[tokens[i + 1]] : undefined;
      if (zonaSiguiente) {
        const { valores, consumidos } = leerHastaTresNumeros(tokens, i + 2);
        eventos.push({ tipo: "zona", zona: zonaSiguiente, valores, modo: "recesion" });
        i += 2 + consumidos;
        continue;
      }
      const { sitios, consumidos } = leerSitios(tokens, i + 1);
      const n = leerNumero(tokens, i + 1 + consumidos);
      if (n) {
        eventos.push({ tipo: "recesion", sitios, valor: n.valor });
        i += 1 + consumidos + n.consumidos;
        continue;
      }
    }

    if (PALABRAS_SANGRADO.has(tok)) {
      let j = i + 1;
      let valor = true;
      let sitios: SitioDental[] = [];
      const siguiente = tokens[j];
      if (siguiente === "todo" || siguiente === "general") {
        sitios = [...ORDEN_SITIOS];
        j += 1;
      } else if (siguiente === "no" || siguiente === "negativo" || siguiente === "ninguno") {
        valor = false;
        j += 1;
      } else if (siguiente && siguiente in ZONA_PALABRAS) {
        sitios = SITIOS_ZONA[ZONA_PALABRAS[siguiente]];
        j += 1;
      } else {
        const r = leerSitios(tokens, j);
        sitios = r.sitios;
        j += r.consumidos;
      }
      eventos.push({ tipo: "sangrado", sitios, valor });
      i = j;
      continue;
    }

    if (tok in ZONA_PALABRAS) {
      const zona = ZONA_PALABRAS[tok];
      const { valores, consumidos } = leerHastaTresNumeros(tokens, i + 1);
      if (valores.length > 0) {
        eventos.push({ tipo: "zona", zona, valores, modo: "profundidad" });
        i += 1 + consumidos;
        continue;
      }
    }

    const n = leerNumero(tokens, i);
    if (n) {
      const valores = [n.valor];
      let j = i + n.consumidos;
      while (true) {
        const sig = leerNumero(tokens, j);
        if (!sig) break;
        valores.push(sig.valor);
        j += sig.consumidos;
      }
      eventos.push({ tipo: "profundidades", valores });
      i = j;
      continue;
    }

    // Palabra no reconocida (relleno del reconocimiento de voz): se ignora.
    i += 1;
  }

  return eventos;
}
