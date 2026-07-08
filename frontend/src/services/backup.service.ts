import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";

export interface BackupLog {
  id: string;
  startedAt: string;
  finishedAt: string;
  status: 'success' | 'failed';
  fileCount: number;
  totalSize: string;
  driveFileId: string | null;
  message: string | null;
}

/**
 * ADMIN: GET /admin/backup/logs - ขอรายการบันทึกการสำรองข้อมูล
 */
export const fetchBackupLogsApi = async (): Promise<[Promise<ApiResponse<BackupLog[]>>, AbortFunction]> => {
  return callAPI<ApiResponse<BackupLog[]>>("GET", "/admin/backup/logs");
};

/**
 * ADMIN: POST /admin/backup/trigger - เริ่มกระบวนการสำรองข้อมูลทันที
 */
export const triggerBackupApi = async (): Promise<[Promise<ApiResponse<any>>, AbortFunction]> => {
  return callAPI<ApiResponse<any>>("POST", "/admin/backup/trigger");
};
