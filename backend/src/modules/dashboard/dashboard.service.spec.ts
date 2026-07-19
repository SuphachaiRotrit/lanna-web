import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DashboardService.getStats', () => {
  const buildService = (count: jest.Mock) => {
    const prisma = {
      applicant: {
        count,
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      program: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    } as unknown as PrismaService;
    return new DashboardService(prisma);
  };

  it('scopes counts to the requested year and counts confirmed report-ins', async () => {
    const count = jest
      .fn()
      .mockImplementation((args?: { where?: Record<string, unknown> }) => {
        if (!args) return Promise.resolve(999); // all-time total (no where clause)
        if (args.where?.reportInStatus === 'CONFIRMED')
          return Promise.resolve(7);
        return Promise.resolve(42);
      });
    const service = buildService(count);

    const stats = await service.getStats(2567);

    expect(stats.overview.currentYear).toBe(2567);
    expect(stats.overview.thisYearApplicants).toBe(42);
    expect(stats.overview.reportedInCount).toBe(7);
    expect(count).toHaveBeenCalledWith({
      where: { applicationYear: 2567, reportInStatus: 'CONFIRMED' },
    });
  });

  it('defaults to the current Buddhist-era year when no year is given', async () => {
    const count = jest.fn().mockResolvedValue(0);
    const service = buildService(count);

    const stats = await service.getStats();

    const expectedYear = new Date().getFullYear() + 543;
    expect(stats.overview.currentYear).toBe(expectedYear);
  });
});
