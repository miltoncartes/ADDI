import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateSesionPeriodontalDto } from './dto/create-sesion.dto.js';
import { RegistrarSitioDto } from './dto/registrar-sitio.dto.js';
import { RegistrarSitiosBatchDto } from './dto/registrar-sitios-batch.dto.js';
import { PeriodontogramaService } from './periodontograma.service.js';

@Controller('periodontograma')
export class PeriodontogramaController {
  constructor(private readonly periodontogramaService: PeriodontogramaService) {}

  @Post('sesiones')
  crearSesion(@Body() dto: CreateSesionPeriodontalDto) {
    return this.periodontogramaService.crearSesion(dto);
  }

  @Get('sesiones/paciente/:pacienteId')
  findSesionesByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.periodontogramaService.findSesionesByPaciente(pacienteId);
  }

  @Get('sesiones/:id')
  findSesion(@Param('id') id: string) {
    return this.periodontogramaService.findSesion(id);
  }

  @Patch('sesiones/:id/finalizar')
  finalizarSesion(@Param('id') id: string) {
    return this.periodontogramaService.finalizarSesion(id);
  }

  @Post('sitios')
  registrarSitio(@Body() dto: RegistrarSitioDto) {
    return this.periodontogramaService.registrarSitio(dto);
  }

  @Post('sitios/batch')
  registrarSitiosBatch(@Body() dto: RegistrarSitiosBatchDto) {
    return this.periodontogramaService.registrarSitiosBatch(dto.sitios);
  }
}
