from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, Column, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class JobStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    jobs = relationship("Job", back_populates="driver")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)

    jobs = relationship("Job", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
    credit_notes = relationship("CreditNote", back_populates="customer")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SqlEnum(JobStatus), default=JobStatus.PENDING, nullable=False)
    scheduled_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    driver = relationship("Driver", back_populates="jobs")
    customer = relationship("Customer", back_populates="jobs")
    invoice = relationship("Invoice", back_populates="job", uselist=False)
    credit_notes = relationship("CreditNote", back_populates="job")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="draft", nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    job = relationship("Job", back_populates="invoice")
    customer = relationship("Customer", back_populates="invoices")


class CreditNote(Base):
    __tablename__ = "credit_notes"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    job = relationship("Job", back_populates="credit_notes")
    customer = relationship("Customer", back_populates="credit_notes")
