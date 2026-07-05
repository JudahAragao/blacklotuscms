import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { canPerformAction, hasCapability } from '@/lib/auth-utils';
import { BlackLotusCMSError } from '@/lib/errors';
import bcrypt from 'bcryptjs';
import { hookService } from './HookService';

export class UserService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  async create(data: { email: string, passwordHash: string, roleId: string }, user: any) {
    if (!canPerformAction(user, 'user.manage')) {
      throw new BlackLotusCMSError('No permission to create users', 403, 'AUTH_FORBIDDEN');
    }

    const newUser = await this.db.user.create({
      data,
    });

    this.log.info(`New user created: ${data.email}`, { id: newUser.id });
    return newUser;
  }

  async update(id: string, data: any, user: any) {
    const isSelf = user.id === id;
    const isAdmin = hasCapability(user.role, 'user.manage');

    if (!isAdmin && !isSelf) {
      throw new BlackLotusCMSError('No permission to edit this user', 403, 'AUTH_FORBIDDEN');
    }

    // Hook de pré-processamento
    const hookData = await hookService.applyFilters('user.before_update', { id, ...data });

    const updatedUser = await this.db.user.update({
      where: { id },
      data: hookData,
    });

    await hookService.doAction('user.updated', updatedUser);

    this.log.info(`User updated: ${id}`);
    return updatedUser;
  }

  async delete(id: string, user: any) {
    if (!canPerformAction(user, 'user.manage')) {
      throw new BlackLotusCMSError('No permission to delete users', 403, 'AUTH_FORBIDDEN');
    }

    if (user.id === id) {
      throw new BlackLotusCMSError('Você não pode excluir seu próprio usuário', 400, 'VALIDATION_ERROR');
    }

    const deleted = await this.db.user.delete({
      where: { id },
    });

    this.log.warn(`User deleted: ${id}`, { email: deleted.email });
    return deleted;
  }

  async updateRoleCapabilities(roleId: string, capabilities: any, user: any) {
    if (!canPerformAction(user, 'user.manage')) {
      throw new BlackLotusCMSError('No permission to manage roles', 403, 'AUTH_FORBIDDEN');
    }

    const role = await this.db.role.update({
      where: { id: roleId },
      data: { capabilities },
    });

    this.log.info(`Role capabilities updated: ${role.name}`);
    return role;
  }

  // --- Static Proxy ---
  static async create(d: any, u: any) { return userService.create(d, u); }
  static async update(id: string, d: any, u: any) { return userService.update(id, d, u); }
  static async delete(id: string, u: any) { return userService.delete(id, u); }
  static async updateRoleCapabilities(r: string, c: any, u: any) { return userService.updateRoleCapabilities(r, c, u); }
}

export const userService = new UserService();
