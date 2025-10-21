from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class UserMeResponse(BaseModel):
    id: str
    display_name: Optional[str] = None
    email: Optional[EmailStr] = None
    plan: str
    # ← これを付けると Enum を "free" のような値で出す
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class UserMeUpdate(BaseModel):
    display_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    qr: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class UserPlanResponse(BaseModel):
    plan: str
    premium_until: Optional[str] = None
    billing_status: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    stripe_sub_id: Optional[str] = None
    # ← 同様に
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)
