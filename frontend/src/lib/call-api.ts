import axios, { AxiosError, AxiosRequestConfig, Method } from "axios";

// สร้าง Instance ของ Axios เพื่อกำหนดค่าพื้นฐาน
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://lanna-web-mbu.vercel.app/api",
  withCredentials: true,
});

// Note: Authentication is now handled via HttpOnly Cookies.
// No need to manually attach Bearer tokens.

// เมื่อ accessToken (อายุ 15 นาที) หมดอายุ ให้แลก accessToken ใหม่ด้วย
// refreshToken cookie (อายุ 7 วัน) แบบเงียบๆ แล้วค่อย retry request เดิม
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthEndpoint = config?.url?.includes("/auth/refresh") || config?.url?.includes("/auth/login");

    if (error.response?.status !== 401 || !config || config._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }
    config._retried = true;

    // ponytail: single-flight — request 401 พร้อมกันหลายตัว ใช้ refresh call เดียวกัน
    if (!refreshPromise) {
      refreshPromise = api
        .post("/auth/refresh")
        .then(() => undefined)
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      return api.request(config);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

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

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};
