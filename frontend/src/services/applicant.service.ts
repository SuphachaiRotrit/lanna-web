import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse, Pagination, Applicant } from "@/types";

export type { Applicant };

/**
 * ADMIN: GET /admin/applicants - รายการผู้สมัคร
 */
export const listApplicantsApi = async (params: Record<string, unknown>): Promise<[Promise<ApiResponse<{ rows: Applicant[], pagination: Pagination }>>, AbortFunction]> => {
  return callAPI<ApiResponse<{ rows: Applicant[], pagination: Pagination }>>("GET", "/admin/applicants", null, { params });
};

/**
 * ADMIN: GET /admin/applicants/:id - รายละเอียดผู้สมัคร
 */
export const getApplicantApi = async (id: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("GET", `/admin/applicants/${id}`);
};

/**
 * ADMIN: PATCH /admin/applicants/:id/status - อัปเดตสถานะ
 */
export const updateApplicantStatusApi = async (id: string, status: string, reason?: string): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("PATCH", `/admin/applicants/${id}/status`, { status, reason });
};

/**
 * ADMIN: POST /admin/export/:type - ส่งออกข้อมูล (Excel/PDF)
 */
export const exportApplicantsApi = async (type: 'excel' | 'pdf', data: Record<string, unknown>): Promise<[Promise<Blob>, AbortFunction]> => {
  return callAPI<Blob>("POST", `/admin/export/${type}`, data, { responseType: 'blob' });
};

/**
 * PUBLIC: POST /applicants - ส่งใบสมัครเรียนใหม่
 */
export const createApplicantApi = async (data: Record<string, unknown>): Promise<[Promise<ApiResponse<Applicant>>, AbortFunction]> => {
  return callAPI<ApiResponse<Applicant>>("POST", "/applicants", data);
};

/**
 * PUBLIC: POST /applicants/:id/documents - อัปโหลดเอกสาร
 */
export const uploadDocumentApi = async (id: string, type: string, file: File): Promise<[Promise<ApiResponse<unknown>>, AbortFunction]> => {
  const formData = new FormData();
  formData.append('file', file);
  return callAPI<ApiResponse<unknown>>("POST", `/applicants/${id}/documents?type=${type}`, formData);
};
