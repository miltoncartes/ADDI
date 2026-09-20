import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { RegistrarSitioDto } from './registrar-sitio.dto.js';

export class RegistrarSitiosBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RegistrarSitioDto)
  sitios: RegistrarSitioDto[];
}
