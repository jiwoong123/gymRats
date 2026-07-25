import axios, { type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../auth/token";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error("Refresh token is missing");

  const response = await refreshClient.post<TokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  tokenStorage.setTokens(response.data.access_token, response.data.refresh_token);
  return response.data.access_token;
}

function expireAuthentication() {
  tokenStorage.clear();
  window.dispatchEvent(new Event("auth:expired"));
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as RetryableRequest | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isAuthRequest = request?.url?.startsWith("/auth/");

    if (!request || !isUnauthorized || isAuthRequest || request._retry) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const accessToken = await refreshPromise;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return api(request);
    } catch (refreshError) {
      expireAuthentication();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
