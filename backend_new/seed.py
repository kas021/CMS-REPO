from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import Admin, CreditNote, Customer, Driver, Invoice, Job, JobStatus
from app.security import get_password_hash


ADMIN_EMAIL = "admin@example.com"
DRIVER_EMAILS = ["driver1@example.com", "driver2@example.com"]
CUSTOMER_EMAILS = ["acme@example.com", "globex@example.com"]


def seed():
    session = SessionLocal()

    try:
        if session.query(Admin).filter(Admin.email == ADMIN_EMAIL).first():
            print("Seed data already exists.")
            return

        admin = Admin(
            email=ADMIN_EMAIL,
            full_name="System Admin",
            hashed_password=get_password_hash("admin123"),
        )

        drivers = [
            Driver(
                email=DRIVER_EMAILS[0],
                full_name="Alex Johnson",
                phone="555-0101",
                hashed_password=get_password_hash("driver123"),
            ),
            Driver(
                email=DRIVER_EMAILS[1],
                full_name="Jamie Smith",
                phone="555-0102",
                hashed_password=get_password_hash("driver456"),
            ),
        ]

        customers = [
            Customer(
                name="ACME Corp",
                email=CUSTOMER_EMAILS[0],
                address="123 Industrial Way",
                phone="555-0201",
            ),
            Customer(
                name="Globex LLC",
                email=CUSTOMER_EMAILS[1],
                address="456 Enterprise Rd",
                phone="555-0202",
            ),
        ]

        session.add(admin)
        session.add_all(drivers + customers)
        session.commit()

        for driver in drivers:
            session.refresh(driver)
        for customer in customers:
            session.refresh(customer)

        jobs = [
            Job(
                title="Warehouse Pickup",
                description="Pick up goods from ACME warehouse",
                status=JobStatus.ASSIGNED,
                scheduled_at=datetime.utcnow() + timedelta(days=1),
                driver_id=drivers[0].id,
                customer_id=customers[0].id,
            ),
            Job(
                title="City Delivery",
                description="Deliver goods to downtown",
                status=JobStatus.IN_PROGRESS,
                scheduled_at=datetime.utcnow(),
                driver_id=drivers[0].id,
                customer_id=customers[0].id,
            ),
            Job(
                title="Long Haul",
                description="Transport equipment to Globex",
                status=JobStatus.PENDING,
                scheduled_at=datetime.utcnow() + timedelta(days=3),
                driver_id=drivers[1].id,
                customer_id=customers[1].id,
            ),
            Job(
                title="Return Shipment",
                description="Return unused materials",
                status=JobStatus.COMPLETED,
                scheduled_at=datetime.utcnow() - timedelta(days=2),
                completed_at=datetime.utcnow() - timedelta(days=1),
                driver_id=drivers[1].id,
                customer_id=customers[1].id,
            ),
        ]

        session.add_all(jobs)
        session.commit()

        for job in jobs[:2]:
            session.refresh(job)

        invoice = Invoice(
            job_id=jobs[0].id,
            customer_id=customers[0].id,
            amount=350.0,
            status="issued",
            issued_at=datetime.utcnow(),
        )

        credit_note = CreditNote(
            job_id=jobs[1].id,
            customer_id=customers[0].id,
            amount=50.0,
            reason="Damaged items",
            created_at=datetime.utcnow(),
        )

        session.add_all([invoice, credit_note])
        session.commit()
        print("Seed data created.")
    finally:
        session.close()


if __name__ == "__main__":
    seed()
