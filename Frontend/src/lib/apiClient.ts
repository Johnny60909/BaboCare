import type { AxiosResponse } from 'axios';
import axios from 'axios';
import { clearTokens, getRefreshToken, getToken, setRefreshToken, setToken } from './auth';

/**
 * 統一響應狀態碼
 */
export enum ResponseStateEnum {
  Success = 111,
  NotFound = 493,
  NoPermission = 495,
  Error = 999
}

/**
 * 統一響應結構
 */
export interface JsonResponse<T = any> {
  state: ResponseStateEnum;
  message: string | null;
  result: T;
}

/**
 * 分頁響應結構
 */
export interface JsonTableResponse<T = any> extends JsonResponse<T[]> {
  total: number;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
});

/**
 * 統一處理 API 響應
 */
export const handleApiResponse = <T>(
  response: AxiosResponse<JsonResponse<T>>,
): T => {
  const { state, message, result } = response.data;

  switch (state) {
    case ResponseStateEnum.Success:
      return result;
    case ResponseStateEnum.NotFound:
      // TODO: 可以集成 Mantine Notifications
      console.warn(message || 'Resource Not Found');
      return null as T;
    case ResponseStateEnum.NoPermission:
      // 權限不足，直接導向首頁並清除可能的過期狀態
      console.error('No Permission: Redirecting to home');
      window.location.href = "/";
      throw new Error("No Permission");
    case ResponseStateEnum.Error:
    default:
      console.error(message || 'API Error');
      throw new Error(message || "API Error");
  }
};

// 請求攔截器 - 自動添加 Access Token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// 處理待處理請求隊列
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

// 響應攔截器 - 處理 401 錯誤，自動刷新 token 並重試請求
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);

      const { data } = await axios.post(
        `${import.meta.env.VITE_IDENTITY_URL ?? 'http://localhost:5080'}/connect/token`,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      processQueue(null, data.access_token);
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
