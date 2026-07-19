import { IsEnum } from 'class-validator';
import { ExamResult } from '@prisma/client';

export class UpdateExamDto {
  @IsEnum(ExamResult)
  examResult: ExamResult;
}
