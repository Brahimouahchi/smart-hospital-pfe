from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# 1. Allow React (Port 5173) to talk to this AI Brain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Define what data we need to make a prediction
class PatientData(BaseModel):
    age: int
    medical_history: str

@app.get("/")
def read_root():
    return {"status": "AI Engine Online", "model": "Heart_Disease_V1"}

# 3. The Prediction Logic (The "Brain")
@app.post("/predict_heart_risk")
def predict_risk(data: PatientData):
    risk_score = 0
    reasons = []

    # --- SIMULATED ML LOGIC ---
    
    # Rule 1: Age Factor
    if data.age > 60:
        risk_score += 40
        reasons.append("High Age")
    elif data.age > 40:
        risk_score += 20
    
    # Rule 2: Keywords in History (Simple NLP)
    history_lower = data.medical_history.lower()
    if "diabetes" in history_lower:
        risk_score += 30
        reasons.append("Diabetes Condition")
    if "blood pressure" in history_lower or "hypertension" in history_lower:
        risk_score += 25
        reasons.append("Hypertension")
    if "smoker" in history_lower:
        risk_score += 20
        reasons.append("Smoking History")

    # Cap the score at 99%
    final_score = min(risk_score, 99)
    
    # Determine Label
    if final_score > 50:
        status = "CRITICAL RISK"
    elif final_score > 20:
        status = "MODERATE RISK"
    else:
        status = "LOW RISK"

    return {
        "risk_score": final_score,
        "status": status,
        "analysis": reasons
    }