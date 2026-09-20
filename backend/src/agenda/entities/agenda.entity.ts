import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity.js';

export enum EstadoCita {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  ATENDIDA = 'atendida',
  CANCELADA = 'cancelada',
  NO_ASISTIO = 'no_asistio',
}

@Entity('agenda_citas')
export class Agenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'paciente_id' })
  pacienteId: string;

  @Column()
  profesional: string;

  @Column({ type: 'timestamptz' })
  fechaHora: Date;

  @Column({ type: 'smallint', default: 30 })
  duracionMinutos: number;

  @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.PENDIENTE })
  estado: EstadoCita;

  @Column({ nullable: true })
  motivo?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  createdAt: Date;
}
