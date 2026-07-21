import { callAPI, AbortFunction } from "@/lib/call-api";
import { AppSetting, ApiResponse } from "@/types";

/**
 * GET /settings - อ่านปีการศึกษาที่เปิดรับสมัครปัจจุบัน
 */
export const getSettingApi = async (): Promise<[Promise<ApiResponse<AppSetting>>, AbortFunction]> => {
  return callAPI<ApiResponse<AppSetting>>("GET", "/settings");
};

/**
 * ADMIN: PUT /admin/settings - แก้ไขปีการศึกษาที่เปิดรับสมัคร (SUPER_ADMIN เท่านั้น)
 */
export const updateSettingApi = async (data: AppSetting): Promise<[Promise<ApiResponse<AppSetting>>, AbortFunction]> => {
  return callAPI<ApiResponse<AppSetting>>("PUT", "/admin/settings", data);
};
