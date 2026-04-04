from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    hospital_name = Column(String, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

    resource_capacity = relationship("ResourceCapacity", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patients = relationship("Patient", back_populates="user", cascade="all, delete-orphan")

class ResourceCapacity(Base):
    __tablename__ = "resource_capacity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    total_beds = Column(Integer, default=0)
    total_oxygen = Column(Integer, default=0)

    user = relationship("User", back_populates="resource_capacity")

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    contact_number = Column(String)

    user = relationship("User", back_populates="patients")
    bed_allocation = relationship("BedAllocation", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    oxygen_allocation = relationship("OxygenAllocation", back_populates="patient", uselist=False, cascade="all, delete-orphan")

class BedAllocation(Base):
    __tablename__ = "bed_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    bed_type = Column(String) 
    
    patient = relationship("Patient", back_populates="bed_allocation")

class OxygenAllocation(Base):
    __tablename__ = "oxygen_allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    
    patient = relationship("Patient", back_populates="oxygen_allocation")
