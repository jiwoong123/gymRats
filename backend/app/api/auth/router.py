from fastapi import APIRouter

from .schema import LoginRequest
from .service import login

router = APIRouter()

@router.post("/login")
def login_route(request: LoginRequest):
    return login(request)

@router.post("/logout")
def login_route(request: LoginRequest):
    return login(request)

@router.post("/signup")
def login_route(request: LoginRequest):
    return login(request)
