import api from "./api";

export async function verifyToken(): Promise<boolean> {
  try {
    await api.get("/auth/me");
    return true;
  } catch {
    return false;
  }
}