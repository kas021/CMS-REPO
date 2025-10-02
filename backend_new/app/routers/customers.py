from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Customer
from ..schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Customer).all()


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    if db.query(Customer).filter(Customer.email == customer_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Customer already exists")
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerRead)
def read_customer(customer_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    for field, value in customer_in.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)

    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    db.delete(customer)
    db.commit()
    return None
