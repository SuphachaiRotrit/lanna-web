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

export interface AppSetting {
  currentApplicationYear: number;
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
  curriculum?: string;
  skills?: string;
  careerPaths?: string;
  duration?: number;
  maxQuota: number;
  currentApplicants: number;
  isFull: boolean;
  isActive: boolean;
}

export interface Banner {
  id: string;
  imageKey: string;
  imageUrl: string;
  title?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export type ExamResult = 'NOT_YET' | 'PASSED' | 'FAILED';
export type ReportInStatus = 'NOT_YET' | 'CONFIRMED' | 'REJECTED';

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
  examResult: ExamResult;
  reportInStatus: ReportInStatus;
  reportInReason?: string;
  reportInAt?: string;
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
