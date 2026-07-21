import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";

/**
 * ADMIN: GET /admin/notifications/token - ขอ Firebase custom token สำหรับ subscribe realtime
 */
export const getNotificationTokenApi = async (): Promise<[Promise<ApiResponse<{ token: string | null }>>, AbortFunction]> => {
  return callAPI<ApiResponse<{ token: string | null }>>("GET", "/admin/notifications/token");
};

/**
 * ADMIN: PATCH /admin/notifications/read - ทำเครื่องหมายอ่านแจ้งเตือนทั้งหมดแล้ว
 */
export const markNotificationsReadApi = async (): Promise<[Promise<ApiResponse<{ notificationsReadAt: string }>>, AbortFunction]> => {
  return callAPI<ApiResponse<{ notificationsReadAt: string }>>("PATCH", "/admin/notifications/read");
};
