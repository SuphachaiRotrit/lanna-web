import { IsArray, IsString } from 'class-validator';

export class ReorderBannersDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
