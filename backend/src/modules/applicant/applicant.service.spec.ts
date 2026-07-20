import { ApplicationStatus, ExamResult, ReportInStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { TurnstileService } from '../../common/utils/turnstile.util';
import { EncryptionUtil } from '../../common/utils/encryption.util';

type UpdateArgs = { data: Record<string, unknown> };
type UpdateMock = jest.Mock<Promise<unknown>, [UpdateArgs]>;

describe('ApplicantService.updateStatus', () => {
  const buildService = (update: UpdateMock) => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue({ id: '1' }),
        update,
      },
    } as unknown as PrismaService;
    return new ApplicantService(
      prisma,
      {} as UploadService,
      {} as TurnstileService,
    );
  };

  it('stores rejectionReason when status is REJECTED', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService(update);

    await service.updateStatus(
      '1',
      ApplicationStatus.REJECTED,
      'เอกสารไม่ครบถ้วน',
    );

    const dataArg = update.mock.calls[0][0].data;
    expect(dataArg.status).toBe(ApplicationStatus.REJECTED);
    expect(dataArg.rejectionReason).toBe('เอกสารไม่ครบถ้วน');
  });

  it('does not set rejectionReason for other statuses', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService(update);

    await service.updateStatus('1', ApplicationStatus.APPROVED);

    const dataArg = update.mock.calls[0][0].data;
    expect(dataArg.rejectionReason).toBeUndefined();
  });
});

describe('ApplicantService.updateExamResult', () => {
  const buildService = (
    applicant: { status: ApplicationStatus },
    update: UpdateMock,
  ) => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue(applicant),
        update,
      },
    } as unknown as PrismaService;
    return new ApplicantService(
      prisma,
      {} as UploadService,
      {} as TurnstileService,
    );
  };

  it('rejects setting an exam result before the applicant is APPROVED', async () => {
    const update: UpdateMock = jest.fn<Promise<unknown>, [UpdateArgs]>();
    const service = buildService(
      { status: ApplicationStatus.REVIEWING },
      update,
    );

    await expect(
      service.updateExamResult('1', ExamResult.PASSED),
    ).rejects.toThrow(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });

  it('sets examResult once the applicant is APPROVED', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService(
      { status: ApplicationStatus.APPROVED },
      update,
    );

    await service.updateExamResult('1', ExamResult.PASSED);

    expect(update.mock.calls[0][0].data.examResult).toBe(ExamResult.PASSED);
  });
});

describe('ApplicantService.updateReportIn', () => {
  const buildService = (
    applicant: { examResult: ExamResult },
    update: UpdateMock,
  ) => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue(applicant),
        update,
      },
    } as unknown as PrismaService;
    return new ApplicantService(
      prisma,
      {} as UploadService,
      {} as TurnstileService,
    );
  };

  it('rejects updating report-in status before the exam is passed', async () => {
    const update: UpdateMock = jest.fn<Promise<unknown>, [UpdateArgs]>();
    const service = buildService({ examResult: ExamResult.NOT_YET }, update);

    await expect(
      service.updateReportIn('1', ReportInStatus.CONFIRMED),
    ).rejects.toThrow(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });

  it('stores reportInReason when rejecting the report-in', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService({ examResult: ExamResult.PASSED }, update);

    await service.updateReportIn(
      '1',
      ReportInStatus.REJECTED,
      'ไม่มารายงานตัวตามกำหนด',
    );

    const dataArg = update.mock.calls[0][0].data;
    expect(dataArg.reportInStatus).toBe(ReportInStatus.REJECTED);
    expect(dataArg.reportInReason).toBe('ไม่มารายงานตัวตามกำหนด');
    expect(dataArg.reportInAt).toBeInstanceOf(Date);
  });

  it('does not store reportInReason when confirming the report-in', async () => {
    const update: UpdateMock = jest
      .fn<Promise<unknown>, [UpdateArgs]>()
      .mockResolvedValue({});
    const service = buildService({ examResult: ExamResult.PASSED }, update);

    await service.updateReportIn('1', ReportInStatus.CONFIRMED);

    expect(update.mock.calls[0][0].data.reportInReason).toBeUndefined();
  });
});

describe('ApplicantService.checkStatus', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'a-secret-of-arbitrary-length-not-32-chars';
  });

  it('throws the same generic error for a wrong applicationNumber as for a wrong nationalId', async () => {
    const notFound = {
      applicant: { findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;
    const wrongId = {
      applicant: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ nationalIdHash: EncryptionUtil.hash('1111111111111') }),
      },
    } as unknown as PrismaService;

    const serviceA = new ApplicantService(notFound, {} as UploadService, {} as TurnstileService);
    const serviceB = new ApplicantService(wrongId, {} as UploadService, {} as TurnstileService);

    const errA = await serviceA.checkStatus('2569-000001', '1234567890123').catch((e) => e);
    const errB = await serviceB.checkStatus('2569-000001', '1234567890123').catch((e) => e);

    expect(errA).toBeInstanceOf(NotFoundException);
    expect(errB).toBeInstanceOf(NotFoundException);
    expect(errA.message).toBe(errB.message);
  });

  it('returns public-safe fields on a matching applicationNumber + nationalId', async () => {
    const nationalIdHash = EncryptionUtil.hash('1234567890123');
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue({
          nationalIdHash,
          prefixName: 'นาย',
          firstName: 'ทดสอบ',
          lastName: 'ระบบ',
          applicationNumber: '2569-000001',
          program: { name: 'พุทธศาสตรบัณฑิต', faculty: { name: 'คณะศาสนาและปรัชญา' } },
          status: ApplicationStatus.PENDING,
          examResult: ExamResult.NOT_YET,
          reportInStatus: ReportInStatus.NOT_YET,
          reportInAt: null,
        }),
      },
    } as unknown as PrismaService;
    const service = new ApplicantService(prisma, {} as UploadService, {} as TurnstileService);

    const result = await service.checkStatus('2569-000001', '1234567890123');

    expect(result).toEqual({
      fullName: 'นายทดสอบ ระบบ',
      applicationNumber: '2569-000001',
      program: { name: 'พุทธศาสตรบัณฑิต', faculty: { name: 'คณะศาสนาและปรัชญา' } },
      status: ApplicationStatus.PENDING,
      examResult: ExamResult.NOT_YET,
      reportInStatus: ReportInStatus.NOT_YET,
      reportInAt: null,
    });
  });
});

describe('ApplicantService.deletePurgeYear', () => {
  it('rejects purging a year within the 3-year retention window', async () => {
    const currentYear = new Date().getFullYear() + 543;
    const prisma = {} as PrismaService;
    const service = new ApplicantService(
      prisma,
      {} as UploadService,
      {} as TurnstileService,
    );

    await expect(service.deletePurgeYear(currentYear - 2)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deletes storage files and applicant rows for an eligible year', async () => {
    const currentYear = new Date().getFullYear() + 543;
    const purgeYear = currentYear - 3;
    const findMany = jest
      .fn()
      .mockResolvedValue([
        { id: 'a1', documents: [{ storageKey: 'applicants/a1/photo.jpg' }] },
      ]);
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const deleteFile = jest.fn().mockResolvedValue(undefined);
    const prisma = {
      applicant: { findMany, deleteMany },
    } as unknown as PrismaService;
    const uploadService = { deleteFile } as unknown as UploadService;
    const service = new ApplicantService(
      prisma,
      uploadService,
      {} as TurnstileService,
    );

    const count = await service.deletePurgeYear(purgeYear);

    expect(deleteFile).toHaveBeenCalledWith('applicants/a1/photo.jpg');
    expect(deleteMany).toHaveBeenCalledWith({
      where: { applicationYear: purgeYear },
    });
    expect(count).toBe(1);
  });
});
