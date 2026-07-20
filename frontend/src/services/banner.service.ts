import { callAPI, AbortFunction } from "@/lib/call-api";
import { Banner, ApiResponse } from "@/types";

/**
 * GET /banners - รายการสไลด์โชว์ที่เปิดใช้งาน
 */
export const listBannersApi = async (): Promise<[Promise<ApiResponse<Banner[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<Banner[]>>("GET", "/banners");
};

/**
 * ADMIN: GET /admin/banners - รายการสไลด์โชว์ทั้งหมด (รวมที่ปิดใช้งาน)
 */
export const listBannersAdminApi = async (): Promise<[Promise<ApiResponse<Banner[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<Banner[]>>("GET", "/admin/banners");
};

/**
 * ADMIN: POST /admin/banners - เพิ่มสไลด์ใหม่
 */
export const createBannerApi = async (data: Partial<Banner>): Promise<[Promise<ApiResponse<Banner>>, AbortFunction]> => {
  return callAPI<ApiResponse<Banner>>("POST", "/admin/banners", data);
};

/**
 * ADMIN: PUT /admin/banners/:id - แก้ไขสไลด์
 */
export const updateBannerApi = async (id: string, data: Partial<Banner>): Promise<[Promise<ApiResponse<Banner>>, AbortFunction]> => {
  return callAPI<ApiResponse<Banner>>("PUT", `/admin/banners/${id}`, data);
};

/**
 * ADMIN: DELETE /admin/banners/:id - ลบสไลด์
 */
export const deleteBannerApi = async (id: string): Promise<[Promise<ApiResponse<null>>, AbortFunction]> => {
  return callAPI<ApiResponse<null>>("DELETE", `/admin/banners/${id}`);
};

/**
 * ADMIN: PATCH /admin/banners/reorder - เรียงลำดับสไลด์ใหม่
 */
export const reorderBannersApi = async (ids: string[]): Promise<[Promise<ApiResponse<Banner[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<Banner[]>>("PATCH", "/admin/banners/reorder", { ids });
};
