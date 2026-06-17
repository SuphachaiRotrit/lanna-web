import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { QueryApplicantDto } from './dto/query-applicant.dto';
import { EncryptionUtil } from '../../common/utils/encryption.util';
import { SanitizeUtil } from '../../common/utils/sanitize.util';

import { TurnstileService } from '../../common/utils/turnstile.util';

@Injectable()
export class ApplicantService {
  private readonly logger = new Logger(ApplicantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly turnstileService: TurnstileService,
  ) {}

  /**
   * Generate application number: MBU-{year}-{sequence}
   */
  private async generateApplicationNumber(year: number): Promise<string> {
    const count = await this.prisma.applicant.count({
      where: { applicationYear: year },
    });
    const sequence = String(count + 1).padStart(4, '0');
    return `MBU-${year}-${sequence}`;
  }

  /**
   * Submit a new application (public)
   */
  async create(dto: CreateApplicantDto) {
    // 1. Verify Turnstile Token
    await this.turnstileService.verifyToken(dto.turnstileToken);

    // Validate national ID
    if (!SanitizeUtil.isValidNationalId(dto.nationalId)) {
      throw new BadRequestException('Invalid national ID format');
    }

    if (!dto.pdpaConsent) {
      throw new BadRequestException('PDPA consent is required');
    }

    // Check duplicate national ID (need to check encrypted values)
    const encryptedNationalId = EncryptionUtil.encrypt(dto.nationalId);
    
    // Check if already applied this year
    const currentYear = new Date().getFullYear() + 543; // Buddhist era
    const existing = await this.prisma.applicant.findFirst({
      where: {
        applicationYear: currentYear,
      },
    });

    // Need to check by decrypting - but for performance, we store a hash too
    // For now, use unique constraint on nationalId
    const existingById = await this.prisma.applicant.findUnique({
      where: { nationalId: encryptedNationalId },
    });

    if (existingById) {
      throw new ConflictException('This national ID has already been registered');
    }

    // Verify program exists
    const program = await this.prisma.program.findUnique({
      where: { id: dto.programId, isActive: true },
    });

    if (!program) {
      throw new BadRequestException('Selected program is not available');
    }

    // Sanitize all string inputs
    const sanitized = SanitizeUtil.cleanObject(dto);

    // Generate application number
    const applicationNumber = await this.generateApplicationNumber(currentYear);

    // Create applicant with encrypted national ID
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
      id: applicant.id, // ต้องส่ง ID กลับไปเพื่อให้ Frontend อัปโหลดไฟล์ต่อได้
      applicationNumber: applicant.applicationNumber,
      fullName: `${applicant.prefixName}${applicant.firstName} ${applicant.lastName}`,
      program: applicant.program,
      submittedAt: applicant.submittedAt,
    };
  }

  /**
   * Add document to applicant
   */
  async addDocument(
    applicantId: string,
    file: Express.Multer.File,
    type: string,
    isAdmin: boolean = false,
  ) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    // Security check: Public uploads only allowed within 2 hours of creation
    if (!isAdmin) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (applicant.submittedAt < twoHoursAgo) {
        throw new ForbiddenException('Public document upload session expired. Please contact admin.');
      }
    }

    const uploaded = await this.uploadService.uploadFile(file, `applicants/${applicantId}`);

    return this.prisma.document.create({
      data: {
        applicantId,
        type: type as any,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        mimeType: uploaded.mimeType,
        storageKey: uploaded.key,
      },
    });
  }

  /**
   * List applicants with search, filter, pagination (admin)
   */
  async findAll(query: QueryApplicantDto) {
    const {
      search,
      status,
      year,
      programId,
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ApplicantWhereInput = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    // Year filter
    if (year) {
      where.applicationYear = year;
    }

    // Program filter
    if (programId) {
      where.programId = programId;
    }

    // Search by name or application number
    if (search) {
      const sanitizedSearch = SanitizeUtil.clean(search);
      where.OR = [
        { firstName: { contains: sanitizedSearch, mode: 'insensitive' } },
        { lastName: { contains: sanitizedSearch, mode: 'insensitive' } },
        { applicationNumber: { contains: sanitizedSearch, mode: 'insensitive' } },
        // Search by phone
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

    // Decrypt national IDs for display
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

  /**
   * Get single applicant detail (admin)
   */
  async findOne(id: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: {
        program: true,
        documents: true,
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    // Generate signed URLs for documents
    const documentsWithUrls = await Promise.all(
      applicant.documents.map(async (doc) => ({
        ...doc,
        url: await this.uploadService.getSignedUrl(doc.storageKey),
      })),
    );

    return {
      ...applicant,
      nationalId: this.decryptNationalId(applicant.nationalId),
      documents: documentsWithUrls,
    };
  }

  /**
   * Update applicant status (admin)
   */
  async updateStatus(id: string, status: string, checklist?: {
    hasTranscript?: boolean;
    hasHouseRegistration?: boolean;
    hasIdCard?: boolean;
    hasNameChange?: boolean;
    hasPhoto?: boolean;
  }) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status: status as any,
        reviewedAt: new Date(),
      },
      include: {
        program: { select: { name: true, faculty: true } },
      },
    });
  }

  /**
   * Get all applicants for export (no pagination)
   */
  async findAllForExport(query: Partial<QueryApplicantDto>) {
    const where: Prisma.ApplicantWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.year) where.applicationYear = query.year;
    if (query.programId) where.programId = query.programId;

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

  /**
   * Get applicants by IDs (for selective export)
   */
  async findByIds(ids: string[]) {
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

  private decryptNationalId(encrypted: string): string {
    try {
      return EncryptionUtil.decrypt(encrypted);
    } catch {
      return '***-****-*****'; // Fallback if decryption fails
    }
  }
}
