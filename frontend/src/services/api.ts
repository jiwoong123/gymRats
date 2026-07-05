import axios from "axios";

const api = axios.create({
    baseURL: "https://improved-space-parakeet-wp56w9r97r2v66g-8000.app.github.dev",
});

api.interceptors.request.use((config) => {
     const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken =
                    localStorage.getItem("refresh_token");

                const response = await axios.post(
                    "https://improved-space-parakeet-wp56w9r97r2v66g-8000.app.github.dev/api/auth/refresh",
                    {
                        refresh_token: refreshToken,
                    }
                );

                const newAccessToken = response.data.access_token;

                localStorage.setItem(
                    "access_token",
                    newAccessToken
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;