import { IsEnum, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { EstadoPiezaDental } from '../entities/odontograma.entity.js';

export class CreateOdontogramaDto {
  @IsUUID()
  pacienteId: string;

  @Min(11)
  @Max(85)
  numeroPieza: number;

  @IsEnum(EstadoPiezaDental)
  estado: EstadoPiezaDental;

  @IsOptional()
  @IsString()
  superficie?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
