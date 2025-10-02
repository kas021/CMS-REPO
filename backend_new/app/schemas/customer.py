from typing import Optional

from pydantic import BaseModel, ConfigDict


class CustomerBase(BaseModel):
    name: str
    email: str
    address: Optional[str] = None
    phone: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
