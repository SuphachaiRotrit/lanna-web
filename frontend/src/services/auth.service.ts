import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

/**
 * POST /auth/login - เข้าสู่ระบบแอดมิน
 */
export const loginApi = async (data: any): Promise<[Promise<ApiResponse<LoginResponse>>, AbortFunction]> => {
  return callAPI<ApiResponse<LoginResponse>>("POST", "/auth/login", data);
};

/**
 * POST /auth/logout - ออกจากระบบ
 */
export const logoutApi = async (): Promise<[Promise<ApiResponse<null>>, AbortFunction]> => {
  return callAPI<ApiResponse<null>>("POST", "/auth/logout");
};

/**
 * GET /auth/me - ดึงข้อมูลโปรไฟล์ตัวเอง
 */
export const getMeApi = async (): Promise<[Promise<ApiResponse<{ user: LoginResponse['user'] }>>, AbortFunction]> => {
  return callAPI<ApiResponse<{ user: LoginResponse['user'] }>>("GET", "/auth/me");
};
