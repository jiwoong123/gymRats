from fastapi import APIRouter

from app.api.auth.schema import SignupRequest, LoginRequest
from app.api.auth.services import login, signup

router = APIRouter()


@router.post("/signup")
def login_route(request: SignupRequest):
    return signup(request)


@router.post("/login")
def login_route(request: LoginRequest):
    return login(request)
