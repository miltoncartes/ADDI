import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SesionPeriodontal } from './sesion-periodontal.entity.js';

export enum SitioDental {
  MESIOVESTIBULAR = 'mesiovestibular',
  VESTIBULAR = 'vestibular',
  DISTOVESTIBULAR = 'distovestibular',
  DISTOPALATINO = 'distopalatino',
  PALATINO = 'palatino',
  MESIOPALATINO = 'mesiopalatino',
}

/** Recorrido clínico estándar de sondaje ("en U"): vestibular distal→mesial, luego palatino/lingual mesial→distal. */
export const ORDEN_SITIOS: SitioDental[] = [
  SitioDental.DISTOVESTIBULAR,
  SitioDental.VESTIBULAR,
  SitioDental.MESIOVESTIBULAR,
  SitioDental.MESIOPALATINO,
  SitioDental.PALATINO,
  SitioDental.DISTOPALATINO,
];

/** Una medición (uno de los 6 sitios de una pieza) dentro de una sesión de sondaje. */
@Entity('periodontograma_sitios')
@Unique('uq_sitio_por_sesion', ['sesionId', 'numeroPieza', 'sitio'])
export class SitioPeriodontal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SesionPeriodontal, (sesion) => sesion.sitios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sesion_id' })
  sesion: SesionPeriodontal;

  @Column({ name: 'sesion_id' })
  @Index()
  sesionId: string;

  @Column({ type: 'smallint' })
  numeroPieza: number;

  @Column({ type: 'enum', enum: SitioDental })
  sitio: SitioDental;

  @Column({ type: 'smallint' })
  profundidadSondaje: number;

  /** Positiva = margen gingival apical al límite amelocementario (recesión real). Negativa = margen coronal (encía hiperplásica). */
  @Column({ type: 'smallint', default: 0 })
  recesion: number;

  @Column({ default: false })
  sangrado: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
