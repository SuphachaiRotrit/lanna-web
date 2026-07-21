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

export interface LoginCredentials {
  email: string;
  password: string;
  turnstileToken: string;
}

/**
 * POST /auth/login - เข้าสู่ระบบแอดมิน
 */
export const loginApi = async (data: LoginCredentials): Promise<[Promise<ApiResponse<LoginResponse>>, AbortFunction]> => {
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

/**
 * POST /auth/refresh - ขอ accessToken ใหม่ด้วย refreshToken cookie
 */
export const refreshApi = async (): Promise<[Promise<ApiResponse<{ accessToken: string }>>, AbortFunction]> => {
  return callAPI<ApiResponse<{ accessToken: string }>>("POST", "/auth/refresh");
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * POST /auth/change-password - เปลี่ยนรหัสผ่านของตัวเอง
 */
export const changePasswordApi = async (data: ChangePasswordPayload): Promise<[Promise<ApiResponse<{ success: boolean }>>, AbortFunction]> => {
  return callAPI<ApiResponse<{ success: boolean }>>("POST", "/auth/change-password", data);
};
