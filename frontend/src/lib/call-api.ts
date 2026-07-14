import axios, { AxiosProgressEvent, AxiosRequestConfig, Method } from "axios";

// สร้าง Instance ของ Axios เพื่อกำหนดค่าพื้นฐาน
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

// Note: Authentication is now handled via HttpOnly Cookies.
// No need to manually attach Bearer tokens.

export type AbortFunction = () => void;

/**
 * 🚀 callAPI: Helper สำหรับเรียก API ที่รองรับการยกเลิก (Abort)
 */
export const callAPI = <T>(
  method: Method,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): [Promise<T>, AbortFunction] => {
  const controller = new AbortController();
  
  const promise = api
    .request<T>({
      ...config,
      method,
      url,
      data,
      signal: controller.signal,
    })
    .then((res) => res.data);

  const abort = () => controller.abort();

  return [promise, abort];
};

// เอาไว้แปลง AxiosProgressEvent เป็น % จำนวนเต็ม สำหรับแสดงผลระหว่างโหลด
export const onProgress = (cb?: (percent: number) => void) =>
  cb && ((e: AxiosProgressEvent) => cb(Math.round((e.progress ?? 0) * 100)));

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};
