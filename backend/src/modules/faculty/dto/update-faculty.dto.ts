import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFacultyDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
