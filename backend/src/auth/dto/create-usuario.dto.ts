import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { RolUsuario } from '../entities/usuario.entity.js';

export class CreateUsuarioDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nombre: string;

  @IsEnum(RolUsuario)
  rol: RolUsuario;
}
