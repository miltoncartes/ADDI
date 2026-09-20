import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgendaService } from './agenda.service.js';
import { CreateAgendaDto } from './dto/create-agenda.dto.js';
import { UpdateAgendaDto } from './dto/update-agenda.dto.js';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post()
  create(@Body() createAgendaDto: CreateAgendaDto) {
    return this.agendaService.create(createAgendaDto);
  }

  @Get()
  findAll() {
    return this.agendaService.findAll();
  }

  @Get('paciente/:pacienteId')
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.agendaService.findByPaciente(pacienteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgendaDto: UpdateAgendaDto) {
    return this.agendaService.update(id, updateAgendaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agendaService.remove(id);
  }
}
