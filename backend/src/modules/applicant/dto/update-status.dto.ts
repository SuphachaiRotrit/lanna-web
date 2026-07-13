import { IsEnum, IsString, IsNotEmpty, ValidateIf } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ValidateIf((o: UpdateStatusDto) => o.status === ApplicationStatus.REJECTED)
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
