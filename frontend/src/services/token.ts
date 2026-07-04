export const tokenStorage = {
  getAccessToken: () => localStorage.getItem("access_token"),
  setAccessToken: (token: string) => localStorage.setItem("access_token", token),

  getRefreshToken: () => localStorage.getItem("refresh_token"),
  setRefreshToken: (token: string) => localStorage.setItem("refresh_token", token),

  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};