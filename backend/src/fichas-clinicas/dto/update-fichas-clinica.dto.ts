import { PartialType } from '@nestjs/mapped-types';
import { CreateFichasClinicaDto } from './create-fichas-clinica.dto.js';

export class UpdateFichasClinicaDto extends PartialType(CreateFichasClinicaDto) {}
