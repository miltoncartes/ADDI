import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RolUsuario } from './entities/usuario.entity.js';
import type { UsuarioAutenticado } from './jwt.strategy.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@CurrentUser() usuario: UsuarioAutenticado) {
    return usuario;
  }

  @Roles(RolUsuario.ADMINISTRATIVO)
  @Post('usuarios')
  crearUsuario(@Body() dto: CreateUsuarioDto) {
    return this.authService.crearUsuario(dto);
  }

  @Roles(RolUsuario.ADMINISTRATIVO)
  @Get('usuarios')
  listarUsuarios() {
    return this.authService.listarUsuarios();
  }
}
