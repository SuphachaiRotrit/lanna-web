import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { AdminRole } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName?: string;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
