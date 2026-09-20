import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSesionPeriodontalDto } from './dto/create-sesion.dto.js';
import { RegistrarSitioDto } from './dto/registrar-sitio.dto.js';
import { EstadoSesionPeriodontal, SesionPeriodontal } from './entities/sesion-periodontal.entity.js';
import { SitioPeriodontal } from './entities/sitio-periodontal.entity.js';

export interface ResumenPeriodontal {
  totalSitios: number;
  profundidadPromedio: number;
  porcentajeSangrado: number;
  sitiosProfundidad4a5: number;
  sitiosProfundidad6Mas: number;
  nivelInsercionClinicaPromedio: number;
}

@Injectable()
export class PeriodontogramaService {
  constructor(
    @InjectRepository(SesionPeriodontal)
    private readonly sesionesRepository: Repository<SesionPeriodontal>,
    @InjectRepository(SitioPeriodontal)
    private readonly sitiosRepository: Repository<SitioPeriodontal>,
  ) {}

  crearSesion(dto: CreateSesionPeriodontalDto) {
    const sesion = this.sesionesRepository.create(dto);
    return this.sesionesRepository.save(sesion);
  }

  findSesionesByPaciente(pacienteId: string) {
    return this.sesionesRepository.find({ where: { pacienteId }, order: { fecha: 'DESC' } });
  }

  private async obtenerSesionOFallar(id: string) {
    const sesion = await this.sesionesRepository.findOne({ where: { id } });
    if (!sesion) {
      throw new NotFoundException(`Sesión periodontal ${id} no encontrada`);
    }
    return sesion;
  }

  async findSesion(id: string) {
    const sesion = await this.obtenerSesionOFallar(id);
    const sitios = await this.sitiosRepository.find({
      where: { sesionId: id },
      order: { numeroPieza: 'ASC' },
    });
    return { ...sesion, sitios, resumen: this.calcularResumen(sitios) };
  }

  async finalizarSesion(id: string) {
    await this.obtenerSesionOFallar(id);
    await this.sesionesRepository.update(id, { estado: EstadoSesionPeriodontal.FINALIZADA });
    return this.findSesion(id);
  }

  async registrarSitio(dto: RegistrarSitioDto) {
    const existente = await this.sitiosRepository.findOne({
      where: { sesionId: dto.sesionId, numeroPieza: dto.numeroPieza, sitio: dto.sitio },
    });
    if (existente) {
      await this.sitiosRepository.update(existente.id, dto);
      return this.sitiosRepository.findOneOrFail({ where: { id: existente.id } });
    }
    const nuevo = this.sitiosRepository.create(dto);
    return this.sitiosRepository.save(nuevo);
  }

  async registrarSitiosBatch(dtos: RegistrarSitioDto[]) {
    const resultados: SitioPeriodontal[] = [];
    for (const dto of dtos) {
      resultados.push(await this.registrarSitio(dto));
    }
    return resultados;
  }

  private calcularResumen(sitios: SitioPeriodontal[]): ResumenPeriodontal {
    if (sitios.length === 0) {
      return {
        totalSitios: 0,
        profundidadPromedio: 0,
        porcentajeSangrado: 0,
        sitiosProfundidad4a5: 0,
        sitiosProfundidad6Mas: 0,
        nivelInsercionClinicaPromedio: 0,
      };
    }
    const totalSitios = sitios.length;
    const sumaPD = sitios.reduce((acc, s) => acc + s.profundidadSondaje, 0);
    const sumaCAL = sitios.reduce((acc, s) => acc + s.profundidadSondaje + s.recesion, 0);
    const sitiosConSangrado = sitios.filter((s) => s.sangrado).length;
    return {
      totalSitios,
      profundidadPromedio: Number((sumaPD / totalSitios).toFixed(2)),
      porcentajeSangrado: Number(((sitiosConSangrado / totalSitios) * 100).toFixed(1)),
      sitiosProfundidad4a5: sitios.filter((s) => s.profundidadSondaje >= 4 && s.profundidadSondaje <= 5).length,
      sitiosProfundidad6Mas: sitios.filter((s) => s.profundidadSondaje >= 6).length,
      nivelInsercionClinicaPromedio: Number((sumaCAL / totalSitios).toFixed(2)),
    };
  }
}
