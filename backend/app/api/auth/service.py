from .schema import LoginRequest

def login(data: LoginRequest):
    """
    로그인 request 처리
    """
    return {
        "access_token": "test-token",
        "token_type": "bearer",
    }