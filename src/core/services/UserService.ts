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

  async exportData(id: string, user: any) {
    const isSelf = user.id === id;
    const isAdmin = hasCapability(user.role, 'user.manage');

    if (!isAdmin && !isSelf) {
      throw new BlackLotusCMSError('No permission to export this user data', 403, 'AUTH_FORBIDDEN');
    }

    const userData = await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { name: true } },
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            status: true,
            createdAt: true,
          },
        },
        apiKeys: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userData) {
      throw new BlackLotusCMSError('User not found', 404, 'RESOURCE_NOT_FOUND');
    }

    this.log.info(`User data exported: ${id}`);
    return {
      exportDate: new Date().toISOString(),
      user: userData,
    };
  }

  async deleteAccount(id: string, user: any) {
    const isSelf = user.id === id;
    const isAdmin = hasCapability(user.role, 'user.manage');

    if (!isAdmin && !isSelf) {
      throw new BlackLotusCMSError('No permission to delete this account', 403, 'AUTH_FORBIDDEN');
    }

    if (isSelf && isAdmin) {
      const userCount = await this.db.user.count();
      if (userCount <= 1) {
        throw new BlackLotusCMSError('Cannot delete the last admin user', 400, 'VALIDATION_ERROR');
      }
    }

    return await this.db.$transaction(async (tx) => {
      // Delete associated data
      await tx.postTerm.deleteMany({ where: { post: { authorId: id } } });
      await tx.metaValue.deleteMany({ where: { post: { authorId: id } } });
      await tx.comment.deleteMany({ where: { post: { authorId: id } } });
      await tx.post.deleteMany({ where: { authorId: id } });
      await tx.apiKey.deleteMany({ where: { userId: id } });

      // Delete user
      const deleted = await tx.user.delete({ where: { id } });

      this.log.warn(`User account deleted (LGPD): ${id}`, { email: deleted.email });
      return deleted;
    });
  }

  // --- Static Proxy ---
  static async create(d: any, u: any) { return userService.create(d, u); }
  static async update(id: string, d: any, u: any) { return userService.update(id, d, u); }
  static async delete(id: string, u: any) { return userService.delete(id, u); }
  static async updateRoleCapabilities(r: string, c: any, u: any) { return userService.updateRoleCapabilities(r, c, u); }
  static async exportData(id: string, u: any) { return userService.exportData(id, u); }
  static async deleteAccount(id: string, u: any) { return userService.deleteAccount(id, u); }
}

export const userService = new UserService();
