import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";

export interface Applicant {
  id: string;
  applicationNumber: string;
  prefixName: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DOCUMENT_REJECTED';
  program?: {
    name: string;
    faculty: string;
  };
  createdAt: string;
}

/**
 * ADMIN: GET /admin/applicants - รายการผู้สมัคร
 */
export const listApplicantsApi = async (params: any): Promise<[Promise<ApiResponse<{ rows: Applicant[], pagination: any }>>, AbortFunction]> => {
  return callAPI<ApiResponse<{ rows: Applicant[], pagination: any }>>("GET", "/admin/applicants", null, { params });
};

/**
 * ADMIN: PATCH /admin/applicants/:id/status - อัปเดตสถานะ
 */
export const updateApplicantStatusApi = async (id: string, status: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("PATCH", `/admin/applicants/${id}/status`, { status });
};

/**
 * ADMIN: POST /admin/export/:type - ส่งออกข้อมูล (Excel/PDF)
 */
export const exportApplicantsApi = async (type: 'excel' | 'pdf', data: any): Promise<[Promise<Blob>, AbortFunction]> => {
  return callAPI<Blob>("POST", `/admin/export/${type}`, data, { responseType: 'blob' });
};

/**
 * PUBLIC: POST /applicants - ส่งใบสมัครเรียนใหม่
 */
export const createApplicantApi = async (data: any): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("POST", "/applicants", data);
};

/**
 * PUBLIC: POST /applicants/:id/documents - อัปโหลดเอกสาร
 */
export const uploadDocumentApi = async (id: string, type: string, file: File): Promise<[Promise<ApiResponse<any>>, AbortFunction]> => {
  const formData = new FormData();
  formData.append('file', file);
  return callAPI<ApiResponse<any>>("POST", `/applicants/${id}/documents?type=${type}`, formData);
};
