import api from "./api";
import { tokenStorage } from "./token";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export async function login(data: LoginRequest) {
  const response = await api.post<LoginResponse>("/api/auth/login", data);

  tokenStorage.setAccessToken(response.data.access_token);
  tokenStorage.setRefreshToken(response.data.refresh_token);

  return response.data;
}