from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text  # <--- NEW IMPORT
from . import models
from .database import engine, get_db

# 1. Create the Database Tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "System Status: ONLINE", "database": "Connected"}

# Test Endpoint: Check if we can talk to the DB
@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # THE FIX: We must wrap the SQL string in text()
        db.execute(text("SELECT 1")) 
        return {"status": "Database Connection Successful!"}
    except Exception as e:
        return {"status": "Failed", "error": str(e)}