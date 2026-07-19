import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PurgeDto } from './purge.dto';

describe('PurgeDto', () => {
  it('accepts a valid year', async () => {
    const dto = plainToInstance(PurgeDto, { year: 2567 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing year', async () => {
    const dto = plainToInstance(PurgeDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'year')).toBe(true);
  });

  it('rejects a year below 2500', async () => {
    const dto = plainToInstance(PurgeDto, { year: 100 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'year')).toBe(true);
  });
});
