import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{
        key: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    }>;
}
