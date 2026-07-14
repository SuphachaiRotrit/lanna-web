import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum ProgramTrackDto {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL',
}

export const DEGREE_OPTIONS = ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'];

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsNotEmpty()
  facultyId: string;

  @IsIn(DEGREE_OPTIONS)
  degree: string;

  @IsEnum(ProgramTrackDto)
  @IsOptional()
  track?: ProgramTrackDto;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  duration?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxQuota?: number;
}
