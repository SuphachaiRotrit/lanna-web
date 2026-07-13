import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
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
  private readonly supabase: SupabaseClient;
  private readonly supabaseBucket: string;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL')!,
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    this.supabaseBucket = this.configService.get('SUPABASE_STORAGE_BUCKET', 'documents');
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
      const { error } = await this.supabase.storage
        .from(this.supabaseBucket)
        .upload(key, file.buffer, { contentType: file.mimetype, upsert: false });
      if (error) throw error;
      this.logger.log(`Uploaded: ${key}`);
      return { key, fileName: file.originalname, fileSize: file.size, mimeType: file.mimetype };
    } catch (error) {
      this.logger.error(`Upload error: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.supabaseBucket)
        .createSignedUrl(key, expiresIn);
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      return '';
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.supabase.storage.from(this.supabaseBucket).remove([key]);
    } catch (error) {}
  }
}
