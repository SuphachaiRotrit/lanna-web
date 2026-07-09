import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

export enum StatusFilterDto {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class QueryApplicantDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by name or national ID

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(StatusFilterDto)
  status?: StatusFilterDto;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsInt()
  @Min(2500)
  @Type(() => Number)
  year?: number; // ปีการศึกษา

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'submittedAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
