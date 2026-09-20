const UNIDADES: Record<string, number> = {
  cero: 0,
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  veintiun: 21,
  veintiuno: 21,
  veintidos: 22,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
};

const DECENAS: Record<string, number> = {
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
};

/** Quita tildes y pasa a minúsculas, para tolerar variaciones del reconocimiento de voz. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export interface NumeroLeido {
  valor: number;
  consumidos: number;
}

/**
 * Lee un número en español (dígitos o palabras, incluyendo compuestos tipo
 * "treinta y ocho") a partir de tokens[indice]. Devuelve null si no hay número ahí.
 */
export function leerNumero(tokens: string[], indice: number): NumeroLeido | null {
  if (indice >= tokens.length) return null;
  const token = tokens[indice];

  if (/^\d+$/.test(token)) {
    return { valor: parseInt(token, 10), consumidos: 1 };
  }

  if (token in UNIDADES) {
    return { valor: UNIDADES[token], consumidos: 1 };
  }

  if (token in DECENAS) {
    const base = DECENAS[token];
    const siguiente = tokens[indice + 1];
    const luego = tokens[indice + 2];
    if (siguiente === "y" && luego && luego in UNIDADES && UNIDADES[luego] < 10) {
      return { valor: base + UNIDADES[luego], consumidos: 3 };
    }
    return { valor: base, consumidos: 1 };
  }

  return null;
}
