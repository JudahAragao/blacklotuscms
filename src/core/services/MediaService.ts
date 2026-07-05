import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import { getStorageDriver } from '@/lib/storage';
import { logger } from '@/lib/logger';
import { BlackLotusCMSError } from '@/lib/errors';
import { sanitizeFilename } from '@/lib/utils/string';
import { MediaDTO } from '@/types/dto';
import { canPerformAction } from '@/lib/auth-utils';

export class MediaService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Processes and saves an image in Storage and Database with advanced optimizations.
   */
  async upload(file: File, user: any): Promise<MediaDTO> {
    if (!canPerformAction(user, 'media.upload')) {
      throw new BlackLotusCMSError('No permission to upload media', 403, 'AUTH_FORBIDDEN');
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const storage = await getStorageDriver();
      const timestamp = Date.now();
      const safeFilename = sanitizeFilename(file.name);
      
      // Get original image metadata
      const metadata = await sharp(buffer).metadata();

      // 1. Convert to WebP (Modern Format)
      const processedBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const webpFilename = `${timestamp}-${safeFilename.replace(/\.[^/.]+$/, "")}.webp`;
      const url = await storage.upload(processedBuffer, webpFilename, 'image/webp');

      // 2. Generate Thumbnail (Optimized for Listing)
      const thumbBuffer = await sharp(buffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();
      
      const thumbFilename = `thumb-${webpFilename}`;
      const thumbUrl = await storage.upload(thumbBuffer, thumbFilename, 'image/webp');

      // 3. Persist in Database with Metadata
      const media = await this.db.media.create({
        data: {
          name: safeFilename,
          url,
          thumbnail: thumbUrl,
          mimeType: 'image/webp',
          size: processedBuffer.length,
          // Store dimensions if available
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: 'webp'
          } as any
        }
      });

      this.log.info(`Media uploaded: ${safeFilename}`, { id: media.id });
      return media;
    } catch (error: any) {
      if (error instanceof BlackLotusCMSError) throw error;
      this.log.error('Media upload failed', { 
        message: error?.message, 
        stack: error?.stack,
        error 
      });
      throw new BlackLotusCMSError(`Error processing media file: ${error?.message || 'Unknown error'}`, 500, 'INTERNAL_SERVER_ERROR');
    }
  }

  /**
   * Lists media library with pagination.
   */
  async list(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return await this.db.media.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Removes media from database and physical storage.
   */
  async delete(id: string, user: any) {
    if (!canPerformAction(user, 'media.manage')) {
      throw new BlackLotusCMSError('No permission to delete media', 403, 'AUTH_FORBIDDEN');
    }

    const media = await this.db.media.findUnique({ where: { id } });
    if (!media) throw new BlackLotusCMSError("Media not found", 404, 'RESOURCE_NOT_FOUND');

    const storage = await getStorageDriver();
    
    // Safely extract filename from URL
    try {
      const urlParts = media.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const thumbFilename = `thumb-${filename}`;

      await storage.delete(filename);
      await storage.delete(thumbFilename);
      
      const deletedMedia = await this.db.media.delete({ where: { id } });
      this.log.warn(`Media deleted: ${media.name}`, { id });
      
      return deletedMedia;
    } catch (error) {
      this.log.error('Error deleting physical media files', { error, id });
      // Even if storage deletion fails, we remove from the database to maintain consistency
      return await this.db.media.delete({ where: { id } });
    }
  }

  // --- Static Proxy Methods ---
  static async upload(file: File, user?: any) { return mediaService.upload(file, user); }
  static async list(page?: number, limit?: number) { return mediaService.list(page, limit); }
  static async delete(id: string, user: any) { return mediaService.delete(id, user); }
}

export const mediaService = new MediaService();
