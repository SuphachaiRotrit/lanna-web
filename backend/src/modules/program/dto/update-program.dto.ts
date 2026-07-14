import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ProgramTrackDto, DEGREE_OPTIONS } from './create-program.dto';

export class UpdateProgramDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  facultyId?: string;

  @IsIn(DEGREE_OPTIONS)
  @IsOptional()
  degree?: string;

  @IsEnum(ProgramTrackDto)
  @IsOptional()
  track?: ProgramTrackDto;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  curriculum?: string;

  @IsString()
  @IsOptional()
  skills?: string;

  @IsString()
  @IsOptional()
  careerPaths?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  duration?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxQuota?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
