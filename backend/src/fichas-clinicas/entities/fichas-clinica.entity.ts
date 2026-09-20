import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity.js';

@Entity('fichas_clinicas')
export class FichasClinica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'paciente_id', unique: true })
  pacienteId: string;

  @Column({ type: 'text', nullable: true })
  antecedentesMedicos?: string;

  @Column({ type: 'text', nullable: true })
  alergias?: string;

  @Column({ type: 'text', nullable: true })
  medicamentosActuales?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
