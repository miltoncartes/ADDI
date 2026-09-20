import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFichasClinicaDto {
  @IsUUID()
  pacienteId: string;

  @IsOptional()
  @IsString()
  antecedentesMedicos?: string;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsString()
  medicamentosActuales?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
