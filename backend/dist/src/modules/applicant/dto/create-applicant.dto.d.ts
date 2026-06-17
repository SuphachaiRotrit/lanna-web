export declare enum GenderDto {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER"
}
export declare class CreateApplicantDto {
    prefixName: string;
    firstName: string;
    lastName: string;
    aliasName?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    nationalId: string;
    gender: GenderDto;
    birthDate: string;
    ethnicity: string;
    nationality: string;
    religion: string;
    bloodType?: string;
    phone: string;
    email?: string;
    lineId?: string;
    address: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    previousSchool: string;
    previousEducation: string;
    gpa?: number;
    graduationYear?: string;
    schoolProvince?: string;
    applicationReason?: string;
    programId: string;
    parentName?: string;
    parentPhone?: string;
    parentRelation?: string;
    pdpaConsent: boolean;
    turnstileToken: string;
    hasTranscript?: boolean;
    hasHouseRegistration?: boolean;
    hasIdCard?: boolean;
    hasNameChange?: boolean;
    hasPhoto?: boolean;
}
