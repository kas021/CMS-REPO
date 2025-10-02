from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class JobBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = None
    driver_id: Optional[int] = None
    customer_id: int
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class JobCreate(JobBase):
    status: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    driver_id: Optional[int] = None
    customer_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class JobRead(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
