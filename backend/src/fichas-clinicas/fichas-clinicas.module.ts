import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FichasClinicasService } from './fichas-clinicas.service.js';
import { FichasClinicasController } from './fichas-clinicas.controller.js';
import { FichasClinica } from './entities/fichas-clinica.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([FichasClinica])],
  controllers: [FichasClinicasController],
  providers: [FichasClinicasService],
})
export class FichasClinicasModule {}
