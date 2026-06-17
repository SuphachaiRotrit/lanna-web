import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import archiver = require('archiver');

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Perform full backup to Google Drive
   */
  async performBackup(): Promise<void> {
    const startedAt = new Date();
    let backupLog = await this.prisma.backupLog.create({
      data: {
        type: 'full',
        status: 'running',
        startedAt,
      },
    });

    try {
      this.logger.log('Starting monthly backup...');

      // 1. Export database data as JSON
      const [applicants, programs, documents] = await Promise.all([
        this.prisma.applicant.findMany({ include: { documents: true } }),
        this.prisma.program.findMany(),
        this.prisma.document.findMany(),
      ]);

      const dbData = {
        exportDate: new Date().toISOString(),
        applicants,
        programs,
        documents,
      };

      // 2. List all files from R2
      const r2Files = await this.uploadService.listAllFiles();

      // 3. Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));

      // Add database JSON
      archive.append(JSON.stringify(dbData, null, 2), {
        name: 'database_export.json',
      });

      // Add R2 files
      let fileCount = 0;
      let totalSize = 0;

      for (const file of r2Files) {
        try {
          const buffer = await this.uploadService.downloadFile(file.key);
          archive.append(buffer, { name: `files/${file.key}` });
          fileCount++;
          totalSize += file.size;
        } catch (err) {
          this.logger.warn(`Failed to download ${file.key}: ${err.message}`);
        }
      }

      await archive.finalize();
      const zipBuffer = Buffer.concat(chunks);

      // 4. Upload to Google Drive
      const driveFileId = await this.uploadToGoogleDrive(zipBuffer);

      // 5. Update backup log
      await this.prisma.backupLog.update({
        where: { id: backupLog.id },
        data: {
          status: 'success',
          fileCount,
          totalSize: BigInt(totalSize),
          driveFileId,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Backup completed: ${fileCount} files, ${(totalSize / 1024 / 1024).toFixed(2)}MB`,
      );
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`, error.stack);

      await this.prisma.backupLog.update({
        where: { id: backupLog.id },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Upload ZIP file to Google Drive
   */
  private async uploadToGoogleDrive(buffer: Buffer): Promise<string> {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.configService.get('GOOGLE_CLIENT_EMAIL'),
        private_key: this.configService
          .get('GOOGLE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `mbu-lanna-backup-${dateStr}.zip`;

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [this.configService.get('GOOGLE_DRIVE_FOLDER_ID')!],
        mimeType: 'application/zip',
      },
      media: {
        mimeType: 'application/zip',
        body: stream,
      },
    });

    this.logger.log(`Uploaded to Google Drive: ${response.data.id}`);
    return response.data.id!;
  }

  /**
   * Get backup history
   */
  async getBackupHistory() {
    return this.prisma.backupLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
