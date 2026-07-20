import { callAPI, AbortFunction } from "@/lib/call-api";
import { ApiResponse } from "@/types";

export interface UploadResult {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * POST /upload?folder=... - อัปโหลดไฟล์
 */
export const uploadFileApi = async (file: File, folder: string): Promise<[Promise<ApiResponse<UploadResult>>, AbortFunction]> => {
  const formData = new FormData();
  formData.append("file", file);
  return callAPI<ApiResponse<UploadResult>>("POST", "/upload", formData, {
    params: { folder },
  });
};
