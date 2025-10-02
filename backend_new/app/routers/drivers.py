from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin, get_current_driver
from ..models import Driver, Job
from ..schemas.driver import DriverCreate, DriverJobSummary, DriverRead, DriverUpdate
from ..security import get_password_hash

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.post("", response_model=DriverRead, status_code=status.HTTP_201_CREATED)
def create_driver(
    driver_in: DriverCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)
):
    if db.query(Driver).filter(Driver.email == driver_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Driver already exists")
    driver = Driver(
        email=driver_in.email,
        full_name=driver_in.full_name,
        phone=driver_in.phone,
        is_active=driver_in.is_active,
        hashed_password=get_password_hash(driver_in.password),
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.get("", response_model=list[DriverRead])
def list_drivers(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Driver).all()


@router.get("/me", response_model=DriverRead)
def read_current_driver(driver=Depends(get_current_driver)):
    return driver


@router.get("/me/jobs", response_model=list[DriverJobSummary])
def read_current_driver_jobs(
    db: Session = Depends(get_db), driver=Depends(get_current_driver)
):
    jobs = (
        db.query(Job)
        .filter(Job.driver_id == driver.id)
        .order_by(Job.scheduled_at.is_(None), Job.scheduled_at)
        .all()
    )
    return jobs


@router.get("/{driver_id}", response_model=DriverRead)
def read_driver(driver_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return driver


@router.put("/{driver_id}", response_model=DriverRead)
def update_driver(
    driver_id: int,
    driver_in: DriverUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

    if driver_in.full_name is not None:
        driver.full_name = driver_in.full_name
    if driver_in.phone is not None:
        driver.phone = driver_in.phone
    if driver_in.is_active is not None:
        driver.is_active = driver_in.is_active
    if driver_in.password:
        driver.hashed_password = get_password_hash(driver_in.password)

    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(driver_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    db.delete(driver)
    db.commit()
    return None
