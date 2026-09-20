import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FichasClinicasService } from './fichas-clinicas.service.js';
import { CreateFichasClinicaDto } from './dto/create-fichas-clinica.dto.js';
import { UpdateFichasClinicaDto } from './dto/update-fichas-clinica.dto.js';

@Controller('fichas-clinicas')
export class FichasClinicasController {
  constructor(private readonly fichasClinicasService: FichasClinicasService) {}

  @Post()
  create(@Body() createFichasClinicaDto: CreateFichasClinicaDto) {
    return this.fichasClinicasService.create(createFichasClinicaDto);
  }

  @Get()
  findAll() {
    return this.fichasClinicasService.findAll();
  }

  @Get('paciente/:pacienteId')
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.fichasClinicasService.findByPaciente(pacienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fichasClinicasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFichasClinicaDto: UpdateFichasClinicaDto) {
    return this.fichasClinicasService.update(id, updateFichasClinicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fichasClinicasService.remove(id);
  }
}
