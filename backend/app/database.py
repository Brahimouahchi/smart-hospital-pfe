from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get the address of the database from Docker
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:adminpassword@db/hospital_db")

# Create the engine (The car that drives data back and forth)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The Base class for our models
Base = declarative_base()

# Dependency to get a database session in API calls
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()