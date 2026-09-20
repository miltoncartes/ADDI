import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';
import { Agenda } from './entities/agenda.entity.js';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Agenda)
    private readonly agendaRepository: Repository<Agenda>,
  ) {}

  create(createAgendaDto: CreateAgendaDto) {
    const cita = this.agendaRepository.create(createAgendaDto);
    return this.agendaRepository.save(cita);
  }

  findAll() {
    return this.agendaRepository.find({ relations: { paciente: true }, order: { fechaHora: 'ASC' } });
  }

  findByPaciente(pacienteId: string) {
    return this.agendaRepository.find({
      where: { pacienteId },
      order: { fechaHora: 'ASC' },
    });
  }

  async findOne(id: string) {
    const cita = await this.agendaRepository.findOne({ where: { id } });
    if (!cita) {
      throw new NotFoundException(`Cita ${id} no encontrada`);
    }
    return cita;
  }

  async update(id: string, updateAgendaDto: UpdateAgendaDto) {
    await this.findOne(id);
    await this.agendaRepository.update(id, updateAgendaDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const cita = await this.findOne(id);
    await this.agendaRepository.remove(cita);
    return cita;
  }
}
