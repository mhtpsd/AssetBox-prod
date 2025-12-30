import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as FileType from 'file-type';
import { nanoid } from 'nanoid';

export interface UploadResult {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface FileValidationOptions {
  maxSize: number;
  allowedMimeTypes:  string[];
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly privateBucket: string;
  private readonly publicBucket: string;
  private readonly cdnUrl: string;
  private readonly endpoint: string;

  // Allowed MIME types per asset type
  private readonly allowedMimeTypes:  Record<string, string[]> = {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
    TEXT: ['application/pdf', 'text/plain', 'application/json'],
    TWO_D: [
      'image/png',
      'image/svg+xml',
      'application/postscript',
      'image/vnd.adobe. photoshop',
      'application/octet-stream',
    ],
    THREE_D:  [
      'model/gltf-binary',
      'model/gltf+json',
      'application/octet-stream',
    ],
  };

  // Max file sizes in bytes per asset type
  private readonly maxFileSizes: Record<string, number> = {
    IMAGE: 50 * 1024 * 1024,      // 50MB
    VIDEO: 500 * 1024 * 1024,     // 500MB
    AUDIO: 100 * 1024 * 1024,     // 100MB
    TEXT: 20 * 1024 * 1024,       // 20MB
    TWO_D: 100 * 1024 * 1024,     // 100MB
    THREE_D:  200 * 1024 * 1024,   // 200MB
  };

  constructor(private readonly config: ConfigService) {
    this.endpoint = this.config. get<string>('storage. endpoint')!;
    this.privateBucket = this.config.get<string>('storage.bucketPrivate')!;
    this.publicBucket = this. config.get<string>('storage.bucketPublic')!;
    this. cdnUrl = this.config.get<string>('storage. cdnUrl')!;

    this.s3 = new S3Client({
      endpoint: this.endpoint,
      region: this.config.get<string>('storage. region') || 'auto',
      credentials: {
        accessKeyId: this. config.get<string>('storage.accessKey')!,
        secretAccessKey: this.config.get<string>('storage. secretKey')!,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  /**
   * Upload a file with validation
   */
  async upload(
    file: Buffer,
    originalFilename: string,
    assetType: string,
    options: {
      isPublic?: boolean;
      folder?: string;
    } = {},
  ): Promise<UploadResult> {
    const { isPublic = false, folder = 'assets' } = options;

    // 1. Detect actual MIME type from file content
    const detected = await FileType.fromBuffer(file);
    const mimeType = detected?.mime || 'application/octet-stream';
    const extension = detected?.ext || this.getExtensionFromFilename(originalFilename);

    // 2. Validate MIME type
    const allowedTypes = this.allowedMimeTypes[assetType];
    if (allowedTypes && !this.isMimeTypeAllowed(mimeType, allowedTypes)) {
      throw new BadRequestException(
        `Invalid file type "${mimeType}".  Allowed types for ${assetType}:  ${allowedTypes. join(', ')}`,
      );
    }

    // 3. Validate file size
    const maxSize = this.maxFileSizes[assetType];
    if (maxSize && file.length > maxSize) {
      throw new BadRequestException(
        `File too large. Maximum size for ${assetType}:  ${this.formatBytes(maxSize)}`,
      );
    }

    // 4. Generate unique key
    const key = this.generateKey(folder, extension);
    const bucket = isPublic ?  this.publicBucket : this.privateBucket;

    // 5. Upload to S3
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file,
          ContentType: mimeType,
          CacheControl: 'max-age=31536000', // 1 year cache for immutable files
        }),
      );

      this.logger.log(`File uploaded:  ${key} (${this.formatBytes(file.length)})`);

      return {
        key,
        url: isPublic ? this.getPublicUrl(key) : key,
        mimeType,
        size: file.length,
      };
    } catch (error) {
      this. logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Upload thumbnail/preview to public bucket
   */
  async uploadPublic(
    file: Buffer,
    folder: string,
    extension: string,
  ): Promise<UploadResult> {
    const detected = await FileType.fromBuffer(file);
    const mimeType = detected?.mime || 'application/octet-stream';
    const key = this.generateKey(folder, extension);

    await this.s3.send(
      new PutObjectCommand({
        Bucket:  this.publicBucket,
        Key:  key,
        Body: file,
        ContentType: mimeType,
        CacheControl: 'max-age=31536000',
      }),
    );

    return {
      key,
      url: this.getPublicUrl(key),
      mimeType,
      size: file. length,
    };
  }

  /**
   * Generate a signed URL for private file download
   */
  async getSignedUrl(key: string, expiresIn: number = 900): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket:  this.privateBucket,
        Key:  key,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.cdnUrl}/${this.publicBucket}/${key}`;
  }

  /**
   * Delete a file from storage
   */
  async delete(key:  string, isPublic: boolean = false): Promise<void> {
    try {
      const bucket = isPublic ? this.publicBucket : this.privateBucket;
      
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      // Don't throw - file might already be deleted
    }
  }

  /**
   * Check if a file exists
   */
  async exists(key: string, isPublic: boolean = false): Promise<boolean> {
    try {
      const bucket = isPublic ? this.publicBucket : this.privateBucket;
      
      await this.s3.send(
        new HeadObjectCommand({
          Bucket:  bucket,
          Key: key,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique file key
   */
  private generateKey(folder: string, extension: string): string {
    const timestamp = Date.now();
    const uniqueId = nanoid(12);
    return `${folder}/${timestamp}-${uniqueId}. ${extension}`;
  }

  /**
   * Check if MIME type is allowed (handles octet-stream for binary files)
   */
  private isMimeTypeAllowed(mimeType: string, allowedTypes:  string[]): boolean {
    if (allowedTypes. includes(mimeType)) {
      return true;
    }
    // Allow octet-stream if explicitly in allowed list (for binary formats like . blend, .fbx)
    if (mimeType === 'application/octet-stream' && allowedTypes.includes('application/octet-stream')) {
      return true;
    }
    return false;
  }

  /**
   * Get extension from filename
   */
  private getExtensionFromFilename(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts. pop()!.toLowerCase() : 'bin';
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math. log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  }
}