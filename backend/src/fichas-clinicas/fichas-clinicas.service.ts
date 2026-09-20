import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFichasClinicaDto } from './dto/create-fichas-clinica.dto.js';
import { UpdateFichasClinicaDto } from './dto/update-fichas-clinica.dto.js';
import { FichasClinica } from './entities/fichas-clinica.entity.js';

@Injectable()
export class FichasClinicasService {
  constructor(
    @InjectRepository(FichasClinica)
    private readonly fichasClinicasRepository: Repository<FichasClinica>,
  ) {}

  create(createFichasClinicaDto: CreateFichasClinicaDto) {
    const ficha = this.fichasClinicasRepository.create(createFichasClinicaDto);
    return this.fichasClinicasRepository.save(ficha);
  }

  findAll() {
    return this.fichasClinicasRepository.find();
  }

  findByPaciente(pacienteId: string) {
    return this.fichasClinicasRepository.findOne({ where: { pacienteId } });
  }

  async findOne(id: string) {
    const ficha = await this.fichasClinicasRepository.findOne({ where: { id } });
    if (!ficha) {
      throw new NotFoundException(`Ficha clínica ${id} no encontrada`);
    }
    return ficha;
  }

  async update(id: string, updateFichasClinicaDto: UpdateFichasClinicaDto) {
    await this.findOne(id);
    await this.fichasClinicasRepository.update(id, updateFichasClinicaDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const ficha = await this.findOne(id);
    await this.fichasClinicasRepository.remove(ficha);
    return ficha;
  }
}
