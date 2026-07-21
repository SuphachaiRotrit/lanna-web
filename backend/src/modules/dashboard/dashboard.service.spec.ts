import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

describe('DashboardService.getStats', () => {
  const buildService = (
    totalCount: number,
    yearApplicants: Array<{
      id: string;
      prefixName: string;
      firstName: string;
      lastName: string;
      applicationNumber: string;
      status: string;
      examResult: string;
      reportInStatus: string;
      gender: string;
      submittedAt: Date;
      programId: string;
      program: { name: string };
    }>,
    defaultYear = 2570,
  ) => {
    const prisma = {
      applicant: {
        count: jest.fn().mockResolvedValue(totalCount),
        findMany: jest.fn().mockResolvedValue(yearApplicants),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    } as unknown as PrismaService;
    const settingsService = {
      getCurrentApplicationYear: jest.fn().mockResolvedValue(defaultYear),
    } as unknown as SettingsService;
    return new DashboardService(prisma, settingsService);
  };

  const applicant = (
    overrides: Partial<Parameters<typeof buildService>[1][number]>,
  ) => ({
    id: '1',
    prefixName: 'นาย',
    firstName: 'A',
    lastName: 'B',
    applicationNumber: '001',
    status: 'PENDING',
    examResult: 'NOT_YET',
    reportInStatus: 'NOT_YET',
    gender: 'MALE',
    submittedAt: new Date('2024-01-01'),
    programId: 'p1',
    program: { name: 'โปรแกรม 1' },
    ...overrides,
  });

  it('scopes counts to the requested year and counts confirmed report-ins', async () => {
    const yearApplicants = [
      applicant({ reportInStatus: 'CONFIRMED' }),
      applicant({ id: '2', reportInStatus: 'NOT_YET' }),
    ];
    const service = buildService(999, yearApplicants);

    const stats = await service.getStats(2567);

    expect(stats.overview.currentYear).toBe(2567);
    expect(stats.overview.totalApplicants).toBe(999);
    expect(stats.overview.thisYearApplicants).toBe(2);
    expect(stats.overview.reportedInCount).toBe(1);
  });

  it('defaults to SettingsService.getCurrentApplicationYear() when no year is given', async () => {
    const service = buildService(0, [], 2570);

    const stats = await service.getStats();

    expect(stats.overview.currentYear).toBe(2570);
  });
});
