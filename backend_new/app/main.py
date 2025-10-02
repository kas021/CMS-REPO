from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, credit_notes, customers, drivers, health, invoices, jobs

app = FastAPI(title=settings.APP_NAME)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
