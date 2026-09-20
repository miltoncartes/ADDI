import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RolUsuario, Usuario } from './entities/usuario.entity.js';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Crea un administrador inicial si la base de datos no tiene ningún usuario aún. */
  async onModuleInit() {
    const totalUsuarios = await this.usuariosRepository.count();
    if (totalUsuarios > 0) return;

    const email = this.config.get<string>('ADMIN_SEED_EMAIL', 'admin@addi.cl');
    const password = this.config.get<string>('ADMIN_SEED_PASSWORD', 'addi-admin-2026');
    await this.crearUsuario({ email, password, nombre: 'Administrador ADDI', rol: RolUsuario.ADMINISTRATIVO });
    // eslint-disable-next-line no-console
    console.log(`[auth] Usuario administrador inicial creado: ${email} / ${password} (cámbialo tras el primer login)`);
  }

  async crearUsuario(dto: CreateUsuarioDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepository.create({
      email: dto.email,
      nombre: dto.nombre,
      rol: dto.rol,
      passwordHash,
    });
    const guardado = await this.usuariosRepository.save(usuario);
    return this.sinPassword(guardado);
  }

  async listarUsuarios() {
    const usuarios = await this.usuariosRepository.find({ order: { createdAt: 'ASC' } });
    return usuarios.map((u) => this.sinPassword(u));
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .where('usuario.email = :email', { email: dto.email })
      .getOne();

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.passwordHash))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const payload = { sub: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: this.sinPassword(usuario),
    };
  }

  private sinPassword(usuario: Usuario) {
    const { passwordHash: _passwordHash, ...resto } = usuario;
    return resto;
  }
}
