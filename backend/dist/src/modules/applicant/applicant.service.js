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
var ApplicantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const upload_service_1 = require("../upload/upload.service");
const encryption_util_1 = require("../../common/utils/encryption.util");
const sanitize_util_1 = require("../../common/utils/sanitize.util");
const turnstile_util_1 = require("../../common/utils/turnstile.util");
let ApplicantService = ApplicantService_1 = class ApplicantService {
    constructor(prisma, uploadService, turnstileService) {
        this.prisma = prisma;
        this.uploadService = uploadService;
        this.turnstileService = turnstileService;
        this.logger = new common_1.Logger(ApplicantService_1.name);
    }
    async generateApplicationNumber(year) {
        const count = await this.prisma.applicant.count({
            where: { applicationYear: year },
        });
        const sequence = String(count + 1).padStart(4, '0');
        return `MBU-${year}-${sequence}`;
    }
    async create(dto) {
        await this.turnstileService.verifyToken(dto.turnstileToken);
        if (!sanitize_util_1.SanitizeUtil.isValidNationalId(dto.nationalId)) {
            throw new common_1.BadRequestException('Invalid national ID format');
        }
        if (!dto.pdpaConsent) {
            throw new common_1.BadRequestException('PDPA consent is required');
        }
        const encryptedNationalId = encryption_util_1.EncryptionUtil.encrypt(dto.nationalId);
        const currentYear = new Date().getFullYear() + 543;
        const existing = await this.prisma.applicant.findFirst({
            where: {
                applicationYear: currentYear,
            },
        });
        const existingById = await this.prisma.applicant.findUnique({
            where: { nationalId: encryptedNationalId },
        });
        if (existingById) {
            throw new common_1.ConflictException('This national ID has already been registered');
        }
        const program = await this.prisma.program.findUnique({
            where: { id: dto.programId, isActive: true },
        });
        if (!program) {
            throw new common_1.BadRequestException('Selected program is not available');
        }
        const sanitized = sanitize_util_1.SanitizeUtil.cleanObject(dto);
        const applicationNumber = await this.generateApplicationNumber(currentYear);
        const applicant = await this.prisma.applicant.create({
            data: {
                prefixName: sanitized.prefixName,
                firstName: sanitized.firstName,
                lastName: sanitized.lastName,
                aliasName: sanitized.aliasName,
                firstNameEn: sanitized.firstNameEn,
                lastNameEn: sanitized.lastNameEn,
                nationalId: encryptedNationalId,
                gender: sanitized.gender,
                birthDate: new Date(sanitized.birthDate),
                ethnicity: sanitized.ethnicity,
                nationality: sanitized.nationality,
                religion: sanitized.religion,
                bloodType: sanitized.bloodType,
                phone: sanitized.phone,
                email: sanitized.email,
                lineId: sanitized.lineId,
                address: sanitized.address,
                subDistrict: sanitized.subDistrict,
                district: sanitized.district,
                province: sanitized.province,
                postalCode: sanitized.postalCode,
                previousSchool: sanitized.previousSchool,
                previousEducation: sanitized.previousEducation,
                gpa: dto.gpa,
                graduationYear: sanitized.graduationYear,
                schoolProvince: sanitized.schoolProvince,
                applicationReason: sanitized.applicationReason,
                programId: dto.programId,
                applicationNumber,
                applicationYear: currentYear,
                pdpaConsent: true,
                consentedAt: new Date(),
                parentName: sanitized.parentName,
                parentPhone: sanitized.parentPhone,
                parentRelation: sanitized.parentRelation,
                hasTranscript: dto.hasTranscript || false,
                hasHouseRegistration: dto.hasHouseRegistration || false,
                hasIdCard: dto.hasIdCard || false,
                hasNameChange: dto.hasNameChange || false,
                hasPhoto: dto.hasPhoto || false,
            },
            include: {
                program: { select: { name: true, faculty: true, degree: true } },
            },
        });
        this.logger.log(`New application submitted: ${applicationNumber}`);
        return {
            id: applicant.id,
            applicationNumber: applicant.applicationNumber,
            fullName: `${applicant.prefixName}${applicant.firstName} ${applicant.lastName}`,
            program: applicant.program,
            submittedAt: applicant.submittedAt,
        };
    }
    async addDocument(applicantId, file, type, isAdmin = false) {
        const applicant = await this.prisma.applicant.findUnique({
            where: { id: applicantId },
        });
        if (!applicant) {
            throw new common_1.NotFoundException('Applicant not found');
        }
        if (!isAdmin) {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            if (applicant.submittedAt < twoHoursAgo) {
                throw new common_1.ForbiddenException('Public document upload session expired. Please contact admin.');
            }
        }
        const uploaded = await this.uploadService.uploadFile(file, `applicants/${applicantId}`);
        return this.prisma.document.create({
            data: {
                applicantId,
                type: type,
                fileName: uploaded.fileName,
                fileSize: uploaded.fileSize,
                mimeType: uploaded.mimeType,
                storageKey: uploaded.key,
            },
        });
    }
    async findAll(query) {
        const { search, status, year, programId, page = 1, limit = 20, sortBy = 'submittedAt', sortOrder = 'desc', } = query;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (year) {
            where.applicationYear = year;
        }
        if (programId) {
            where.programId = programId;
        }
        if (search) {
            const sanitizedSearch = sanitize_util_1.SanitizeUtil.clean(search);
            where.OR = [
                { firstName: { contains: sanitizedSearch, mode: 'insensitive' } },
                { lastName: { contains: sanitizedSearch, mode: 'insensitive' } },
                { applicationNumber: { contains: sanitizedSearch, mode: 'insensitive' } },
                { phone: { contains: sanitizedSearch } },
            ];
        }
        const skip = (page - 1) * limit;
        const [applicants, total] = await Promise.all([
            this.prisma.applicant.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    program: { select: { name: true, faculty: true, degree: true } },
                    documents: { select: { id: true, type: true, fileName: true } },
                },
            }),
            this.prisma.applicant.count({ where }),
        ]);
        const decryptedApplicants = applicants.map((a) => ({
            ...a,
            nationalId: this.decryptNationalId(a.nationalId),
        }));
        return {
            rows: decryptedApplicants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const applicant = await this.prisma.applicant.findUnique({
            where: { id },
            include: {
                program: true,
                documents: true,
            },
        });
        if (!applicant) {
            throw new common_1.NotFoundException('Applicant not found');
        }
        const documentsWithUrls = await Promise.all(applicant.documents.map(async (doc) => ({
            ...doc,
            url: await this.uploadService.getSignedUrl(doc.storageKey),
        })));
        return {
            ...applicant,
            nationalId: this.decryptNationalId(applicant.nationalId),
            documents: documentsWithUrls,
        };
    }
    async updateStatus(id, status, checklist) {
        const applicant = await this.prisma.applicant.findUnique({
            where: { id },
        });
        if (!applicant) {
            throw new common_1.NotFoundException('Applicant not found');
        }
        return this.prisma.applicant.update({
            where: { id },
            data: {
                status: status,
                reviewedAt: new Date(),
            },
            include: {
                program: { select: { name: true, faculty: true } },
            },
        });
    }
    async findAllForExport(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.year)
            where.applicationYear = query.year;
        if (query.programId)
            where.programId = query.programId;
        const applicants = await this.prisma.applicant.findMany({
            where,
            orderBy: { submittedAt: 'desc' },
            include: {
                program: { select: { name: true, faculty: true, degree: true } },
            },
        });
        return applicants.map((a) => ({
            ...a,
            nationalId: this.decryptNationalId(a.nationalId),
        }));
    }
    async findByIds(ids) {
        const applicants = await this.prisma.applicant.findMany({
            where: { id: { in: ids } },
            include: {
                program: { select: { name: true, faculty: true, degree: true } },
            },
        });
        return applicants.map((a) => ({
            ...a,
            nationalId: this.decryptNationalId(a.nationalId),
        }));
    }
    decryptNationalId(encrypted) {
        try {
            return encryption_util_1.EncryptionUtil.decrypt(encrypted);
        }
        catch {
            return '***-****-*****';
        }
    }
};
exports.ApplicantService = ApplicantService;
exports.ApplicantService = ApplicantService = ApplicantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        upload_service_1.UploadService,
        turnstile_util_1.TurnstileService])
], ApplicantService);
//# sourceMappingURL=applicant.service.js.map