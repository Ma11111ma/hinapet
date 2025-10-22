# Stripe Checkout（開発メモ）

## 必要環境変数（backend/.env）
- `STRIPE_SECRET_KEY` : Stripeのシークレットキー（テスト）
- `STRIPE_PRICE_ID_MONTHLY` : 料金プランの price_id（テスト）
- `FRONTEND_URL` : `http://localhost:3000` など
- `AUTH_BYPASS` : 開発中のみ `1`（認証バイパス）/ 本番は `0`

※ `.env.example` にも同キーを空値で追加（`AUTH_BYPASS=0` 推奨）

## 起動
```bash
docker compose up -d --force-recreate backend



API: POST /premium/checkout

curl -s -X POST http://localhost:8000/premium/checkout \
  -H "Origin: http://127.0.0.1:3000" \
  -H "Authorization: Bearer dummy" \
  -H "Content-Type: application/json" \
  -d '{}'
# => {"url":"https://checkout.stripe.com/c/pay/cs_test_..."}
返ってきた URL をブラウザで開き、テストカード
4242 4242 4242 4242 / 12/34 / 123 / dev@example.com で決済。
成功後 FRONTEND_URL/premium/success に遷移すれば OK。

ダッシュボード確認

Stripe ダッシュボード > 開発者 > イベント
checkout.session.completed, payment_intent.succeeded, invoice.* が記録されること

Webhook を使う場合（D-2）：
stripe login                # 初回のみ
stripe listen --forward-to localhost:8000/premium/webhook
# 表示された whsec_... を backend/.env の STRIPE_WEBHOOK_SECRET に設定


トラブルシュート

401 Missing bearer token
→ 開発中は AUTH_BYPASS=1（本番は必ず 0）

500 Stripe env vars not set
→ STRIPE_SECRET_KEY / STRIPE_PRICE_ID_MONTHLY を確認

CORS ブロック
→ FRONTEND_URL とリクエスト Origin を揃える（127.0.0.1 と localhost 差異に注意）


次の一歩（D-2: Webhook）

backend/.env に STRIPE_WEBHOOK_SECRET=whsec_xxx を追加

stripe_webhook.py に 署名検証のみ 実装してまずは 200 を返す

stripe listen --forward-to localhost:8000/premium/webhook を起動

ダッシュボード > 開発者 > Webhooks で、各イベントが 配信済み(200) になっていることを確認

その後、checkout.session.completed で DB を更新（is_premium=true / premium_until）


---

## おまけ：D-2 最小コード（署名検証だけ 200）

> もしまだなら `backend/app/routers/stripe_webhook.py` に以下を置いて動作確認できます。

```python
# backend/app/routers/stripe_webhook.py
from __future__ import annotations
import os, stripe
from fastapi import APIRouter, Header, HTTPException, Request

router = APIRouter(prefix="/premium", tags=["premium"])
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/webhook", summary="Stripe Webhook 受信（署名検証のみ・暫定200）")
async def stripe_webhook(request: Request, stripe_signature: str | None = Header(None, alias="Stripe-Signature")):
    if not WEBHOOK_SECRET:
        raise HTTPException(500, "STRIPE_WEBHOOK_SECRET not set")
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=stripe_signature, secret=WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid signature: {e}")

    # ここではログだけ出して常に200（次段でDB反映を実装）
    print("[stripe] event:", event.get("type"))
    return {"ok": True}
