from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CreditNoteBase(BaseModel):
    job_id: int
    customer_id: int
    amount: float
    reason: Optional[str] = None
    created_at: Optional[datetime] = None


class CreditNoteCreate(CreditNoteBase):
    pass


class CreditNoteUpdate(BaseModel):
    job_id: Optional[int] = None
    customer_id: Optional[int] = None
    amount: Optional[float] = None
    reason: Optional[str] = None
    created_at: Optional[datetime] = None


class CreditNoteRead(CreditNoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
