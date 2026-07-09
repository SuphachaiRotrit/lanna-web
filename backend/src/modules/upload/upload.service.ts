import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB — stays under Vercel's 4.5MB request-body cap

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly useLocal: boolean = false;
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get('R2_ACCOUNT_ID');
    const isPlaceholder = !accountId || accountId.includes('YOUR_R2');
    
    if (isPlaceholder || this.configService.get('NODE_ENV') === 'development') {
      this.useLocal = true;
      this.logger.warn('⚠️ Cloudflare R2 not configured. Using LOCAL STORAGE.');
      if (!fs.existsSync(this.uploadPath)) {
        fs.mkdirSync(this.uploadPath, { recursive: true });
      }
    } else {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.configService.get('R2_ACCESS_KEY_ID')!,
          secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY')!,
        },
      });
    }
    this.bucketName = this.configService.get('R2_BUCKET_NAME', 'mbu-lanna-documents');
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE) throw new BadRequestException('File size exceeds limit');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'documents',
  ): Promise<{ key: string; fileName: string; fileSize: number; mimeType: string }> {
    this.validateFile(file);
    const ext = path.extname(file.originalname);
    const key = `${folder}/${uuidv4()}${ext}`;

    try {
      if (this.useLocal) {
        const fullPath = path.join(this.uploadPath, key);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, file.buffer);
      } else {
        await this.s3Client!.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentDisposition: `inline; filename="${file.originalname}"`,
          }),
        );
      }
      this.logger.log(`Uploaded: ${key}`);
      return { key, fileName: file.originalname, fileSize: file.size, mimeType: file.mimetype };
    } catch (error) {
      this.logger.error(`Upload error: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.useLocal) {
      const baseUrl = this.configService.get('BACKEND_URL', 'http://localhost:4000');
      return `${baseUrl}/uploads/${key}`;
    }
    try {
      const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
      return getSignedUrl(this.s3Client!, command, { expiresIn });
    } catch (error) {
      return '';
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (this.useLocal) {
        const fullPath = path.join(this.uploadPath, key);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } else {
        await this.s3Client!.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
      }
    } catch (error) {}
  }

  // --- เพิ่มฟังก์ชันที่ขาดหายไปเพื่อรองรับ BackupService ---

  async listAllFiles(prefix?: string) {
    if (this.useLocal) {
      // ดึงไฟล์จาก Folder ในเครื่องแบบ Recursive
      const getAllFiles = (dirPath: string, arrayOfFiles: any[] = []) => {
        const files = fs.readdirSync(dirPath);
        files.forEach((file) => {
          if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
          } else {
            const fullPath = path.join(dirPath, file);
            const relativePath = path.relative(this.uploadPath, fullPath).replace(/\\/g, '/');
            if (!prefix || relativePath.startsWith(prefix)) {
              arrayOfFiles.push({ key: relativePath, size: fs.statSync(fullPath).size });
            }
          }
        });
        return arrayOfFiles;
      };
      return getAllFiles(this.uploadPath);
    }

    // สำหรับ R2
    const objects: { key: string; size: number }[] = [];
    let continuationToken: string | undefined;
    do {
      const response = await this.s3Client!.send(
        new ListObjectsV2Command({ Bucket: this.bucketName, Prefix: prefix, ContinuationToken: continuationToken })
      );
      if (response.Contents) {
        response.Contents.forEach(obj => objects.push({ key: obj.Key!, size: obj.Size || 0 }));
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    return objects;
  }

  async downloadFile(key: string): Promise<Buffer> {
    if (this.useLocal) {
      const fullPath = path.join(this.uploadPath, key);
      return fs.readFileSync(fullPath);
    }

    const response = await this.s3Client!.send(
      new GetObjectCommand({ Bucket: this.bucketName, Key: key })
    );
    const stream = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }
}
