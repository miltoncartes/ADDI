import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OdontogramaService } from './odontograma.service.js';
import { CreateOdontogramaDto } from './dto/create-odontograma.dto.js';
import { UpdateOdontogramaDto } from './dto/update-odontograma.dto.js';

@Controller('odontograma')
export class OdontogramaController {
  constructor(private readonly odontogramaService: OdontogramaService) {}

  @Post()
  create(@Body() createOdontogramaDto: CreateOdontogramaDto) {
    return this.odontogramaService.create(createOdontogramaDto);
  }

  @Get()
  findAll() {
    return this.odontogramaService.findAll();
  }

  @Get('paciente/:pacienteId')
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.odontogramaService.findByPaciente(pacienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.odontogramaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOdontogramaDto: UpdateOdontogramaDto) {
    return this.odontogramaService.update(id, updateOdontogramaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.odontogramaService.remove(id);
  }
}
