import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { RolesGuard } from './auth/roles.guard.js';
import { PacientesModule } from './pacientes/pacientes.module.js';
import { OdontogramaModule } from './odontograma/odontograma.module.js';
import { FichasClinicasModule } from './fichas-clinicas/fichas-clinicas.module.js';
import { AgendaModule } from './agenda/agenda.module.js';
import { PeriodontogramaModule } from './periodontograma/periodontograma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'addi'),
        password: config.get<string>('DB_PASSWORD', 'addi'),
        database: config.get<string>('DB_NAME', 'addi'),
        autoLoadEntities: true,
        // Por defecto sincroniza fuera de 'production'. En producción aún no hay
        // sistema de migraciones (pendiente antes de manejar datos clínicos reales),
        // así que DB_SYNCHRONIZE=true permite igual crear el esquema para el MVP/piloto.
        synchronize:
          config.get<string>(
            'DB_SYNCHRONIZE',
            config.get<string>('NODE_ENV', 'development') !== 'production' ? 'true' : 'false',
          ) === 'true',
      }),
    }),
    AuthModule,
    PacientesModule,
    OdontogramaModule,
    FichasClinicasModule,
    AgendaModule,
    PeriodontogramaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Todas las rutas requieren JWT por defecto (usar @Public() para excepciones como /auth/login),
    // y @Roles(...) restringe además por rol cuando corresponde.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
