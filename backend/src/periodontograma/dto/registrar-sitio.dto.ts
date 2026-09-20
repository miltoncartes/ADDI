import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { SitioDental } from '../entities/sitio-periodontal.entity.js';

export class RegistrarSitioDto {
  @IsUUID()
  sesionId: string;

  @IsInt()
  @Min(11)
  @Max(48)
  numeroPieza: number;

  @IsEnum(SitioDental)
  sitio: SitioDental;

  @IsInt()
  @Min(0)
  @Max(15)
  profundidadSondaje: number;

  @IsOptional()
  @IsInt()
  @Min(-5)
  @Max(15)
  recesion?: number;

  @IsOptional()
  @IsBoolean()
  sangrado?: boolean;
}
