import { IsEnum, IsString, IsNotEmpty, ValidateIf } from 'class-validator';
import { ReportInStatus } from '@prisma/client';

export class UpdateReportInDto {
  @IsEnum(ReportInStatus)
  reportInStatus: ReportInStatus;

  @ValidateIf(
    (o: UpdateReportInDto) => o.reportInStatus === ReportInStatus.REJECTED,
  )
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
