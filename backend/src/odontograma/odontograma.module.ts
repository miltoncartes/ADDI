import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdontogramaService } from './odontograma.service.js';
import { OdontogramaController } from './odontograma.controller.js';
import { Odontograma } from './entities/odontograma.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Odontograma])],
  controllers: [OdontogramaController],
  providers: [OdontogramaService],
})
export class OdontogramaModule {}
