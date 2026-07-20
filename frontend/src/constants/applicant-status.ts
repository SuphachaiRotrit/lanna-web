import { Applicant } from '@/types';

export const STATUS_LABELS: Record<Applicant['status'], string> = {
  PENDING: 'รอตรวจสอบ',
  REVIEWING: 'กำลังตรวจสอบ',
  APPROVED: 'ผ่านการสมัคร',
  REJECTED: 'ไม่ผ่านการสมัคร',
  CANCELLED: 'ยกเลิก',
};

export const STATUS_STYLES: Record<Applicant['status'], string> = {
  PENDING: 'bg-orange-100 text-orange-600',
  REVIEWING: 'bg-blue-100 text-blue-600',
  APPROVED: 'bg-emerald-100 text-emerald-600',
  REJECTED: 'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export const EXAM_RESULT_LABELS: Record<Applicant['examResult'], string> = {
  NOT_YET: 'รอสอบ',
  PASSED: 'สอบผ่าน',
  FAILED: 'สอบไม่ผ่าน',
};

export const EXAM_RESULT_STYLES: Record<Applicant['examResult'], string> = {
  NOT_YET: 'bg-gray-100 text-gray-500',
  PASSED: 'bg-emerald-100 text-emerald-600',
  FAILED: 'bg-red-100 text-red-600',
};

export const REPORT_IN_LABELS: Record<Applicant['reportInStatus'], string> = {
  NOT_YET: 'ยังไม่รายงานตัว',
  CONFIRMED: 'รายงานตัวแล้ว',
  REJECTED: 'ปฏิเสธรายงานตัว',
};

export const REPORT_IN_STYLES: Record<Applicant['reportInStatus'], string> = {
  NOT_YET: 'bg-gray-100 text-gray-500',
  CONFIRMED: 'bg-emerald-100 text-emerald-600',
  REJECTED: 'bg-red-100 text-red-600',
};
