import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApplicationStatus } from '@prisma/client';
import { UpdateStatusDto } from './update-status.dto';

describe('UpdateStatusDto', () => {
  it('requires a non-empty reason when status is REJECTED', async () => {
    const dto = plainToInstance(UpdateStatusDto, { status: ApplicationStatus.REJECTED });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('passes when status is REJECTED and reason is provided', async () => {
    const dto = plainToInstance(UpdateStatusDto, {
      status: ApplicationStatus.REJECTED,
      reason: 'เอกสารไม่ครบถ้วน',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('does not require reason for other statuses', async () => {
    const dto = plainToInstance(UpdateStatusDto, { status: ApplicationStatus.APPROVED });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status value', async () => {
    const dto = plainToInstance(UpdateStatusDto, { status: 'NOT_A_REAL_STATUS' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });
});
