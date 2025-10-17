# backend/app/schemas/user.py
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr

class UserMeResponse(BaseModel):
    id: str
    display_name: Optional[str] = None
    email: Optional[EmailStr] = None
    plan: str
    model_config = ConfigDict(from_attributes=True)

# 自分の情報更新用
class UserMeUpdate(BaseModel):
    display_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    qr: Optional[str] = None
    # 未知のキーは無視
    model_config = ConfigDict(extra="ignore")

# プラン参照用
class UserPlanResponse(BaseModel):
    plan: str
    premium_until: Optional[str] = None
    billing_status: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    stripe_sub_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
