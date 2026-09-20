import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service.js';
import { PacientesController } from './pacientes.controller.js';
import { Paciente } from './entities/paciente.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente])],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {}
