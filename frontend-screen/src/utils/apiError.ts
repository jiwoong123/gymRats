import axios from "axios";

export function getErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        return error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
    }

    const data = error.response?.data;
    const serverMessage = data?.detail ?? data?.message ?? data?.error;

    if (typeof serverMessage === "string") {
        return serverMessage;
    }

    return error.message || "오류가 발생했습니다.";
}
