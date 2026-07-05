import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { logger } from "@/lib/logger";
import { canPerformAction } from "@/lib/auth-utils";
import { BlackLotusCMSError } from "@/lib/errors";

export class ApiKeyService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Generates a new API Key for a user.
   * Returns the key in plain text (should be shown only once).
   */
  async createKey(userId: string, name: string, user: any, expiresDays?: number, rateLimit: number = 60) {
    if (!canPerformAction(user, 'user.manage') && user.id !== userId) {
      throw new BlackLotusCMSError('No permission to create API key for this user', 403, 'AUTH_FORBIDDEN');
    }

    const plainKey = `bl_${crypto.randomBytes(32).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(plainKey).digest("hex");

    let expiresAt = null;
    if (expiresDays && expiresDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresDays);
    }

    const apiKey = await this.db.apiKey.create({
      data: {
        name,
        key: keyHash,
        userId,
        expiresAt,
        rateLimit
      },
    });

    this.log.info(`New API Key generated: ${name}`, { userId, id: apiKey.id });
    return plainKey;
  }

  /**
   * Validates an API Key and returns the full configuration (including rate limit).
   */
  async validateKey(plainKey: string) {
    if (!plainKey || !plainKey.startsWith("bl_")) {
      return null;
    }

    const keyHash = crypto.createHash("sha256").update(plainKey).digest("hex");

    const apiKey = await this.db.apiKey.findUnique({
      where: { key: keyHash },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!apiKey) return null;

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update last usage asynchronously
    this.db.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(err => this.log.error('Error updating lastUsedAt', { err }));

    return {
      user: apiKey.user,
      rateLimit: apiKey.rateLimit,
      id: apiKey.id
    };
  }

  /**
   * Lists all keys for a user.
   */
  async listKeys(userId: string, user: any) {
    if (!canPerformAction(user, 'user.manage') && user.id !== userId) {
      throw new BlackLotusCMSError('No permission to list API keys for this user', 403, 'AUTH_FORBIDDEN');
    }

    return this.db.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
        rateLimit: true,
      },
    });
  }

  /**
   * Removes an API Key.
   */
  async revokeKey(id: string, userId: string, user: any) {
    if (!canPerformAction(user, 'user.manage') && user.id !== userId) {
      throw new BlackLotusCMSError('No permission to revoke API key for this user', 403, 'AUTH_FORBIDDEN');
    }

    const deleted = await this.db.apiKey.delete({
      where: { id, userId },
    });
    this.log.warn(`API Key revoked: ${deleted.name}`, { id, userId });
    return deleted;
  }

  // --- Static Proxy Methods ---
  static async createKey(userId: string, name: string, user: any, expiresDays?: number, rateLimit?: number) {
    return apiKeyService.createKey(userId, name, user, expiresDays, rateLimit);
  }
  static async validateKey(plainKey: string) {
    return apiKeyService.validateKey(plainKey);
  }
  static async listKeys(userId: string, user: any) {
    return apiKeyService.listKeys(userId, user);
  }
  static async revokeKey(id: string, userId: string, user: any) {
    return apiKeyService.revokeKey(id, userId, user);
  }
}

export const apiKeyService = new ApiKeyService();
