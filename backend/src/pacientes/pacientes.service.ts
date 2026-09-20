import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePacienteDto } from './dto/create-paciente.dto.js';
import { UpdatePacienteDto } from './dto/update-paciente.dto.js';
import { Paciente } from './entities/paciente.entity.js';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacientesRepository: Repository<Paciente>,
  ) {}

  create(createPacienteDto: CreatePacienteDto) {
    const paciente = this.pacientesRepository.create(createPacienteDto);
    return this.pacientesRepository.save(paciente);
  }

  findAll() {
    return this.pacientesRepository.find();
  }

  async findOne(id: string) {
    const paciente = await this.pacientesRepository.findOne({ where: { id } });
    if (!paciente) {
      throw new NotFoundException(`Paciente ${id} no encontrado`);
    }
    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto) {
    await this.findOne(id);
    await this.pacientesRepository.update(id, updatePacienteDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const paciente = await this.findOne(id);
    await this.pacientesRepository.remove(paciente);
    return paciente;
  }
}
