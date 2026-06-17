import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly configService;
    private readonly logger;
    private readonly s3Client;
    private readonly bucketName;
    private readonly useLocal;
    private readonly uploadPath;
    constructor(configService: ConfigService);
    private validateFile;
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        key: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    listAllFiles(prefix?: string): Promise<any[]>;
    downloadFile(key: string): Promise<Buffer>;
}
