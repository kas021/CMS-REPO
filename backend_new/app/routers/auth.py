from datetime import datetime, timedelta


from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..dependencies import Role
from ..models import Admin, Driver
from ..schemas.auth import AdminToken, DriverToken
from ..security import create_access_token, verify_password

router = APIRouter(tags=["auth"])


@router.post("/token", response_model=AdminToken, summary="Admin login")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(Admin.email == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expires_at = datetime.utcnow() + access_token_expires
    access_token = create_access_token(
        admin.email,
        Role.ADMIN,
        subject_id=admin.id,
        expires_delta=access_token_expires,
    )
    return AdminToken(access_token=access_token, expires_at=expires_at)



@router.post("/drivers/login", response_model=DriverToken, summary="Driver login")
def driver_login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(Driver.email == form_data.username).first()
    if not driver or not verify_password(form_data.password, driver.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
    if not driver.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Driver inactive")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expires_at = datetime.utcnow() + access_token_expires
    access_token = create_access_token(
        driver.email,
        Role.DRIVER,
        subject_id=driver.id,
        expires_delta=access_token_expires,
    )
    return DriverToken(access_token=access_token, expires_at=expires_at)

