from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class DriverToken(Token):
    expires_at: Optional[datetime] = None


class AdminToken(Token):
    expires_at: Optional[datetime] = None


class UserIdentity(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
