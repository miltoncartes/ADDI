import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity.js';

export enum EstadoPiezaDental {
  SANO = 'sano',
  CARIES = 'caries',
  OBTURADO = 'obturado',
  AUSENTE = 'ausente',
  CORONA = 'corona',
  ENDODONCIA = 'endodoncia',
  EXTRACCION_INDICADA = 'extraccion_indicada',
  IMPLANTE = 'implante',
}

/** Un registro por pieza dental evaluada, en notación FDI (11-18/21-28/31-38/41-48, 55-85 en dentición temporal). */
@Entity('odontograma_piezas')
export class Odontograma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'paciente_id' })
  pacienteId: string;

  @Column({ type: 'smallint' })
  numeroPieza: number;

  @Column({ type: 'enum', enum: EstadoPiezaDental, default: EstadoPiezaDental.SANO })
  estado: EstadoPiezaDental;

  @Column({ nullable: true })
  superficie?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  fechaRegistro: Date;
}
