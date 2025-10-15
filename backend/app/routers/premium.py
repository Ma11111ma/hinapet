from __future__ import annotations

import os
import stripe
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/premium", tags=["premium"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
PRICE_ID = os.getenv("STRIPE_PRICE_ID_MONTHLY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

class CheckoutURL(BaseModel):
    url: str

_error_example_401 = {"application/json": {"example": {"error": "http_error", "detail": "Missing bearer token", "status": 401, "trace_id": "abcd1234"}}}
_error_example_500 = {"application/json": {"example": {"error": "internal_error", "detail": "Stripe env vars not set", "status": 500, "trace_id": "abcd1234"}}}

def verify_id_token(authorization: str | None) -> dict:
    # TODO: 後で Firebase Admin 検証に差し替え
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return {"uid": "dev-user-id", "email": "dev@example.com"}

def get_or_create_customer(user_id: str, email: str | None) -> str:
    customer = stripe.Customer.create(email=email or None, metadata={"app_user_id": user_id})
    return customer.id

@router.post(
    "/checkout",
    response_model=CheckoutURL,
    summary="Stripe Checkout セッションを作成",
    responses={401: {"description": "未認証", "content": _error_example_401},
               500: {"description": "設定不足", "content": _error_example_500}},
)
def create_checkout_session(authorization: str | None = Header(None)):
    if not stripe.api_key or not PRICE_ID:
        # 統一エラーハンドラで 500 の JSON に整形される
        raise HTTPException(500, "Stripe env vars not set")

    decoded = verify_id_token(authorization)
    user_id = decoded["uid"]
    email = decoded.get("email")

    session = stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        customer=get_or_create_customer(user_id, email),
        line_items=[{"price": PRICE_ID, "quantity": 1}],
        success_url=f"{FRONTEND_URL}/premium/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/premium/canceled",
        client_reference_id=user_id,
        metadata={"user_id": user_id},
        allow_promotion_codes=True,
    )
    return {"url": session.url}
