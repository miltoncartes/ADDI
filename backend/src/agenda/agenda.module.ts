import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaService } from './agenda.service.js';
import { AgendaController } from './agenda.controller.js';
import { Agenda } from './entities/agenda.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Agenda])],
  controllers: [AgendaController],
  providers: [AgendaService],
})
export class AgendaModule {}
