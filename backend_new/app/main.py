from fastapi import FastAPI

from .config import settings
from .models import Base
from .database import engine
from .routers import auth, customers, drivers, health, invoices, credit_notes, jobs

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(drivers.router)
app.include_router(jobs.router)
app.include_router(customers.router)
app.include_router(invoices.router)
app.include_router(credit_notes.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Logistics Backend"}
