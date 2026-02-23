from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime # <--- If this is missing, the port will NOT work

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.now)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String)
    quantity = Column(Integer)
    category = Column(String)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    age = Column(Integer)
    medical_history = Column(String)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_name = Column(String)
    date_time = Column(DateTime)
    status = Column(String, default="Scheduled")
    prescription_notes = Column(String, nullable=True)
    
    patient = relationship("Patient")