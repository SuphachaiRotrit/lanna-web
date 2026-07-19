import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ReportInStatus } from '@prisma/client';
import { UpdateReportInDto } from './update-report-in.dto';

describe('UpdateReportInDto', () => {
  it('requires a non-empty reason when reportInStatus is REJECTED', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: ReportInStatus.REJECTED,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('passes when reportInStatus is REJECTED and reason is provided', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: ReportInStatus.REJECTED,
      reason: 'ไม่มารายงานตัวตามกำหนด',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('does not require reason when reportInStatus is CONFIRMED', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: ReportInStatus.CONFIRMED,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid reportInStatus value', async () => {
    const dto = plainToInstance(UpdateReportInDto, {
      reportInStatus: 'NOT_A_REAL_STATUS',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reportInStatus')).toBe(true);
  });
});
