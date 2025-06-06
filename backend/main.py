# main.py
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime, date, timedelta # Import timedelta
from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime, ForeignKey, func # Import func
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from fastapi.middleware.cors import CORSMiddleware
import os
from enum import Enum

# --- Database Configuration ---
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:my1s2w3e4t5@db.sfkmmaoucbxeysaxmhtz.supabase.co:5432/postgres")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Models (SQLAlchemy) ---

class LeadDB(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    contact = Column(String, index=True, nullable=False)
    company = Column(String, nullable=True)
    product_interest = Column(String, nullable=True)
    stage = Column(String, default="New", nullable=False)
    follow_up_date = Column(Date, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    orders = relationship("OrderDB", back_populates="lead")

class OrderDB(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    order_date = Column(Date, server_default=func.now().cast(Date), nullable=False)
    status = Column(String, default="Received", nullable=False)
    delivery_date = Column(Date, nullable=True)
    tracking_number = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    lead = relationship("LeadDB", back_populates="orders")

# --- Pydantic Models (for API validation/response) ---

# Lead Models (unchanged from previous step)
class LeadBase(BaseModel):
    name: str
    contact: str
    company: Optional[str] = None
    product_interest: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class LeadCreate(LeadBase):
    stage: Optional[str] = "New"

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    company: Optional[str] = None
    product_interest: Optional[str] = None
    stage: Optional[str] = None
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class Lead(LeadBase):
    id: int
    stage: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Order Models (unchanged from previous step)
class OrderStatus(str, Enum):
    received = "Received"
    in_development = "In Development"
    ready_to_dispatch = "Ready to Dispatch"
    dispatched = "Dispatched"

class OrderBase(BaseModel):
    product_name: str
    quantity: int
    order_date: Optional[date] = None
    status: OrderStatus = OrderStatus.received
    delivery_date: Optional[date] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class OrderCreate(OrderBase):
    lead_id: int

class OrderUpdate(BaseModel):
    product_name: Optional[str] = None
    quantity: Optional[int] = None
    order_date: Optional[date] = None
    status: Optional[OrderStatus] = None
    delivery_date: Optional[date] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    class Config:
        from_attributes = True

class Order(OrderBase):
    id: int
    lead_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# NEW: Dashboard Metrics Pydantic Model
class DashboardMetrics(BaseModel):
    total_leads: int
    leads_by_stage: Dict[str, int]
    followups_due_this_week: int
    overdue_followups: List[Lead] # List of Lead objects for overdue
    total_orders: int
    orders_by_status: Dict[str, int]

# --- FastAPI Application ---
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Database Initialization ---
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print("Database tables created/checked.")

# --- API Endpoints for Leads (Existing) ---
@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI backend! (Connected to Supabase)"}

@app.post("/leads/", response_model=Lead)
async def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    lead_data = lead.dict(exclude_unset=True)
    db_lead = LeadDB(**lead_data)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@app.get("/leads/", response_model=List[Lead])
async def get_leads(
    stage: Optional[str] = None,
    follow_up_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LeadDB)
    if stage:
        query = query.filter(LeadDB.stage == stage)
    if follow_up_date:
        query = query.filter(LeadDB.follow_up_date == follow_up_date)
    leads_from_db = query.all()
    return leads_from_db

@app.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(LeadDB).filter(LeadDB.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@app.patch("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: int, lead_update: LeadUpdate, db: Session = Depends(get_db)):
    db_lead = db.query(LeadDB).filter(LeadDB.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = lead_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lead, key, value)

    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

@app.delete("/leads/{lead_id}", status_code=204)
async def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    db_lead = db.query(LeadDB).filter(LeadDB.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(db_lead)
    db.commit()
    return {"message": "Lead deleted successfully"}

# --- API Endpoints for Orders (Existing) ---
@app.post("/orders/", response_model=Order)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    lead_exists = db.query(LeadDB).filter(LeadDB.id == order.lead_id).first()
    if not lead_exists:
        raise HTTPException(status_code=404, detail=f"Lead with ID {order.lead_id} not found.")

    order_data = order.dict(exclude_unset=True)
    db_order = OrderDB(**order_data)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=List[Order])
async def get_orders(
    lead_id: Optional[int] = None,
    status: Optional[OrderStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(OrderDB)
    if lead_id:
        query = query.filter(OrderDB.lead_id == lead_id)
    if status:
        query = query.filter(OrderDB.status == status)
    orders_from_db = query.all()
    return orders_from_db

@app.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.patch("/orders/{order_id}", response_model=Order)
async def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = order_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.delete("/orders/{order_id}", status_code=204)
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}

# --- NEW: Dashboard API Endpoint ---
@app.get("/dashboard/metrics/", response_model=DashboardMetrics)
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    today = date.today()
    one_week_from_now = today + timedelta(days=7)

    # Total Leads
    total_leads = db.query(LeadDB).count()

    # Leads by Stage
    leads_by_stage_query = db.query(LeadDB.stage, func.count(LeadDB.id)).group_by(LeadDB.stage).all()
    leads_by_stage = {stage: count for stage, count in leads_by_stage_query}

    # Follow-ups due this week (today to next 7 days, inclusive)
    followups_due_this_week = db.query(LeadDB).filter(
        LeadDB.follow_up_date >= today,
        LeadDB.follow_up_date <= one_week_from_now
    ).count()

    # Overdue Follow-ups (past date, and not 'Closed' or 'Lost')
    # Assuming 'Closed' and 'Lost' are final stages where follow-ups are no longer needed
    overdue_followups_list = db.query(LeadDB).filter(
        LeadDB.follow_up_date.isnot(None), # Ensure there is a follow up date
        LeadDB.follow_up_date < today,
        LeadDB.stage.notin_(['Closed', 'Lost', 'Won']) # Exclude final stages
    ).all()

    # Total Orders
    total_orders = db.query(OrderDB).count()

    # Orders by Status
    orders_by_status_query = db.query(OrderDB.status, func.count(OrderDB.id)).group_by(OrderDB.status).all()
    orders_by_status = {status: count for status, count in orders_by_status_query}

    return DashboardMetrics(
        total_leads=total_leads,
        leads_by_stage=leads_by_stage,
        followups_due_this_week=followups_due_this_week,
        overdue_followups=overdue_followups_list,
        total_orders=total_orders,
        orders_by_status=orders_by_status
    )