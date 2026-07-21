import {
  IsOptional,
  IsString,
  IsEnum,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';
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

export enum ExamResultFilterDto {
  NOT_YET = 'NOT_YET',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

export enum ReportInStatusFilterDto {
  NOT_YET = 'NOT_YET',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
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
  @IsEnum(ExamResultFilterDto)
  examResult?: ExamResultFilterDto;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(ReportInStatusFilterDto)
  reportInStatus?: ReportInStatusFilterDto;

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
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
