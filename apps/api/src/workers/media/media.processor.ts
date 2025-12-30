import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { createCanvas } from 'canvas';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { StorageService } from '../../services/storage/storage.service';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

interface GeneratePreviewJob {
  assetId: string;
  assetType: string;
  files: Array<{
    key: string;
    mimeType: string;
  }>;
}

@Processor('media', {
  concurrency: 2, // Process 2 jobs at a time
})
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {
    super();
  }

  async process(job: Job<GeneratePreviewJob>): Promise<any> {
    const { assetId, assetType, files } = job.data;

    this.logger.log(`Processing media for asset: ${assetId} (${assetType})`);

    try {
      switch (assetType) {
        case 'IMAGE':
        case 'TWO_D': 
          await this.processImage(assetId, files[0]);
          break;
        case 'VIDEO':
          await this. processVideo(assetId, files[0]);
          break;
        case 'AUDIO': 
          await this.processAudio(assetId, files[0]);
          break;
        case 'THREE_D':
          await this. process3D(assetId, files[0]);
          break;
        case 'TEXT':
          await this.processText(assetId, files[0]);
          break;
        default:
          this.logger.warn(`Unknown asset type: ${assetType}`);
      }

      await job.updateProgress(100);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to process media:  ${error.message}`);
      throw error;
    }
  }

  /**
   * Process image files - generate thumbnail & preview
   */
  private async processImage(
    assetId: string,
    file: { key: string; mimeType:  string },
  ) {
    await this.updateProgress(10);

    // Get signed URL to download original
    const signedUrl = await this.storage.getSignedUrl(file.key, 3600);

    // Fetch the file
    const response = await fetch(signedUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    await this.updateProgress(30);

    // Generate thumbnail (400x400, cover)
    const thumbnail = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    await this.updateProgress(50);

    // Generate preview (1200px wide, maintain aspect)
    const preview = await sharp(buffer)
      .resize(1200, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    await this.updateProgress(70);

    // Add watermark to preview
    const watermarkedPreview = await this.addWatermark(preview);

    await this.updateProgress(80);

    // Upload thumbnail
    const thumbnailResult = await this.storage.uploadPublic(
      thumbnail,
      'assets/thumbnails',
      'jpg',
    );

    // Upload preview
    const previewResult = await this.storage.uploadPublic(
      watermarkedPreview,
      'assets/previews',
      'jpg',
    );

    await this.updateProgress(90);

    // Save to database
    await this.prisma.assetFile.createMany({
      data: [
        {
          assetId,
          fileType: 'THUMBNAIL',
          fileUrl: thumbnailResult.key,
          fileSize: BigInt(thumbnailResult.size),
          fileFormat: 'jpg',
          mimeType: 'image/jpeg',
        },
        {
          assetId,
          fileType: 'PREVIEW',
          fileUrl: previewResult. key,
          fileSize: BigInt(previewResult.size),
          fileFormat: 'jpg',
          mimeType: 'image/jpeg',
        },
      ],
    });

    this.logger.log(`Image processed for asset: ${assetId}`);
  }

  /**
   * Process video files - generate thumbnail from frame
   */
  private async processVideo(
    assetId: string,
    file: { key: string; mimeType: string },
  ) {
    const tempDir = tmpdir();
    const videoPath = join(tempDir, `video-${assetId}.mp4`);
    const thumbnailPath = join(tempDir, `thumb-${assetId}.jpg`);

    try {
      await this.updateProgress(10);

      // Download video
      const signedUrl = await this.storage. getSignedUrl(file.key, 3600);
      const response = await fetch(signedUrl);
      const buffer = Buffer. from(await response.arrayBuffer());
      await writeFile(videoPath, buffer);

      await this.updateProgress(30);

      // Extract frame at 1 second using ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .screenshots({
            timestamps: ['00:00:01.000'],
            filename: `thumb-${assetId}.jpg`,
            folder: tempDir,
            size: '400x400',
          })
          .on('end', resolve)
          .on('error', reject);
      });

      await this. updateProgress(60);

      // Read generated thumbnail
      const thumbnailBuffer = await sharp(thumbnailPath)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      await this.updateProgress(80);

      // Upload thumbnail
      const thumbnailResult = await this.storage.uploadPublic(
        thumbnailBuffer,
        'assets/thumbnails',
        'jpg',
      );

      await this.updateProgress(90);

      // Save to database
      await this.prisma.assetFile.create({
        data: {
          assetId,
          fileType: 'THUMBNAIL',
          fileUrl: thumbnailResult.key,
          fileSize: BigInt(thumbnailResult.size),
          fileFormat: 'jpg',
          mimeType: 'image/jpeg',
        },
      });

      this.logger.log(`Video thumbnail generated for asset: ${assetId}`);
    } catch (error) {
      this.logger.error(`Video processing failed:  ${error.message}`);
      // Fallback to placeholder
      await this.createAndUploadPlaceholder(assetId, 'VIDEO');
    } finally {
      // Cleanup temp files
      try {
        await unlink(videoPath);
        await unlink(thumbnailPath);
      } catch {}
    }
  }

  /**
   * Process audio files - generate waveform visualization
   */
  private async processAudio(
    assetId: string,
    file: { key: string; mimeType:  string },
  ) {
    try {
      await this.updateProgress(20);

      // Generate waveform visualization
      const waveformImage = await this.generateWaveform();

      await this.updateProgress(70);

      // Upload thumbnail
      const thumbnailResult = await this.storage.uploadPublic(
        waveformImage,
        'assets/thumbnails',
        'jpg',
      );

      await this.updateProgress(90);

      // Save to database
      await this.prisma.assetFile.create({
        data: {
          assetId,
          fileType: 'THUMBNAIL',
          fileUrl: thumbnailResult.key,
          fileSize: BigInt(thumbnailResult.size),
          fileFormat: 'jpg',
          mimeType: 'image/jpeg',
        },
      });

      this.logger.log(`Audio waveform generated for asset: ${assetId}`);
    } catch (error) {
      this.logger.error(`Audio processing failed: ${error.message}`);
      // Fallback to placeholder
      await this.createAndUploadPlaceholder(assetId, 'AUDIO');
    }
  }

  /**
   * Generate waveform visualization (simple version)
   */
  private async generateWaveform(): Promise<Buffer> {
    const width = 400;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform bars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const barCount = 50;
    const barWidth = width / barCount;

    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.random() * height * 0.6 + height * 0.2;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    }

    // Add icon
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', width / 2, height / 2);

    return canvas.toBuffer('image/jpeg', { quality: 0.8 });
  }

  /**
   * Process 3D files - generate render preview (placeholder for now)
   */
  private async process3D(
    assetId: string,
    file: { key: string; mimeType: string },
  ) {
    // For now, create a placeholder
    // In production, you'd use a 3D rendering library like Three.js or Blender headless
    await this.createAndUploadPlaceholder(assetId, 'THREE_D');
  }

  /**
   * Process text/document files
   */
  private async processText(
    assetId: string,
    file: { key:  string; mimeType: string },
  ) {
    // For now, create a placeholder
    // In production, you could render first page of PDF, etc.
    await this.createAndUploadPlaceholder(assetId, 'TEXT');
  }

  /**
   * Create and upload placeholder thumbnail
   */
  private async createAndUploadPlaceholder(assetId: string, type: string) {
    const placeholder = await this.createPlaceholder(type);

    const thumbnailResult = await this.storage.uploadPublic(
      placeholder,
      'assets/thumbnails',
      'jpg',
    );

    await this.prisma.assetFile.create({
      data: {
        assetId,
        fileType:  'THUMBNAIL',
        fileUrl: thumbnailResult.key,
        fileSize: BigInt(thumbnailResult.size),
        fileFormat: 'jpg',
        mimeType: 'image/jpeg',
      },
    });

    this.logger.log(`Placeholder created for asset: ${assetId}`);
  }

  /**
   * Add watermark to preview image
   */
  private async addWatermark(buffer: Buffer): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Create watermark text SVG
    const watermarkSvg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <style>
          . watermark {
            fill: rgba(255, 255, 255, 0.3);
            font-size: 24px;
            font-family: Arial, sans-serif;
            font-weight: bold;
          }
        </style>
        <text x="50%" y="50%" class="watermark" text-anchor="middle" dominant-baseline="middle">
          AssetBox Preview
        </text>
      </svg>
    `;

    return image
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: 'center',
        },
      ])
      .toBuffer();
  }

  /**
   * Create placeholder image for non-image assets
   */
  private async createPlaceholder(type: string): Promise<Buffer> {
    const colors:  Record<string, string> = {
      VIDEO: '#ef4444',
      AUDIO:  '#8b5cf6',
      THREE_D: '#06b6d4',
      TEXT: '#f59e0b',
    };

    const icons: Record<string, string> = {
      VIDEO: '▶',
      AUDIO: '♪',
      THREE_D:  '◇',
      TEXT: '📄',
    };

    const color = colors[type] || '#6b7280';
    const icon = icons[type] || '? ';

    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-size="120" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${icon}
        </text>
      </svg>
    `;

    return sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();
  }

  /**
   * Update job progress
   */
  private async updateProgress(percent: number) {
    // This would be called from within a job context
    // For now, just log
    this.logger.debug(`Progress: ${percent}%`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed for asset ${job.data.assetId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed for asset ${job.data.assetId}:  ${error.message}`,
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Job ${job.id} progress: ${progress}%`);
  }
}