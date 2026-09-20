import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSesionPeriodontalDto {
  @IsUUID()
  pacienteId: string;

  @IsString()
  examinador: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
