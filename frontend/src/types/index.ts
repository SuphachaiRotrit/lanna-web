export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN';
  createdAt: string;
}

export interface Program {
  id: string;
  name: string;
  nameEn?: string;
  faculty: string;
  degree: string;
  description?: string;
  duration?: string;
  maxQuota: number;
  currentApplicants: number;
  isFull: boolean;
  isActive: boolean;
}

export interface Applicant {
  id: string;
  prefixName: string;
  firstName: string;
  lastName: string;
  aliasName?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  nationalId: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
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
  schoolProvince?: string;
  gpa?: number;
  graduationYear?: string;
  applicationReason?: string;
  hasTranscript: boolean;
  hasHouseRegistration: boolean;
  hasIdCard: boolean;
  hasNameChange: boolean;
  hasPhoto: boolean;
  programId: string;
  program?: Program;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  applicationNumber: string;
  applicationYear: number;
  submittedAt: string;
}
