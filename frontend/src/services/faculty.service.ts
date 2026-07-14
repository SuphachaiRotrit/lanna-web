import { callAPI, AbortFunction } from "@/lib/call-api";
import { Faculty, ApiResponse } from "@/types";

/**
 * ADMIN: GET /admin/faculties - รายการคณะทั้งหมด
 */
export const listFacultiesAdminApi = async (): Promise<[Promise<ApiResponse<Faculty[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<Faculty[]>>("GET", "/admin/faculties");
};

/**
 * ADMIN: POST /admin/faculties - เพิ่มคณะใหม่
 */
export const createFacultyApi = async (data: { name: string }): Promise<[Promise<ApiResponse<Faculty>>, AbortFunction]> => {
  return callAPI<ApiResponse<Faculty>>("POST", "/admin/faculties", data);
};

/**
 * ADMIN: PUT /admin/faculties/:id - แก้ไขคณะ
 */
export const updateFacultyApi = async (id: string, data: { name: string }): Promise<[Promise<ApiResponse<Faculty>>, AbortFunction]> => {
  return callAPI<ApiResponse<Faculty>>("PUT", `/admin/faculties/${id}`, data);
};

/**
 * ADMIN: DELETE /admin/faculties/:id - ลบคณะ
 */
export const deleteFacultyApi = async (id: string): Promise<[Promise<ApiResponse<null>>, AbortFunction]> => {
  return callAPI<ApiResponse<null>>("DELETE", `/admin/faculties/${id}`);
};
