from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    
    password: str = Field(min_length=8, max_length=100)

    nickname: str = Field(max_length=20)

    gender: int

    birth: date

    height: float


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


class UserResponse(BaseModel):
    id: int

    email: str

    nickname: str

    model_config = ConfigDict(from_attributes=True)