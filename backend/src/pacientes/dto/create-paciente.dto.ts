import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { SexoPaciente } from '../entities/paciente.entity.js';

export class CreatePacienteDto {
  @Matches(/^\d{7,8}-[0-9kK]$/, { message: 'RUT inválido, formato esperado 12345678-9' })
  rut: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsEnum(SexoPaciente)
  sexo: SexoPaciente;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
