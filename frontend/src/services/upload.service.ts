import { callAPI, AbortFunction } from "@/lib/call-api";

export interface UploadResult {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/**
 * POST /upload?folder=... - อัปโหลดไฟล์
 */
export const uploadFileApi = async (file: File, folder: string): Promise<[Promise<UploadResult>, AbortFunction]> => {
  const formData = new FormData();
  formData.append("file", file);
  return callAPI<UploadResult>("POST", "/upload", formData, {
    params: { folder },
    headers: { "Content-Type": "multipart/form-data" },
  });
};
