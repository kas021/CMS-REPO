from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .job import JobRead


class DriverBase(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    is_active: bool = True


class DriverCreate(DriverBase):
    password: str


class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class DriverRead(DriverBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class DriverWithJobs(DriverRead):
    jobs: list[JobRead] = []


class DriverJobSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: str
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
