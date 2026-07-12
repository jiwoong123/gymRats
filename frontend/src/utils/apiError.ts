import axios from "axios";

export function getErrorMessage(error: unknown) {

    if (!axios.isAxiosError(error))
        return "알 수 없는 오류가 발생했습니다.";

    return (
        error.response?.data?.detail ??
        "오류가 발생했습니다."
    );
}