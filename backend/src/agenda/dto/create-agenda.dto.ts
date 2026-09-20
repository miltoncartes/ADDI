import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EstadoCita } from '../entities/agenda.entity.js';

export class CreateAgendaDto {
  @IsUUID()
  pacienteId: string;

  @IsString()
  profesional: string;

  @IsDateString()
  fechaHora: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  duracionMinutos?: number;

  @IsOptional()
  @IsEnum(EstadoCita)
  estado?: EstadoCita;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
