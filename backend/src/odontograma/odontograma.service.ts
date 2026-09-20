import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOdontogramaDto } from './dto/create-odontograma.dto.js';
import { UpdateOdontogramaDto } from './dto/update-odontograma.dto.js';
import { Odontograma } from './entities/odontograma.entity.js';

@Injectable()
export class OdontogramaService {
  constructor(
    @InjectRepository(Odontograma)
    private readonly odontogramaRepository: Repository<Odontograma>,
  ) {}

  create(createOdontogramaDto: CreateOdontogramaDto) {
    const pieza = this.odontogramaRepository.create(createOdontogramaDto);
    return this.odontogramaRepository.save(pieza);
  }

  findAll() {
    return this.odontogramaRepository.find();
  }

  /** Devuelve el odontograma completo (todas las piezas registradas) de un paciente. */
  findByPaciente(pacienteId: string) {
    return this.odontogramaRepository.find({
      where: { pacienteId },
      order: { numeroPieza: 'ASC' },
    });
  }

  async findOne(id: string) {
    const pieza = await this.odontogramaRepository.findOne({ where: { id } });
    if (!pieza) {
      throw new NotFoundException(`Registro de odontograma ${id} no encontrado`);
    }
    return pieza;
  }

  async update(id: string, updateOdontogramaDto: UpdateOdontogramaDto) {
    await this.findOne(id);
    await this.odontogramaRepository.update(id, updateOdontogramaDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const pieza = await this.findOne(id);
    await this.odontogramaRepository.remove(pieza);
    return pieza;
  }
}
