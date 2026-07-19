import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ExamResult } from '@prisma/client';
import { UpdateExamDto } from './update-exam.dto';

describe('UpdateExamDto', () => {
  it('accepts a valid exam result', async () => {
    const dto = plainToInstance(UpdateExamDto, { examResult: ExamResult.PASSED });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid exam result value', async () => {
    const dto = plainToInstance(UpdateExamDto, { examResult: 'NOT_A_REAL_RESULT' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'examResult')).toBe(true);
  });

  it('rejects a missing exam result', async () => {
    const dto = plainToInstance(UpdateExamDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'examResult')).toBe(true);
  });
});
