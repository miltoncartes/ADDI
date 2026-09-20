import { PartialType } from '@nestjs/mapped-types';
import { CreateOdontogramaDto } from './create-odontograma.dto.js';

export class UpdateOdontogramaDto extends PartialType(CreateOdontogramaDto) {}
