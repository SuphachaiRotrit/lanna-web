import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  imageKey: string;

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
