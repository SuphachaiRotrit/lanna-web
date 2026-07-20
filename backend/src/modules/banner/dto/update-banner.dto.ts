import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBannerDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  imageKey?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
