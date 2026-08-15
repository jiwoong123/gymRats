from datetime import date

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

TrainingLevel = Literal["untrained", "novice", "intermediate", "advanced", "elite"]


class SignupRequest(BaseModel):
    email: EmailStr
    
    password: str = Field(min_length=8, max_length=100)

    nickname: str = Field(max_length=20)

    gender: int

    birth: date

    height: float

    training_level: TrainingLevel = "untrained"
    email_verification_token: str = Field(min_length=20, max_length=200)


class EmailVerificationRequest(BaseModel):
    email: EmailStr


class EmailVerificationRequestResponse(BaseModel):
    challenge_id: int
    expires_in: int = 600


class EmailVerificationConfirmRequest(BaseModel):
    email: EmailStr
    challenge_id: int
    code: str = Field(pattern=r"^\d{6}$")


class EmailVerificationConfirmResponse(BaseModel):
    verification_token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: str

# Response
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


class UserResponse(BaseModel):
    id: int

    email: str

    nickname: str

    model_config = ConfigDict(from_attributes=True)
