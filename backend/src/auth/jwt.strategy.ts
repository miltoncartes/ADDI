import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RolUsuario } from './entities/usuario.entity.js';

export interface UsuarioAutenticado {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

interface JwtPayload {
  sub: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'addi-dev-secret-cambiar-en-produccion'),
    });
  }

  validate(payload: JwtPayload): UsuarioAutenticado {
    return { id: payload.sub, email: payload.email, nombre: payload.nombre, rol: payload.rol };
  }
}
