import { PartialType } from '@nestjs/mapped-types';
import { CreatePacienteDto } from './create-paciente.dto.js';

export class UpdatePacienteDto extends PartialType(CreatePacienteDto) {}
