import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../entities/usuario.entity.js';

export const ROLES_KEY = 'roles';

/** Restringe una ruta a uno o más roles (requiere estar además autenticado). */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
