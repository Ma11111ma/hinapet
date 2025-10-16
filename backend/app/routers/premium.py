from __future__ import annotations

import os
import stripe
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/premium", tags=["premium"])

# --- Config (env) ---
# 認証バイパス: 1=ON（暫定で進める）, 0=OFF（認証必須）
AUTH_BYPASS = os.getenv("AUTH_BYPASS", "1") == "1"

# env 値の必須チェック用
def require_env(name: str, default: str | None = None) -> str:
    val = os.getenv(name, default or "").strip()
    if not val:
       raise HTTPException(status_code=500, detail=f"Missing env: {name}")
    return val

def configure_stripe():
    # 毎リクエストで env を読む（再起動後の取りこぼし防止）
    stripe.api_key = require_env("STRIPE_SECRET_KEY")
    price_id = require_env("STRIPE_PRICE_ID_MONTHLY")
    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    return price_id, frontend

class CheckoutURL(BaseModel):
    url: str

class CheckoutIn(BaseModel):
   # 認証が未導入の間だけ使う暫定入力（AUTH_BYPASS=1 の時のみ使用）
   user_id: str | None = None

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
def create_checkout_session(
    body: CheckoutIn,
    authorization: str | None = Header(None),
):
    # 必須envを毎回チェック & 取得
    price_id, frontend = configure_stripe()

    # 認証の扱い：暫定でバイパス可（AUTH_BYPASS=1）
    if AUTH_BYPASS:
        user_id = (body.user_id or "dev-user-id").strip()
        email = "dev@example.com"
    else:
        decoded = verify_id_token(authorization)
        user_id = decoded["uid"]
        email = decoded.get("email")

    # Checkout セッション作成
    session = stripe.checkout.Session.create(
        mode="subscription",
        # payment_method_types は新APIでは省略可（残しても可）
        payment_method_types=["card"],
        customer=get_or_create_customer(user_id, email),
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{frontend}/premium/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{frontend}/premium/canceled",
        client_reference_id=user_id,
        metadata={"user_id": user_id},
        allow_promotion_codes=True,
    )
    return {"url": session.url}
