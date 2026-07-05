import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs/promises";
import path from "path";
import { prisma } from "./prisma";

export interface StorageDriver {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(filename: string): Promise<void>;
}

class LocalDriver implements StorageDriver {
  private uploadDir: string = process.env.UPLOAD_DIR || "./public/uploads";

  async upload(file: Buffer, filename: string): Promise<string> {
    const fullPath = path.join(process.cwd(), this.uploadDir, filename);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file);
    const publicPath = this.uploadDir.replace(/^\.\/public\/?/, '').replace(/^public\/?/, '');
    return `/${path.join(publicPath, filename)}`;
  }

  async delete(filename: string): Promise<void> {
    const fullPath = path.join(process.cwd(), this.uploadDir, filename);
    await fs.unlink(fullPath);
  }
}

class S3Driver implements StorageDriver {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: any) {
    this.client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: filename,
        Body: file,
        ContentType: mimeType,
      },
    });
    await upload.done();
    return `${this.publicUrl}/${filename}`;
  }

  async delete(filename: string): Promise<void> { /* Implement real delete */ }
}

export const getStorageDriver = async (): Promise<StorageDriver> => {
  const dbSetting = await prisma.setting.findUnique({ where: { key: 'storage_driver' } });
  const driver = (dbSetting?.value as string) || process.env.STORAGE_DRIVER || "local";
  
  if (driver === "s3" || driver === "r2") {
    const s3Config = await prisma.setting.findUnique({ where: { key: 's3_config' } });
    const config = (s3Config?.value as any) || {
      endpoint: process.env.S3_ENDPOINT,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      bucket: process.env.S3_BUCKET,
      publicUrl: process.env.S3_PUBLIC_URL,
    };
    return new S3Driver(config);
  }
  return new LocalDriver();
};
