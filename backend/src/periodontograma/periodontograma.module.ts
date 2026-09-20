import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeriodontogramaController } from './periodontograma.controller.js';
import { PeriodontogramaService } from './periodontograma.service.js';
import { SesionPeriodontal } from './entities/sesion-periodontal.entity.js';
import { SitioPeriodontal } from './entities/sitio-periodontal.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([SesionPeriodontal, SitioPeriodontal])],
  controllers: [PeriodontogramaController],
  providers: [PeriodontogramaService],
})
export class PeriodontogramaModule {}
