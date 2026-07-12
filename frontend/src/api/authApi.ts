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
  const response = await api.post<LoginResponse>("/auth/login", data);

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