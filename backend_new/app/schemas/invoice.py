from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InvoiceBase(BaseModel):
    job_id: int
    customer_id: int
    amount: float
    status: Optional[str] = "draft"
    issued_at: Optional[datetime] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    job_id: Optional[int] = None
    customer_id: Optional[int] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    issued_at: Optional[datetime] = None


class InvoiceRead(InvoiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
