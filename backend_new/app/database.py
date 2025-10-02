from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import settings


def _get_engine_url() -> str:
    return settings.sqlalchemy_database_uri


def _engine_kwargs() -> dict:
    url = _get_engine_url()
    if url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {}


engine = create_engine(_get_engine_url(), **_engine_kwargs())
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
