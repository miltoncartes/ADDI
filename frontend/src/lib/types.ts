export type SexoPaciente = "masculino" | "femenino" | "otro";

export interface Paciente {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: SexoPaciente;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EstadoPiezaDental =
  | "sano"
  | "caries"
  | "obturado"
  | "ausente"
  | "corona"
  | "endodoncia"
  | "extraccion_indicada"
  | "implante";

export interface PiezaOdontograma {
  id: string;
  pacienteId: string;
  numeroPieza: number;
  estado: EstadoPiezaDental;
  superficie?: string | null;
  observaciones?: string | null;
  fechaRegistro: string;
}

export interface FichaClinica {
  id: string;
  pacienteId: string;
  antecedentesMedicos?: string | null;
  alergias?: string | null;
  medicamentosActuales?: string | null;
  observaciones?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EstadoCita =
  | "pendiente"
  | "confirmada"
  | "atendida"
  | "cancelada"
  | "no_asistio";

export interface Cita {
  id: string;
  pacienteId: string;
  /** Presente solo cuando la API incluye la relación (ej. GET /agenda global). */
  paciente?: Paciente;
  profesional: string;
  fechaHora: string;
  duracionMinutos: number;
  estado: EstadoCita;
  motivo?: string | null;
  observaciones?: string | null;
  createdAt: string;
}
