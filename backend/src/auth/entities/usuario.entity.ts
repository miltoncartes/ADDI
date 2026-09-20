import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RolUsuario {
  CLINICO = 'clinico',
  ADMINISTRATIVO = 'administrativo',
  AUDITOR = 'auditor',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  /** Excluido por defecto de los SELECT; usar .addSelect('usuario.passwordHash') para validar login. */
  @Column({ select: false })
  passwordHash: string;

  @Column()
  nombre: string;

  @Column({ type: 'enum', enum: RolUsuario })
  rol: RolUsuario;

  @CreateDateColumn()
  createdAt: Date;
}
