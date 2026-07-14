export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'STAFF';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Faculty {
  id: string;
  name: string;
}

export type ProgramTrack = 'REGULAR' | 'SPECIAL';

export interface Program {
  id: string;
  name: string;
  nameEn?: string;
  facultyId: string;
  faculty: Faculty;
  degree: string;
  track: ProgramTrack;
  description?: string;
  duration?: number;
  maxQuota: number;
  currentApplicants: number;
  isFull: boolean;
  isActive: boolean;
}

export interface ApplicantDocument {
  id: string;
  type: 'PHOTO' | 'ID_CARD' | 'HOUSE_REGISTRATION' | 'TRANSCRIPT' | 'CERTIFICATE' | 'NAME_CHANGE' | 'OTHER';
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
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
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  pdpaConsent: boolean;
  consentedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents?: ApplicantDocument[];
}
