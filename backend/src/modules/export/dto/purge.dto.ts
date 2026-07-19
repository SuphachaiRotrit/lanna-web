import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PurgeDto {
  @IsInt()
  @Min(2500)
  @Type(() => Number)
  year: number;
}
