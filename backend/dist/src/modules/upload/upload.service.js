"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
let UploadService = UploadService_1 = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(UploadService_1.name);
        this.s3Client = null;
        this.useLocal = false;
        this.uploadPath = path.join(process.cwd(), 'uploads');
        const accountId = this.configService.get('R2_ACCOUNT_ID');
        const isPlaceholder = !accountId || accountId.includes('YOUR_R2');
        if (isPlaceholder || this.configService.get('NODE_ENV') === 'development') {
            this.useLocal = true;
            this.logger.warn('⚠️ Cloudflare R2 not configured. Using LOCAL STORAGE.');
            if (!fs.existsSync(this.uploadPath)) {
                fs.mkdirSync(this.uploadPath, { recursive: true });
            }
        }
        else {
            this.s3Client = new client_s3_1.S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: this.configService.get('R2_ACCESS_KEY_ID'),
                    secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY'),
                },
            });
        }
        this.bucketName = this.configService.get('R2_BUCKET_NAME', 'mbu-lanna-documents');
    }
    validateFile(file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        if (file.size > MAX_FILE_SIZE)
            throw new common_1.BadRequestException('File size exceeds limit');
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} not allowed`);
        }
    }
    async uploadFile(file, folder = 'documents') {
        this.validateFile(file);
        const ext = path.extname(file.originalname);
        const key = `${folder}/${(0, uuid_1.v4)()}${ext}`;
        try {
            if (this.useLocal) {
                const fullPath = path.join(this.uploadPath, key);
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(fullPath, file.buffer);
            }
            else {
                await this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ContentDisposition: `inline; filename="${file.originalname}"`,
                }));
            }
            this.logger.log(`Uploaded: ${key}`);
            return { key, fileName: file.originalname, fileSize: file.size, mimeType: file.mimetype };
        }
        catch (error) {
            this.logger.error(`Upload error: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to upload file');
        }
    }
    async getSignedUrl(key, expiresIn = 3600) {
        if (this.useLocal) {
            const baseUrl = this.configService.get('BACKEND_URL', 'http://localhost:4000');
            return `${baseUrl}/uploads/${key}`;
        }
        try {
            const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucketName, Key: key });
            return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (error) {
            return '';
        }
    }
    async deleteFile(key) {
        try {
            if (this.useLocal) {
                const fullPath = path.join(this.uploadPath, key);
                if (fs.existsSync(fullPath))
                    fs.unlinkSync(fullPath);
            }
            else {
                await this.s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
            }
        }
        catch (error) { }
    }
    async listAllFiles(prefix) {
        if (this.useLocal) {
            const getAllFiles = (dirPath, arrayOfFiles = []) => {
                const files = fs.readdirSync(dirPath);
                files.forEach((file) => {
                    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
                    }
                    else {
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
        const objects = [];
        let continuationToken;
        do {
            const response = await this.s3Client.send(new client_s3_1.ListObjectsV2Command({ Bucket: this.bucketName, Prefix: prefix, ContinuationToken: continuationToken }));
            if (response.Contents) {
                response.Contents.forEach(obj => objects.push({ key: obj.Key, size: obj.Size || 0 }));
            }
            continuationToken = response.NextContinuationToken;
        } while (continuationToken);
        return objects;
    }
    async downloadFile(key) {
        if (this.useLocal) {
            const fullPath = path.join(this.uploadPath, key);
            return fs.readFileSync(fullPath);
        }
        const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: this.bucketName, Key: key }));
        const stream = response.Body;
        const chunks = [];
        for await (const chunk of stream)
            chunks.push(Buffer.from(chunk));
        return Buffer.concat(chunks);
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map