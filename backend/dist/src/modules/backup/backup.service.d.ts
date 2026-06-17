import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
export declare class BackupService {
    private readonly prisma;
    private readonly configService;
    private readonly uploadService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService, uploadService: UploadService);
    performBackup(): Promise<void>;
    private uploadToGoogleDrive;
    getBackupHistory(): Promise<{
        error: string | null;
        id: string;
        type: string;
        status: string;
        fileCount: number;
        totalSize: bigint;
        driveFileId: string | null;
        startedAt: Date;
        completedAt: Date | null;
        createdAt: Date;
    }[]>;
}
