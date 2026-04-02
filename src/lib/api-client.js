import axios from "axios";

import {
  clearAuthStorage,
  getStoredAccessToken,
  setStoredAccessToken,
} from "./storage";

const baseURL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(
  /\/$/,
  "",
);

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
    const isAuthEntryCall =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/logout");

    if (
      !isUnauthorized ||
      originalRequest?._retry ||
      isRefreshCall ||
      isAuthEntryCall
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= apiClient.post("/auth/refresh");
      const { data } = await refreshPromise;
      refreshPromise = null;

      setStoredAccessToken(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      clearAuthStorage();
      return Promise.reject(refreshError);
    }
  },
);
