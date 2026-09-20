export type SitioDental =
  | "mesiovestibular"
  | "vestibular"
  | "distovestibular"
  | "distopalatino"
  | "palatino"
  | "mesiopalatino";

export const SITIO_LABEL: Record<SitioDental, string> = {
  mesiovestibular: "Mesiovestibular",
  vestibular: "Vestibular",
  distovestibular: "Distovestibular",
  distopalatino: "Distopalatino",
  palatino: "Palatino",
  mesiopalatino: "Mesiopalatino",
};

/** Abreviaturas cortas (MV, V, DV, MP, P, DP), como en el POC de referencia. */
export const SITIO_CORTO: Record<SitioDental, string> = {
  mesiovestibular: "MV",
  vestibular: "V",
  distovestibular: "DV",
  mesiopalatino: "MP",
  palatino: "P",
  distopalatino: "DP",
};

export type EstadoSesionPeriodontal = "en_progreso" | "finalizada";

export interface SesionPeriodontal {
  id: string;
  pacienteId: string;
  examinador: string;
  estado: EstadoSesionPeriodontal;
  observaciones?: string | null;
  fecha: string;
}

export interface SitioPeriodontal {
  id: string;
  sesionId: string;
  numeroPieza: number;
  sitio: SitioDental;
  profundidadSondaje: number;
  recesion: number;
  sangrado: boolean;
}

export interface ResumenPeriodontal {
  totalSitios: number;
  profundidadPromedio: number;
  porcentajeSangrado: number;
  sitiosProfundidad4a5: number;
  sitiosProfundidad6Mas: number;
  nivelInsercionClinicaPromedio: number;
}

export interface SesionPeriodontalDetalle extends SesionPeriodontal {
  sitios: SitioPeriodontal[];
  resumen: ResumenPeriodontal;
}

/** Espejo de backend/src/periodontograma/periodontograma.service.ts#calcularResumen, para mostrar el resumen en tiempo real sin ida y vuelta al servidor. */
export function calcularResumen(sitios: SitioPeriodontal[]): ResumenPeriodontal {
  if (sitios.length === 0) {
    return {
      totalSitios: 0,
      profundidadPromedio: 0,
      porcentajeSangrado: 0,
      sitiosProfundidad4a5: 0,
      sitiosProfundidad6Mas: 0,
      nivelInsercionClinicaPromedio: 0,
    };
  }
  const totalSitios = sitios.length;
  const sumaPD = sitios.reduce((acc, s) => acc + s.profundidadSondaje, 0);
  const sumaCAL = sitios.reduce((acc, s) => acc + s.profundidadSondaje + s.recesion, 0);
  const sitiosConSangrado = sitios.filter((s) => s.sangrado).length;
  return {
    totalSitios,
    profundidadPromedio: Number((sumaPD / totalSitios).toFixed(2)),
    porcentajeSangrado: Number(((sitiosConSangrado / totalSitios) * 100).toFixed(1)),
    sitiosProfundidad4a5: sitios.filter((s) => s.profundidadSondaje >= 4 && s.profundidadSondaje <= 5).length,
    sitiosProfundidad6Mas: sitios.filter((s) => s.profundidadSondaje >= 6).length,
    nivelInsercionClinicaPromedio: Number((sumaCAL / totalSitios).toFixed(2)),
  };
}
