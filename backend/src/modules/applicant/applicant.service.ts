import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  Prisma,
  DocumentType,
  ApplicationStatus,
  ExamResult,
  ReportInStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { QueryApplicantDto } from './dto/query-applicant.dto';
import { EncryptionUtil } from '../../common/utils/encryption.util';
import { SanitizeUtil } from '../../common/utils/sanitize.util';

import { TurnstileService } from '../../common/utils/turnstile.util';
import { SettingsService } from '../settings/settings.service';

type ApplicantSortKey =
  | 'firstName'
  | 'phone'
  | 'submittedAt'
  | 'status'
  | 'examResult'
  | 'reportInStatus'
  | 'program.name';

const APPLICANT_SORT_MAP: Record<
  ApplicantSortKey,
  (order: 'asc' | 'desc') => Prisma.ApplicantOrderByWithRelationInput
> = {
  firstName: (order) => ({ firstName: order }),
  phone: (order) => ({ phone: order }),
  submittedAt: (order) => ({ submittedAt: order }),
  status: (order) => ({ status: order }),
  examResult: (order) => ({ examResult: order }),
  reportInStatus: (order) => ({ reportInStatus: order }),
  'program.name': (order) => ({ program: { name: order } }),
};

@Injectable()
export class ApplicantService {
  private readonly logger = new Logger(ApplicantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly turnstileService: TurnstileService,
    private readonly settingsService: SettingsService,
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

    // Check duplicate national ID. EncryptionUtil.encrypt uses a random IV per call, so
    // encrypting the same plaintext twice never produces the same ciphertext - equality on
    // `nationalId` can't detect duplicates. `nationalIdHash` is deterministic (HMAC) instead.
    const encryptedNationalId = EncryptionUtil.encrypt(dto.nationalId);
    const nationalIdHash = EncryptionUtil.hash(dto.nationalId);

    // Check if already applied this year
    const currentYear = await this.settingsService.getCurrentApplicationYear();

    const existingById = await this.prisma.applicant.findUnique({
      where: { nationalIdHash },
    });

    if (existingById) {
      throw new ConflictException(
        'This national ID has already been registered',
      );
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
        nationalIdHash,
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
        program: {
          select: {
            name: true,
            faculty: { select: { name: true } },
            degree: true,
          },
        },
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
        throw new ForbiddenException(
          'Public document upload session expired. Please contact admin.',
        );
      }
    }

    const uploaded = await this.uploadService.uploadFile(
      file,
      `applicants/${applicantId}`,
    );

    return this.prisma.document.create({
      data: {
        applicantId,
        type: type as DocumentType,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        mimeType: uploaded.mimeType,
        storageKey: uploaded.key,
      },
    });
  }

  /**
   * Check application status by national ID + birth date (public, self-service).
   * An applicationNumber-based lookup would require the applicant to have saved a
   * number the system never emails them - national ID + DOB is the standard Thai
   * self-service pairing (used by exam results, tax refunds, etc.) and needs no
   * lookup value beyond what the applicant already knows.
   * Returns a generic error on any mismatch, so a caller can't use this to probe
   * which national IDs are registered.
   */
  async checkStatus(
    nationalId: string,
    birthDate: string,
    turnstileToken: string,
  ) {
    await this.turnstileService.verifyToken(turnstileToken);

    const nationalIdHash = EncryptionUtil.hash(nationalId);
    const applicant = await this.prisma.applicant.findUnique({
      where: { nationalIdHash },
      include: {
        program: {
          select: { name: true, faculty: { select: { name: true } } },
        },
      },
    });

    const birthDateMatches =
      applicant?.birthDate.toISOString().slice(0, 10) === birthDate;

    if (!applicant || !birthDateMatches) {
      throw new NotFoundException(
        'ไม่พบข้อมูลใบสมัคร กรุณาตรวจสอบเลขบัตรประชาชนและวันเกิดอีกครั้ง',
      );
    }

    return {
      // Masked - a caller who already has the correct nationalId + birthDate can confirm
      // status, but this page must not double as a "whose ID is this" name-lookup tool.
      fullName: `${applicant.prefixName}${this.maskName(applicant.firstName)} ${this.maskName(applicant.lastName)}`,
      applicationNumber: applicant.applicationNumber,
      program: applicant.program,
      status: applicant.status,
      examResult: applicant.examResult,
      reportInStatus: applicant.reportInStatus,
      reportInAt: applicant.reportInAt,
    };
  }

  private maskName(name: string): string {
    if (name.length <= 1) return name;
    return name[0] + '*'.repeat(name.length - 1);
  }

  /**
   * List applicants with search, filter, pagination (admin)
   */
  async findAll(query: QueryApplicantDto) {
    const {
      search,
      status,
      examResult,
      reportInStatus,
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

    // Exam result filter
    if (examResult) {
      where.examResult = examResult;
    }

    // Report-in status filter
    if (reportInStatus) {
      where.reportInStatus = reportInStatus;
    }

    // Year filter
    if (year) {
      where.applicationYear = year;
    }

    // Program filter
    if (programId) {
      where.programId = programId;
    }

    // Search by name, application number, phone, or exact national ID
    if (search) {
      const sanitizedSearch = SanitizeUtil.clean(search);
      // Strip a leading title (นาย/นาง/นางสาว/พระ/สามเณร) so searching the
      // full displayed name (e.g. "นายพงศ...") still matches firstName,
      // which is stored without the title. Longest prefix checked first
      // since "นางสาว" also starts with "นาง".
      const NAME_PREFIXES = ['นางสาว', 'สามเณร', 'นาง', 'นาย', 'พระ'];
      const matchedPrefix = NAME_PREFIXES.find((p) => sanitizedSearch.startsWith(p));
      const firstNameSearch = matchedPrefix
        ? sanitizedSearch.slice(matchedPrefix.length).trim()
        : sanitizedSearch;
      where.OR = [
        { firstName: { contains: firstNameSearch, mode: 'insensitive' } },
        { lastName: { contains: sanitizedSearch, mode: 'insensitive' } },
        {
          applicationNumber: { contains: sanitizedSearch, mode: 'insensitive' },
        },
        // Search by phone
        { phone: { contains: sanitizedSearch } },
        // Exact national ID match only - nationalId is encrypted, so this is the only way
        { nationalIdHash: EncryptionUtil.hash(sanitizedSearch) },
      ];
    }

    const skip = (page - 1) * limit;

    const [applicants, total] = await Promise.all([
      this.prisma.applicant.findMany({
        where,
        skip,
        take: limit,
        orderBy: (
          APPLICANT_SORT_MAP[sortBy as ApplicantSortKey] ?? APPLICANT_SORT_MAP.submittedAt
        )(sortOrder as 'asc' | 'desc'),
        include: {
          program: {
            select: {
              name: true,
              faculty: { select: { name: true } },
              degree: true,
            },
          },
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
  async updateStatus(id: string, status: ApplicationStatus, reason?: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        ...(status === ApplicationStatus.REJECTED
          ? { rejectionReason: reason }
          : {}),
      },
      include: {
        program: {
          select: { name: true, faculty: { select: { name: true } } },
        },
      },
    });
  }

  /**
   * Set exam result (admin) — only allowed once the applicant is APPROVED
   */
  async updateExamResult(id: string, examResult: ExamResult) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.status !== ApplicationStatus.APPROVED) {
      throw new BadRequestException(
        'Applicant must be APPROVED before setting an exam result',
      );
    }

    return this.prisma.applicant.update({
      where: { id },
      data: { examResult },
      include: {
        program: {
          select: { name: true, faculty: { select: { name: true } } },
        },
      },
    });
  }

  /**
   * Approve or reject report-in (admin) — only allowed once the exam is PASSED
   */
  async updateReportIn(
    id: string,
    reportInStatus: ReportInStatus,
    reason?: string,
  ) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    if (applicant.examResult !== ExamResult.PASSED) {
      throw new BadRequestException(
        'Applicant must pass the exam before report-in can be updated',
      );
    }

    return this.prisma.applicant.update({
      where: { id },
      data: {
        reportInStatus,
        reportInAt: new Date(),
        ...(reportInStatus === ReportInStatus.REJECTED
          ? { reportInReason: reason }
          : {}),
      },
      include: {
        program: {
          select: { name: true, faculty: { select: { name: true } } },
        },
      },
    });
  }

  /**
   * Export-then-delete data retention purge (admin, SUPER_ADMIN only).
   * Keeps the current recruiting year and the 2 preceding years; only years
   * older than that (year <= currentYear - 3) are eligible.
   */
  async deletePurgeYear(year: number): Promise<number> {
    const currentYear = await this.settingsService.getCurrentApplicationYear();
    if (year > currentYear - 3) {
      throw new BadRequestException(
        'This year is not old enough to purge — the last 3 years must be kept',
      );
    }

    const applicants = await this.prisma.applicant.findMany({
      where: { applicationYear: year },
      include: { documents: true },
    });

    for (const applicant of applicants) {
      for (const doc of applicant.documents) {
        await this.uploadService.deleteFile(doc.storageKey);
      }
    }

    const result = await this.prisma.applicant.deleteMany({
      where: { applicationYear: year },
    });

    this.logger.log(`Purged ${result.count} applicants for year ${year}`);
    return result.count;
  }

  /**
   * Get all applicants for export (no pagination)
   */
  async findAllForExport(query: Partial<QueryApplicantDto>) {
    const where: Prisma.ApplicantWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.examResult) where.examResult = query.examResult;
    if (query.reportInStatus) where.reportInStatus = query.reportInStatus;
    if (query.year) where.applicationYear = query.year;
    if (query.programId) where.programId = query.programId;

    const applicants = await this.prisma.applicant.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        program: {
          select: {
            name: true,
            faculty: { select: { name: true } },
            degree: true,
          },
        },
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
        program: {
          select: {
            name: true,
            faculty: { select: { name: true } },
            degree: true,
          },
        },
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
