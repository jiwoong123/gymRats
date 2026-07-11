import api from "./api";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface SignupRequest {
  email: string;
  password: string,
  nickname:string,
  gender:number,
  birth:string,
  height:number,
}

export async function signup(data: SignupRequest) {
  const response = await api.post<SignupRequest>("/auth/signup", data);
  return response.data;
}

export async function login(data: LoginRequest) {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;

}
export async function logout(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", {
    refresh_token: refreshToken,
  });
}