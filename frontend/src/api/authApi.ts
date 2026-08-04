import type { User } from "../auth/AuthContext";
import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface SignupRequest {
  email: string;
  password: string,
  nickname:string,
  gender:number,
  birth:string,
  height:number,
}

export interface ProfileUpdateRequest {
  nickname?: string;
  gender?: number;
  birth?: string;
  height?: number;
}

export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
}

interface RefreshRequest {
  refresh_token: string;
}
export async function signup(data: SignupRequest) {
  const response = await api.post<SignupRequest>("/auth/signup", data);
  return response.data;
}

export async function login(data: LoginRequest) {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;
}

export async function refresh(data: RefreshRequest) {
  const response = await api.post<LoginResponse>("/auth/refresh", data);

  return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", {
    refresh_token: refreshToken,
  });
}
export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function updateMe(data: ProfileUpdateRequest): Promise<User> {
  const response = await api.patch<User>("/users/me", data);
  return response.data;
}

export async function changePassword(data: PasswordUpdateRequest): Promise<void> {
  await api.patch("/users/me/password", data);
}

export async function deleteMe(): Promise<void> {
  await api.delete("/users/me");
}
