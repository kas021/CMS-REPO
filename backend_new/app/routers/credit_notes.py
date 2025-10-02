from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin
from ..models import CreditNote
from ..schemas.credit_note import CreditNoteCreate, CreditNoteRead, CreditNoteUpdate

router = APIRouter(prefix="/credit-notes", tags=["credit-notes"])


@router.get("", response_model=list[CreditNoteRead])
def list_credit_notes(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(CreditNote).all()


@router.post("", response_model=CreditNoteRead, status_code=status.HTTP_201_CREATED)
def create_credit_note(
    credit_note_in: CreditNoteCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    credit_note = CreditNote(**credit_note_in.model_dump())
    db.add(credit_note)
    db.commit()
    db.refresh(credit_note)
    return credit_note


@router.get("/{credit_note_id}", response_model=CreditNoteRead)
def read_credit_note(
    credit_note_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    credit_note = db.get(CreditNote, credit_note_id)
    if not credit_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit note not found")
    return credit_note


@router.put("/{credit_note_id}", response_model=CreditNoteRead)
def update_credit_note(
    credit_note_id: int,
    credit_note_in: CreditNoteUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    credit_note = db.get(CreditNote, credit_note_id)
    if not credit_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit note not found")

    for field, value in credit_note_in.model_dump(exclude_unset=True).items():
        setattr(credit_note, field, value)

    db.add(credit_note)
    db.commit()
    db.refresh(credit_note)
    return credit_note


@router.delete("/{credit_note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit_note(
    credit_note_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    credit_note = db.get(CreditNote, credit_note_id)
    if not credit_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit note not found")
    db.delete(credit_note)
    db.commit()
    return None
