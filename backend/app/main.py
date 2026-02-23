from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from . import models, schemas, auth, database
from .database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware
from fpdf import FPDF
import os

# Initialize Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Hospital API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- UTILITY: AUDIT LOGGER ---
def log_action(db: Session, username: str, action: str, resource: str):
    new_log = models.AuditLog(username=username, action=action, resource=resource)
    db.add(new_log)
    db.commit()

# --- AUTHENTICATION ---
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role 
    }

@app.post("/register/")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    return {"msg": "User created successfully"}

# --- USER & AUDIT MANAGEMENT ---
@app.get("/users/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/audit-logs/")
def get_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()

# Add this endpoint to get ONLY doctors for the dropdown
@app.get("/doctors/", response_model=List[schemas.UserResponse])
def get_doctors(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "doctor").all()

# --- PATIENT MANAGEMENT ---
@app.get("/patients/", response_model=List[schemas.PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

@app.post("/patients/")
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    log_action(db, "System", "REGISTERED PATIENT", db_patient.full_name)
    return db_patient

# --- APPOINTMENT & PRESCRIPTION LOGIC ---
@app.get("/appointments/")
def get_appointments(db: Session = Depends(get_db)):
    return db.query(models.Appointment).all()

@app.post("/appointments/")
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    db_appt = models.Appointment(**appointment.dict())
    db.add(db_appt)
    db.commit()
    log_action(db, "Staff", "BOOKED APPOINTMENT", f"Patient ID: {db_appt.patient_id}")
    return db_appt

@app.put("/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: int, payload: schemas.AppointmentUpdate, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appt.status = payload.status
    appt.prescription_notes = payload.prescription_notes
    db.commit()
    log_action(db, appt.doctor_name, "UPDATED PRESCRIPTION", f"Appt ID: {appointment_id}")
    return {"msg": "Prescription saved"}

# --- INVENTORY MANAGEMENT ---
@app.get("/inventory/")
def get_inventory(db: Session = Depends(get_db)):
    return db.query(models.Inventory).all()

@app.post("/inventory/")
def add_inventory(item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    db_item = models.Inventory(**item.dict())
    db.add(db_item)
    db.commit()
    log_action(db, "Staff", "UPDATED INVENTORY", db_item.item_name)
    return db_item

# --- PDF GENERATION (ORDONNANCE) ---
@app.get("/generate-prescription/{appointment_id}")
def generate_pdf(appointment_id: int, db: Session = Depends(get_db)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appt or not appt.prescription_notes:
        raise HTTPException(status_code=404, detail="No prescription found")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="HOPITAL PUBLIC DE DJELFA", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Date: {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='R')
    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Docteur: {appt.doctor_name}", ln=True)
    pdf.cell(200, 10, txt=f"Ordonnance pour l'ID Patient: {appt.patient_id}", ln=True)
    pdf.ln(10)
    pdf.multi_cell(0, 10, txt=f"Prescription:\n{appt.prescription_notes}")
    
    file_path = f"prescription_{appointment_id}.pdf"
    pdf.output(file_path)
    
    return Response(content=open(file_path, "rb").read(), media_type="application/pdf")