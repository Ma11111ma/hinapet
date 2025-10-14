# backend/app/routers/stripe_webhook.py
from __future__ import annotations

import os
import time
from typing import Any, Dict, Optional

from fastapi import APIRouter, Request, Header, HTTPException, Depends
from fastapi.responses import PlainTextResponse
import stripe

from app.core.deps import get_db   # ← 依存関数がここにあります
from sqlalchemy.orm import Session
from app.models.user import User   # ユーザーモデル
# 必要に応じて: from app.db.session import SessionLocal でもOK

router = APIRouter(prefix="/premium", tags=["premium"])

# 環境変数
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


def _update_premium_true(
    db: Session,
    *,
    user_uid: Optional[str],
    stripe_customer_id: Optional[str],
    subscription_id: Optional[str],
    premium_until_unix: Optional[int],
) -> None:
    """支払い完了 → is_premium=True / premium_until を更新"""
    if not user_uid and not stripe_customer_id:
        return

    q = db.query(User)
    if user_uid:
        q = q.filter(User.uid == user_uid)
    elif stripe_customer_id:
        q = q.filter(User.stripe_customer_id == stripe_customer_id)

    user = q.first()
    if not user:
        return

    if stripe_customer_id:
        user.stripe_customer_id = stripe_customer_id
    if subscription_id:
        user.stripe_subscription_id = subscription_id  # モデルにあれば
    if premium_until_unix:
        user.premium_until = time.strftime(
            "%Y-%m-%d %H:%M:%S", time.gmtime(premium_until_unix)
        )
    user.is_premium = True
    db.add(user)
    db.commit()


def _update_premium_false(db: Session, *, stripe_customer_id: Optional[str]) -> None:
    if not stripe_customer_id:
        return
    user = db.query(User).filter(User.stripe_customer_id == stripe_customer_id).first()
    if not user:
        return
    user.is_premium = False
    db.add(user)
    db.commit()


@router.post(
    "/webhook",
    response_class=PlainTextResponse,
    summary="Stripe Webhook (signature verification)",
)
async def webhook(
    request: Request,
    db: Session = Depends(get_db),
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
) -> PlainTextResponse:
    # 1) 署名必須チェック
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret is not set")
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing Stripe-Signature header")

    # 2) 署名検証
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=STRIPE_WEBHOOK_SECRET,
        )
    except stripe.error.SignatureVerificationError:
        # 署名NGは 400 で返す
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    # 3) イベント振り分け
    etype = event.get("type")
    data: Dict[str, Any] = event.get("data", {}).get("object", {})  # type: ignore

    try:
        if etype == "checkout.session.completed":
            # → 課金完了時：is_premium=true / premium_until を更新
            #   user_id は metadata.user_id に入れている想定（D-1でセット）
            metadata = data.get("metadata") or {}
            user_uid: Optional[str] = metadata.get("user_id")
            stripe_customer_id: Optional[str] = data.get("customer")
            subscription_id: Optional[str] = data.get("subscription")

            # サブスクリプションの current_period_end を取得
            premium_until_unix: Optional[int] = None
            if subscription_id:
                sub = stripe.Subscription.retrieve(subscription_id)
                premium_until_unix = sub.get("current_period_end")  # epoch 秒

            _update_premium_true(
                db,
                user_uid=user_uid,
                stripe_customer_id=stripe_customer_id,
                subscription_id=subscription_id,
                premium_until_unix=premium_until_unix,
            )

        elif etype in ("customer.subscription.updated", "invoice.payment_succeeded"):
            # → 期間延長や請求成功時：premium_until を最新に同期
            stripe_customer_id: Optional[str] = data.get("customer")
            subscription_id: Optional[str] = data.get("id") or data.get("subscription")
            premium_until_unix: Optional[int] = None

            if subscription_id:
                sub = stripe.Subscription.retrieve(
                    subscription_id
                    if etype == "customer.subscription.updated"
                    else data.get("subscription")
                )
                premium_until_unix = sub.get("current_period_end")

            _update_premium_true(
                db,
                user_uid=None,
                stripe_customer_id=stripe_customer_id,
                subscription_id=subscription_id,
                premium_until_unix=premium_until_unix,
            )

        elif etype in ("customer.subscription.deleted", "customer.subscription.canceled"):
            # → 解約/キャンセル：is_premium=false
            stripe_customer_id: Optional[str] = data.get("customer")
            _update_premium_false(db, stripe_customer_id=stripe_customer_id)

        # 4) すぐ 200 を返す（タイムアウト/リトライ防止）
        return PlainTextResponse("ok", status_code=200)

    except Exception as e:
        # 予期せぬエラーは 200 返しつつ、ログだけ仕込むのも実務的（再送ループを避けるため）
        # ここでは簡易に 200 を返却
        # 将来: イベントID重複処理 / エラーログテーブル 等
        return PlainTextResponse(f"ignored: {etype}", status_code=200)
