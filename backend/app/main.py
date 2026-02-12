from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware # <--- THE MISSING IMPORT
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from . import auth

from . import models, schemas
from .database import engine, get_db

# 1. Create the Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 2. THE FIX: Allow the Frontend to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (good for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, GET, etc.)
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "System Status: ONLINE", "database": "Connected"}

@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Database Connection Successful!"}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}

# --- PATIENT ENDPOINTS ---

@app.post("/patients/", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    # Create the database model
    db_patient = models.Patient(
        full_name=patient.full_name,
        age=patient.age,
        medical_history=patient.medical_history
    )
    # Save it
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/patients/", response_model=List[schemas.PatientResponse])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Patient).offset(skip).limit(limit).all()

@app.get("/stats/")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Count total patients
    total_patients = db.query(models.Patient).count()
    
    # 2. Count "Sick" patients (logic: history is not 'None')
    # (In a real app, we would have a specific 'status' column, but this works for now)
    active_cases = db.query(models.Patient).filter(models.Patient.medical_history != "None").count()
    
    return {
        "total_patients": total_patients,
        "active_cases": active_cases,
        "todays_appointments": 4  # Fake number for now (until we build the calendar)
    }

# --- SECURITY ENDPOINTS ---

# 1. Create the First Doctor (Run this once via Swagger)
@app.post("/register/")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, role="doctor")
    db.add(db_user)
    db.commit()
    return {"msg": "Doctor created successfully"}

# 2. Login (Get Token)
@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Generate Token
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}