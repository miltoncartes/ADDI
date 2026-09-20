import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SexoPaciente {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  OTRO = 'otro',
}

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  rut: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ type: 'date' })
  fechaNacimiento: string;

  @Column({ type: 'enum', enum: SexoPaciente })
  sexo: SexoPaciente;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  direccion?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
