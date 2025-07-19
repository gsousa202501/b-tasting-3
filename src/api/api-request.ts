import { authStorage } from "@/lib/auth-storage";
import axios, { AxiosRequestConfig, Method } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3005/",
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();

  if (token) {
    config.headers = {
      ...config.headers,
      "x-access-token": token,
    };
  }

  config.headers["x-sistema"] = import.meta.env.VITE_APP_NAME || "B-TASTING";
  config.headers["x-versao"] = import.meta.env.VITE_APP_VERSION || "1.0.0";

  return config;
});

export interface ApiResponse<T> {
  data: T | null;
  message: string | null;
  metadata: string | null;
  error: string | null;
}

export async function apiRequest<T, B = unknown>(
  method: Method,
  url: string,
  options?: {
    body?: B;
    config?: AxiosRequestConfig;
  }
): Promise<ApiResponse<T>> {
  const { body, config } = options || {};

  const response = await apiClient.request<ApiResponse<T>>({
    method,
    url,
    data: body,
    ...config,
  });

  return response.data;
}
