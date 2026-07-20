import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CheckStatusDto {
  @IsString()
  @IsNotEmpty()
  applicationNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(13, 13, { message: 'National ID must be exactly 13 digits' })
  @Matches(/^\d{13}$/, { message: 'National ID must contain only digits' })
  nationalId: string;
}
