from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- PATIENT SCHEMAS ---

# 1. What data do we need to CREATE a patient?
class PatientCreate(BaseModel):
    full_name: str
    age: int
    medical_history: str = "None"

# 2. What data do we return to the Frontend? (Includes the ID)
class PatientResponse(PatientCreate):
    id: int

    class Config:
        from_attributes = True

# --- APPOINTMENT SCHEMAS ---

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None
    time: datetime
    type: str # Checkup, Emergency

class AppointmentResponse(AppointmentCreate):
    id: int
    status: str
    
    class Config:
        from_attributes = True  
class UserCreate(BaseModel):
    username: str
    password: str