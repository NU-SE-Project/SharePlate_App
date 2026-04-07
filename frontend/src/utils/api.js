import axios from "axios";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "../features/auth/utils/authStorage";

const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

function normalizeApiBaseUrl(rawUrl) {
  const trimmed = String(rawUrl || DEFAULT_API_BASE_URL).trim().replace(
    /\/+$/,
    "",
  );

  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const authRoutesToSkipRefresh = [
  "/auth/login",
  "/auth/google",
  "/auth/google/complete",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/verify-email",
  "/auth/validate-reset-token",
  "/auth/resend-verification",
];

function shouldSkipRefresh(url = "") {
  return authRoutesToSkipRefresh.some((route) => url.includes(route));
}

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredAuth();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshPromise = null;

async function refreshAuthSession() {
  const response = await axios.post(
    REFRESH_URL,
    {},
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const nextAuth = {
    accessToken: response.data?.accessToken || null,
    user: response.data?.user || null,
  };

  if (!nextAuth.accessToken || !nextAuth.user) {
    throw new Error("Refresh response did not include a complete auth payload");
  }

  setStoredAuth(nextAuth);
  return nextAuth;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh(requestUrl)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise || refreshAuthSession();
      const refreshedAuth = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${refreshedAuth.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearStoredAuth();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export default api;
