from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import Admin, Driver
from .security import decode_token


oauth2_scheme_admin = OAuth2PasswordBearer(tokenUrl="token")
oauth2_scheme_driver = OAuth2PasswordBearer(tokenUrl="drivers/login")


class Role(str):
    ADMIN = "admin"
    DRIVER = "driver"


def _get_identity(token: str, expected_role: str, db: Session):
    try:
        payload = decode_token(token)
    except ValueError as exc:  # pragma: no cover - handled by FastAPI
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    if payload.get("role") != expected_role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if expected_role == Role.ADMIN:
        user = db.query(Admin).filter(Admin.email == subject).first()
    else:
        user = db.query(Driver).filter(Driver.email == subject).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def get_current_admin(token: str = Depends(oauth2_scheme_admin), db: Session = Depends(get_db)):
    return _get_identity(token, Role.ADMIN, db)


def get_current_driver(token: str = Depends(oauth2_scheme_driver), db: Session = Depends(get_db)):
    driver = _get_identity(token, Role.DRIVER, db)
    if not driver.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Driver inactive")
    return driver
