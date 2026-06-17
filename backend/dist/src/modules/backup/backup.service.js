"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
const prisma_service_1 = require("../../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const archiver = require("archiver");
let BackupService = BackupService_1 = class BackupService {
    constructor(prisma, configService, uploadService) {
        this.prisma = prisma;
        this.configService = configService;
        this.uploadService = uploadService;
        this.logger = new common_1.Logger(BackupService_1.name);
    }
    async performBackup() {
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
            const r2Files = await this.uploadService.listAllFiles();
            const archive = archiver('zip', { zlib: { level: 9 } });
            const chunks = [];
            archive.on('data', (chunk) => chunks.push(chunk));
            archive.append(JSON.stringify(dbData, null, 2), {
                name: 'database_export.json',
            });
            let fileCount = 0;
            let totalSize = 0;
            for (const file of r2Files) {
                try {
                    const buffer = await this.uploadService.downloadFile(file.key);
                    archive.append(buffer, { name: `files/${file.key}` });
                    fileCount++;
                    totalSize += file.size;
                }
                catch (err) {
                    this.logger.warn(`Failed to download ${file.key}: ${err.message}`);
                }
            }
            await archive.finalize();
            const zipBuffer = Buffer.concat(chunks);
            const driveFileId = await this.uploadToGoogleDrive(zipBuffer);
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
            this.logger.log(`Backup completed: ${fileCount} files, ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
        }
        catch (error) {
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
    async uploadToGoogleDrive(buffer) {
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: this.configService.get('GOOGLE_CLIENT_EMAIL'),
                private_key: this.configService
                    .get('GOOGLE_PRIVATE_KEY')
                    ?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `mbu-lanna-backup-${dateStr}.zip`;
        const stream = new stream_1.Readable();
        stream.push(buffer);
        stream.push(null);
        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [this.configService.get('GOOGLE_DRIVE_FOLDER_ID')],
                mimeType: 'application/zip',
            },
            media: {
                mimeType: 'application/zip',
                body: stream,
            },
        });
        this.logger.log(`Uploaded to Google Drive: ${response.data.id}`);
        return response.data.id;
    }
    async getBackupHistory() {
        return this.prisma.backupLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        upload_service_1.UploadService])
], BackupService);
//# sourceMappingURL=backup.service.js.map