from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    class Config:
        from_attributes = True

class PatientCreate(BaseModel):
    full_name: str
    age: int
    medical_history: str

class PatientResponse(PatientCreate):
    id: int
    class Config:
        from_attributes = True

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_name: str
    date_time: datetime

class AppointmentUpdate(BaseModel):
    status: str
    prescription_notes: Optional[str] = None

class InventoryCreate(BaseModel):
    item_name: str
    quantity: int
    category: str