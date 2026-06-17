import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  Length,
  Min,
  Max,
  Matches,
} from 'class-validator';

export enum GenderDto {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateApplicantDto {
  // ข้อมูลส่วนตัว
  @IsString()
  @IsNotEmpty()
  prefixName: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  aliasName?: string;

  @IsString()
  @IsOptional()
  firstNameEn?: string;

  @IsString()
  @IsOptional()
  lastNameEn?: string;

  @IsString()
  @IsNotEmpty()
  @Length(13, 13, { message: 'National ID must be exactly 13 digits' })
  @Matches(/^\d{13}$/, { message: 'National ID must contain only digits' })
  nationalId: string;

  @IsEnum(GenderDto)
  gender: GenderDto;

  @IsDateString()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  ethnicity: string;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsString()
  @IsNotEmpty()
  religion: string;

  @IsString()
  @IsOptional()
  bloodType?: string;

  // ข้อมูลติดต่อ
  @IsString()
  @IsNotEmpty()
  @Matches(/^0\d{8,9}$/, { message: 'Invalid Thai phone number' })
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  lineId?: string;

  // ที่อยู่
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  subDistrict: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 5)
  postalCode: string;

  // การศึกษา
  @IsString()
  @IsNotEmpty()
  previousSchool: string;

  @IsString()
  @IsNotEmpty()
  previousEducation: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(4)
  gpa?: number;

  @IsString()
  @IsOptional()
  graduationYear?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  schoolProvince?: string;

  @IsString()
  @IsOptional()
  applicationReason?: string;

  // หลักสูตร
  @IsString()
  @IsNotEmpty()
  programId: string;

  // ผู้ปกครอง
  @IsString()
  @IsOptional()
  parentName?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsString()
  @IsOptional()
  parentRelation?: string;

  // PDPA
  @IsBoolean()
  pdpaConsent: boolean;

  @IsString()
  @IsNotEmpty()
  turnstileToken: string;

  // รายการเอกสาร
  @IsBoolean()
  @IsOptional()
  hasTranscript?: boolean;

  @IsBoolean()
  @IsOptional()
  hasHouseRegistration?: boolean;

  @IsBoolean()
  @IsOptional()
  hasIdCard?: boolean;

  @IsBoolean()
  @IsOptional()
  hasNameChange?: boolean;

  @IsBoolean()
  @IsOptional()
  hasPhoto?: boolean;
}
