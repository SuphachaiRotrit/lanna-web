import { IsInt, Min, Max } from 'class-validator';

export class UpdateSettingDto {
  @IsInt()
  @Min(2500)
  @Max(2700)
  currentApplicationYear: number;
}
