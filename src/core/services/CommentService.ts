import { prisma } from '@/lib/prisma';
import { settingService } from './SettingService';
import { logger } from '@/lib/logger';
import { CreateCommentSchema, CreateCommentInput } from '@/schemas/comment.schema';
import { BlackLotusCMSError } from '@/lib/errors';
import { canPerformAction } from '@/lib/auth-utils';

export class CommentService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Validates and saves a new comment with basic protections.
   */
  async create(data: CreateCommentInput, ip?: string) {
    const validated = CreateCommentSchema.parse(data);
    
    // 1. Captcha Verification (Optional via Config)
    const captchaEnabled = await settingService.get('captcha_enabled');
    if (captchaEnabled === true && !validated.captchaToken) {
      throw new BlackLotusCMSError("Required captcha not sent.", 400, 'VALIDATION_ERROR');
    }

    // 2. Anti-Spam System
    const isSpam = await this.checkSpam(validated.content, validated.author);
    const status = isSpam ? 'spam' : (await settingService.get('auto_approve_comments') ? 'approved' : 'pending');

    const comment = await this.db.comment.create({
      data: {
        postId: validated.postId,
        author: validated.author,
        email: validated.email,
        content: validated.content,
        parentId: validated.parentId,
        ip: ip,
        status,
      }
    });

    this.log.info(`New comment on post ${validated.postId}`, { id: comment.id, status });
    return comment;
  }

  private async checkSpam(content: string, author: string): Promise<boolean> {
    const blacklist = await settingService.get('spam_blacklist') as string[] || ['casino', 'viagra', 'buy-now', 'crypto-link'];
    
    const lowerContent = content.toLowerCase();
    const lowerAuthor = author.toLowerCase();

    const linkCount = (content.match(/https?:\/\//g) || []).length;
    if (linkCount > 2) return true;

    return blacklist.some(word => lowerContent.includes(word) || lowerAuthor.includes(word));
  }

  async getForPost(postId: string) {
    return await this.db.comment.findMany({
      where: { postId, status: 'approved', parentId: null },
      include: {
        replies: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async delete(id: string, user: any) {
    if (!canPerformAction(user, 'comment.manage')) {
      throw new BlackLotusCMSError('No permission to delete comments', 403, 'AUTH_FORBIDDEN');
    }

    const deleted = await this.db.comment.delete({ where: { id } });
    this.log.warn(`Comment deleted: ${id}`, { author: deleted.author });
    return deleted;
  }

  // --- Static Proxy ---
  static async create(data: any, ip?: string) { return commentService.create(data, ip); }
  static async getForPost(postId: string) { return commentService.getForPost(postId); }
  static async delete(id: string, user: any) { return commentService.delete(id, user); }
}

export const commentService = new CommentService();
