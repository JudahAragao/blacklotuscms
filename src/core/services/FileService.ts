import fs from 'fs/promises';
import { existsSync, createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';
import { UPLOAD_DIR } from '@/lib/config';
import { BlackLotusCMSError } from '@/lib/errors';

export class FileService {
  constructor(private readonly log = logger) {}

  /**
   * Ensures that a directory exists.
   */
  async ensureDir(dirPath: string) {
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Saves a buffer to a file within the uploads directory.
   */
  async saveFile(buffer: Buffer, filename: string, subDir: string = ''): Promise<string> {
    try {
      const targetDir = path.join(UPLOAD_DIR, subDir);
      await this.ensureDir(targetDir);
      
      const filePath = path.join(targetDir, filename);
      await fs.writeFile(filePath, buffer);
      
      return filePath;
    } catch (error) {
      this.log.error('Failed to save file', { filename, error });
      throw new BlackLotusCMSError('Error writing file to disk', 500, 'INTERNAL_SERVER_ERROR');
    }
  }

  /**
   * Reads the content of a JSON file.
   */
  async readJson<T>(filePath: string): Promise<T | null> {
    try {
      if (!existsSync(filePath)) return null;
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      this.log.error('Failed to read JSON', { filePath, error });
      return null;
    }
  }

  /**
   * Removes a file.
   */
  async deleteFile(filePath: string) {
    try {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      this.log.error('Failed to delete file', { filePath, error });
    }
  }

  /**
   * Lists files in a directory.
   */
  async listDir(dirPath: string): Promise<string[]> {
    try {
      if (!existsSync(dirPath)) return [];
      return await fs.readdir(dirPath);
    } catch (error) {
      this.log.error('Failed to list directory', { dirPath, error });
      return [];
    }
  }
}

export const fileService = new FileService();
