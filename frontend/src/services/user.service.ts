import { callAPI, AbortFunction } from "@/lib/call-api";
import { User, ApiResponse } from "@/types";

export interface CreateUserPayload {
  email: string;
  fullName: string;
  password: string;
  role: 'SUPER_ADMIN' | 'STAFF';
}

export interface UpdateUserPayload {
  fullName?: string;
  role?: 'SUPER_ADMIN' | 'STAFF';
  isActive?: boolean;
  password?: string;
}

/**
 * ADMIN: GET /admin/users - รายการผู้ใช้ทั้งหมด
 */
export const listUsersApi = async (): Promise<[Promise<ApiResponse<User[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<User[]>>("GET", "/admin/users");
};

/**
 * ADMIN: POST /admin/users - เพิ่มผู้ใช้ใหม่
 */
export const createUserApi = async (data: CreateUserPayload): Promise<[Promise<ApiResponse<User>>, AbortFunction]> => {
  return callAPI<ApiResponse<User>>("POST", "/admin/users", data);
};

/**
 * ADMIN: PUT /admin/users/:id - แก้ไขผู้ใช้
 */
export const updateUserApi = async (id: string, data: UpdateUserPayload): Promise<[Promise<ApiResponse<User>>, AbortFunction]> => {
  return callAPI<ApiResponse<User>>("PUT", `/admin/users/${id}`, data);
};

/**
 * ADMIN: DELETE /admin/users/:id - ปิดใช้งานผู้ใช้ (soft delete)
 */
export const deleteUserApi = async (id: string): Promise<[Promise<ApiResponse<null>>, AbortFunction]> => {
  return callAPI<ApiResponse<null>>("DELETE", `/admin/users/${id}`);
};
