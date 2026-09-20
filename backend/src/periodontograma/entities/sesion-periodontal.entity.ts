import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity.js';
import { SitioPeriodontal } from './sitio-periodontal.entity.js';

export enum EstadoSesionPeriodontal {
  EN_PROGRESO = 'en_progreso',
  FINALIZADA = 'finalizada',
}

/** Un examen periodontal completo de un paciente (una "pasada" de sondaje). */
@Entity('periodontograma_sesiones')
export class SesionPeriodontal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'paciente_id' })
  pacienteId: string;

  @Column()
  examinador: string;

  @Column({ type: 'enum', enum: EstadoSesionPeriodontal, default: EstadoSesionPeriodontal.EN_PROGRESO })
  estado: EstadoSesionPeriodontal;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @OneToMany(() => SitioPeriodontal, (sitio) => sitio.sesion)
  sitios: SitioPeriodontal[];

  @CreateDateColumn()
  fecha: Date;
}
