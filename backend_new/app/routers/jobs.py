from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_admin, get_current_driver
from ..models import Job, JobStatus
from ..schemas.job import JobCreate, JobRead, JobUpdate

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=list[JobRead])
def list_jobs(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(Job).all()


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    try:
        status_value = JobStatus(job_in.status) if job_in.status else JobStatus.PENDING
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job status") from exc

    job = Job(
        title=job_in.title,
        description=job_in.description,
        status=status_value,
        driver_id=job_in.driver_id,
        customer_id=job_in.customer_id,
        scheduled_at=job_in.scheduled_at,
        completed_at=job_in.completed_at,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/{job_id}", response_model=JobRead)
def read_job(job_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.put("/{job_id}", response_model=JobRead)
def update_job(
    job_id: int,
    job_in: JobUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job_in.title is not None:
        job.title = job_in.title
    if job_in.description is not None:
        job.description = job_in.description
    if job_in.status is not None:
        try:
            job.status = JobStatus(job_in.status)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job status") from exc
    if job_in.driver_id is not None:
        job.driver_id = job_in.driver_id
    if job_in.customer_id is not None:
        job.customer_id = job_in.customer_id
    if job_in.scheduled_at is not None:
        job.scheduled_at = job_in.scheduled_at
    if job_in.completed_at is not None:
        job.completed_at = job_in.completed_at

    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    db.delete(job)
    db.commit()
    return None


@router.post("/{job_id}/{action}", response_model=JobRead)
def perform_action_on_job(
    job_id: int,
    action: str,
    db: Session = Depends(get_db),
    current_driver=Depends(get_current_driver),
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    if job.driver_id != current_driver.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Job not assigned to driver")

    normalized_action = action.lower()
    if normalized_action == "start":
        job.status = JobStatus.IN_PROGRESS
        job.scheduled_at = job.scheduled_at or datetime.utcnow()
    elif normalized_action == "complete":
        job.status = JobStatus.COMPLETED
        job.completed_at = datetime.utcnow()
    elif normalized_action == "cancel":
        job.status = JobStatus.CANCELLED
        job.completed_at = datetime.utcnow()
    elif normalized_action == "acknowledge":
        job.status = JobStatus.ASSIGNED
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported action")

    db.add(job)
    db.commit()
    db.refresh(job)
    return job
