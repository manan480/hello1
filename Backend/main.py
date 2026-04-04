from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

import models
import schemas
from database import engine, get_db

import os
from dotenv import load_dotenv
from openai import OpenAI
from fastapi.responses import JSONResponse
import json

models.Base.metadata.create_all(bind=engine)
load_dotenv()

client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

app = FastAPI(title="Hospital Resource Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here") # Remember to change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user_data: schemas.UserSignup, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        hospital_name=user_data.hospital_name,
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize ResourceCapacity for this user
    initial_capacity = models.ResourceCapacity(
        user_id=new_user.id,
        total_beds=user_data.total_beds,
        total_oxygen=user_data.total_oxygen
    )
    db.add(initial_capacity)
    db.commit()

    return new_user

@app.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

system_prompt = """
You are a helpful AI assistant specialized in predictive analytics for a hospital resource management system. 
You will receive real-time data about the hospital's current resource capacity (beds and oxygen).

CRITICAL INSTRUCTIONS for analysis:
- Calculate the utilization percentage for beds (occupied_beds / total_beds) and oxygen (allocated_oxygen / total_oxygen).
- If utilization is >= 75%, you MUST issue a severe warning in the "prediction" array about impending shortages and recommend immediate action (e.g., stopping elective admissions, acquiring emergency oxygen, etc).
- If utilization is between 50% and 74%, issue a moderate warning to monitor the situation closely.
- Only state that utilization is "low" if both resources are under 50% utilized.

Based on this logic, generate a JSON response with a "Conclusion" key containing two lists of strings:
1. "prediction": String alerts about potential or impending shortages based on the strict thresholds above.
2. "recommendations": String suggestions for actionable steps to mitigate any issues found.

Respond ONLY with the JSON format, with no extra markdown or text. Example format:
{"Conclusion": {"prediction": ["..."], "recommendations": ["..."]}}
"""

@app.post("/updateResources", response_model=schemas.ResourceUpdate)
def update_resources(resources: schemas.ResourceUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_capacity = db.query(models.ResourceCapacity).filter(models.ResourceCapacity.user_id == current_user.id).first()
    if not db_capacity:
        db_capacity = models.ResourceCapacity(user_id=current_user.id, total_beds=resources.total_beds, total_oxygen=resources.total_oxygen)
        db.add(db_capacity)
    else:
        db_capacity.total_beds = resources.total_beds
        db_capacity.total_oxygen = resources.total_oxygen
    
    db.commit()
    db.refresh(db_capacity)
    return db_capacity

@app.get("/resources", response_model=schemas.ResourceResponse)
def get_resources(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    capacity = db.query(models.ResourceCapacity).filter(models.ResourceCapacity.user_id == current_user.id).first()
    if not capacity:
        return schemas.ResourceResponse(
            total_beds=0, occupied_beds=0, available_beds=0,
            total_oxygen=0, allocated_oxygen=0, available_oxygen=0
        )
    
    occupied_beds = db.query(models.BedAllocation).join(models.Patient).filter(models.Patient.user_id == current_user.id).count()
    allocated_oxygen = db.query(models.OxygenAllocation).join(models.Patient).filter(models.Patient.user_id == current_user.id).count()
    
    return schemas.ResourceResponse(
        total_beds=capacity.total_beds,
        occupied_beds=occupied_beds,
        available_beds=capacity.total_beds - occupied_beds,
        total_oxygen=capacity.total_oxygen,
        allocated_oxygen=allocated_oxygen,
        available_oxygen=capacity.total_oxygen - allocated_oxygen
    )

@app.post("/bedallocate", response_model=schemas.PatientResponse)
def allocate_bed(patient_data: schemas.PatientCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    capacity = db.query(models.ResourceCapacity).filter(models.ResourceCapacity.user_id == current_user.id).first()
    if not capacity:
        raise HTTPException(status_code=400, detail="Resource capacity not set.")
    
    occupied_beds = db.query(models.BedAllocation).join(models.Patient).filter(models.Patient.user_id == current_user.id).count()
    if occupied_beds >= capacity.total_beds:
        raise HTTPException(status_code=400, detail="No beds available.")

    db_patient = models.Patient(
        user_id=current_user.id,
        name=patient_data.name,
        age=patient_data.age,
        gender=patient_data.gender,
        contact_number=patient_data.contact_number
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)

    db_bed_alloc = models.BedAllocation(
        patient_id=db_patient.id,
        bed_type=patient_data.bed_type
    )
    db.add(db_bed_alloc)

    if patient_data.requires_oxygen:
        allocated_oxygen = db.query(models.OxygenAllocation).join(models.Patient).filter(models.Patient.user_id == current_user.id).count()
        if allocated_oxygen < capacity.total_oxygen:
            db_oxy_alloc = models.OxygenAllocation(patient_id=db_patient.id)
            db.add(db_oxy_alloc)
        else:
            db.commit()
            raise HTTPException(status_code=206, detail="Bed allocated, but no oxygen cylinders available.")

    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.post("/beddeallocate/{patient_id}")
def deallocate_bed(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id, models.Patient.user_id == current_user.id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    db.delete(db_patient)
    db.commit()
    return {"status": "success", "message": f"Patient {patient_id} and associated resource allocations removed."}

@app.get("/allocated-beds", response_model=List[schemas.BedAllocationResponse])
def get_allocated_beds(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    allocations = db.query(models.BedAllocation).join(models.Patient).filter(models.Patient.user_id == current_user.id).all()
    results = []
    for alloc in allocations:
        results.append({
            "patient_id": alloc.patient_id,
            "patient_name": alloc.patient.name,
            "bed_type": alloc.bed_type
        })
    return results

@app.post("/oxygenallocate/{patient_id}")
def allocate_oxygen(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    capacity = db.query(models.ResourceCapacity).filter(models.ResourceCapacity.user_id == current_user.id).first()
    if not capacity:
        raise HTTPException(status_code=400, detail="Resource capacity not set.")
    
    allocated_oxygen = db.query(models.OxygenAllocation).join(models.Patient).filter(models.Patient.user_id == current_user.id).count()
    if allocated_oxygen >= capacity.total_oxygen:
        raise HTTPException(status_code=400, detail="No oxygen cylinders available.")

    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id, models.Patient.user_id == current_user.id).first()
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    existing_alloc = db.query(models.OxygenAllocation).filter(models.OxygenAllocation.patient_id == patient_id).first()
    if existing_alloc:
        return {"status": "success", "message": "Patient already has an oxygen allocation."}

    new_alloc = models.OxygenAllocation(patient_id=patient_id)
    db.add(new_alloc)
    db.commit()
    return {"status": "success", "message": f"Oxygen allocated to patient {patient_id}."}

@app.post("/oxygendeallocate/{patient_id}")
def deallocate_oxygen(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    alloc = db.query(models.OxygenAllocation).join(models.Patient).filter(models.OxygenAllocation.patient_id == patient_id, models.Patient.user_id == current_user.id).first()
    if not alloc:
        raise HTTPException(status_code=404, detail="Oxygen allocation not found for this patient.")
    
    db.delete(alloc)
    db.commit()
    return {"status": "success", "message": f"Oxygen deallocated from patient {patient_id}."}

@app.get("/allocated-oxygen", response_model=List[schemas.OxygenAllocationResponse])
def get_allocated_oxygen(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    allocations = db.query(models.OxygenAllocation).join(models.Patient).filter(models.Patient.user_id == current_user.id).all()
    results = []
    for alloc in allocations:
        results.append({
            "patient_id": alloc.patient_id,
            "patient_name": alloc.patient.name
        })
    return results

@app.get("/prediction")
def get_prediction(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        resource_data = get_resources(db, current_user)
        
        hospital_data = {
            "total_beds": resource_data.total_beds,
            "occupied_beds": resource_data.occupied_beds,
            "available_beds": resource_data.available_beds,
            "total_oxygen": resource_data.total_oxygen,
            "allocated_oxygen": resource_data.allocated_oxygen,
            "available_oxygen": resource_data.available_oxygen
        }
        
        user_message = f"Current Hospital Resource Data:\n{json.dumps(hospital_data)}\n\nPlease provide predictions and recommendations based on this data."

        message = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]

        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            response_format={"type": "json_object"},
            temperature=0.1,
            messages=message
        )

        response_content = response.choices[0].message.content
        parsed_output = json.loads(response_content)

        if "Conclusion" in parsed_output:
            return JSONResponse(content={"status": "success", "data": parsed_output["Conclusion"]})
        else:
            return JSONResponse(content={"status": "partial", "raw": parsed_output})

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON response from AI.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend is working 🚀"}