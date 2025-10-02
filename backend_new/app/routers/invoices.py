from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import Invoice
from ..schemas.invoice import InvoiceCreate, InvoiceRead, InvoiceUpdate

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("", response_model=list[InvoiceRead])
def list_invoices(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Invoice).all()


@router.post("", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
def create_invoice(
    invoice_in: InvoiceCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)
):
    if db.query(Invoice).filter(Invoice.job_id == invoice_in.job_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice already exists for job")
    invoice = Invoice(**invoice_in.model_dump())
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/{invoice_id}", response_model=InvoiceRead)
def read_invoice(invoice_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.put("/{invoice_id}", response_model=InvoiceRead)
def update_invoice(
    invoice_id: int,
    invoice_in: InvoiceUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    for field, value in invoice_in.model_dump(exclude_unset=True).items():
        setattr(invoice, field, value)

    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    db.delete(invoice)
    db.commit()
    return None
