import { callAPI, AbortFunction } from "@/lib/call-api";
import { Program, ApiResponse } from "@/types";

/**
 * GET /programs - รายการหลักสูตรทั้งหมดพร้อมสถานะโควตา
 */
export const listProgramsApi = async (): Promise<[Promise<ApiResponse<Program[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<Program[]>>("GET", "/programs");
};

/**
 * ADMIN: GET /admin/programs - รายการหลักสูตรทั้งหมด (รวมที่ปิดรับ)
 */
export const listProgramsAdminApi = async (): Promise<[Promise<ApiResponse<Program[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<Program[]>>("GET", "/admin/programs");
};

/**
 * ADMIN: POST /admin/programs - เพิ่มหลักสูตรใหม่
 */
export const createProgramApi = async (data: Partial<Program>): Promise<[Promise<ApiResponse<Program>>, AbortFunction]> => {
  return callAPI<ApiResponse<Program>>("POST", "/admin/programs", data);
};

/**
 * ADMIN: PUT /admin/programs/:id - แก้ไขหลักสูตร
 */
export const updateProgramApi = async (id: string, data: Partial<Program>): Promise<[Promise<ApiResponse<Program>>, AbortFunction]> => {
  return callAPI<ApiResponse<Program>>("PUT", `/admin/programs/${id}`, data);
};

/**
 * ADMIN: DELETE /admin/programs/:id - ลบหลักสูตร
 */
export const deleteProgramApi = async (id: string): Promise<[Promise<ApiResponse<null>>, AbortFunction]> => {
  return callAPI<ApiResponse<null>>("DELETE", `/admin/programs/${id}`);
};
