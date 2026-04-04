from pydantic import BaseModel
from typing import Optional, List



class UserSignup(BaseModel):
    hospital_name: str
    total_beds: int
    total_oxygen: int
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    hospital_name: str
    name: str
    email: str

    class Config:
        from_attributes = True

class ResourceUpdate(BaseModel):
    total_beds: int
    total_oxygen: int

class ResourceResponse(BaseModel):
    total_beds: int
    occupied_beds: int
    available_beds: int
    total_oxygen: int
    allocated_oxygen: int
    available_oxygen: int



class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    contact_number: str
    bed_type: str # 'General Bed', 'ICU Bed', 'Ventilator Bed'
    requires_oxygen: bool

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    contact_number: str

    class Config:
        from_attributes = True

class BedAllocationResponse(BaseModel):
    patient_id: int
    patient_name: str
    bed_type: str

class OxygenAllocationResponse(BaseModel):
    patient_id: int
    patient_name: str
