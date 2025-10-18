# 🐾 API 設計書

## 概要

藤沢市内の避難所情報を「同行・同伴」で可視化し、ユーザーの事前備え（飼い主・ペット情報）と災害時の行動を支援する REST API です。  
プレミアム登録ユーザーに **家族安否共有・備蓄チェックリスト・リマインダー・医療施設検索** を提供します。

**ベース**: FastAPI / 認証: Firebase ID Token / 形式: JSON  
**DB 前提**: `USERS`に `plan/premium_until/billing_status/stripe_*` を保持（`SUBSCRIPTIONS`表なし）

---

## リソース一覧

| リソース      | 概要                                                        |
| ------------- | ----------------------------------------------------------- |
| `/system`     | ヘルスチェック                                              |
| `/auth`       | Firebase トークン検証                                       |
| `/users`      | ユーザー基本情報＋サブスク状況（`USERS`）                   |
| `/pets`       | ペット情報（`PETS`）                                        |
| `/shelters`   | 避難所＋**最新ステータス同梱**（`SHELTERS.latest_*`）       |
| `/favorites`  | お気に入り（複合 PK）（`FAVORITES`）                        |
| `/premium`    | Checkout 生成 / Webhook（Stripe→`USERS`更新）               |
| `/family`     | 家族・安否（`FAMILY_MEMBERS` / `FAMILY_CHECKINS`）          |
| `/checklists` | 備蓄リスト（**items_json 内にリマインド**）（`CHECKLISTS`） |
| `/news`       | お知らせ（`NEWS`）                                          |

---

## エンドポイント

### System / Auth

| エンドポイント   | メソッド | 説明                  | 認証 |
| ---------------- | -------- | --------------------- | :--: |
| `/system/health` | GET      | 稼働確認              |  🔓  |
| `/auth/verify`   | GET      | Firebase トークン検証 |  🔒  |

### Users（`USERS`）

| エンドポイント   | メソッド | 説明                                                    | 認証 |
| ---------------- | -------- | ------------------------------------------------------- | :--: |
| `/users/me`      | GET      | 自ユーザー情報取得（`display_name/phone/email/qr/...`） |  🔒  |
| `/users/me`      | PUT      | 自ユーザー情報更新                                      |  🔒  |
| `/users/me/plan` | GET      | `{ plan, premium_until, billing_status }` を返す        |  🔒  |

**レスポンス項目**: `plan`, `premium_until`, `billing_status`, `stripe_customer_id`, `stripe_sub_id` など。

### Pets（`PETS`）

| エンドポイント           | メソッド | 説明       | 認証 |
| ------------------------ | -------- | ---------- | :--: |
| `/users/me/pets`         | GET      | ペット一覧 |  🔒  |
| `/users/me/pets`         | POST     | ペット登録 |  🔒  |
| `/users/me/pets/{petId}` | PUT      | ペット更新 |  🔒  |
| `/users/me/pets/{petId}` | DELETE   | ペット削除 |  🔒  |

**DTO（例）**  
`{ id, name, species, vaccinated, memo, certificate_image_url, created_at, updated_at }`  
※ `species` は Enum（例: `dog|cat|other`）、画像は `certificate_image_url` 名に統一。

### Shelters（`SHELTERS`）

| エンドポイント   | メソッド | 説明                                             | 認証 |
| ---------------- | -------- | ------------------------------------------------ | :--: |
| `/shelters`      | GET      | 検索（type/q/座標/半径）＋**最新ステータス同梱** |  🔓  |
| `/shelters/{id}` | GET      | 詳細（**latest\_\* 同梱**）                      |  🔓  |

**レスポンス例の必須項目**  
`{ id, name, address, phone, website_url, type, capacity, lat, lng, pin_icon, image_urls, latest_status, latest_congestion, latest_reported_at }`

### Favorites（`FAVORITES`）

| エンドポイント           | メソッド | 説明                 | 認証 |
| ------------------------ | -------- | -------------------- | :--: |
| `/favorites`             | GET      | 自分のお気に入り一覧 |  🔒  |
| `/favorites/{shelterId}` | PUT      | 追加（upsert）       |  🔒  |
| `/favorites/{shelterId}` | DELETE   | 解除                 |  🔒  |

> 複合 PK：`(user_id, shelter_id)`

### Premium（Stripe→`USERS`更新）

| エンドポイント      | メソッド | 説明                                                                         | 認証 |
| ------------------- | -------- | ---------------------------------------------------------------------------- | :--: |
| `/premium/checkout` | POST     | Checkout Session 作成（mode=subscription）                                   |  🔒  |
| `/premium/webhook`  | POST     | Webhook（署名検証）→ `USERS.plan/billing_status/premium_until/stripe_*` 更新 |  🔓  |

> **users 単独運用**：`SUBSCRIPTIONS`表は使わず、`USERS`の該当カラムのみ更新。

### Family（`FAMILY_MEMBERS` / `FAMILY_CHECKINS`）

| エンドポイント                      | メソッド            | 説明              | 認証 |
| ----------------------------------- | ------------------- | ----------------- | :--: |
| `/family/members`                   | GET/POST/PUT/DELETE | 家族メンバー CRUD |  🔒  |
| `/family/checkin`                   | POST                | 安否報告の追加    |  🔒  |
| `/family/checkin/latest?member_id=` | GET                 | 最新安否取得      |  🔒  |

**レスポンス項目追加**

| フィールド名        | 型             | 説明                                                           |
| ------------------- | -------------- | -------------------------------------------------------------- |
| reported_by_user_id | string \| null | 安否を記録したユーザー ID。家族（ゲストリンク）の場合は null。 |

**レスポンス例（POST /family/checkin）**

```json
{
  "id": "…",
  "member_id": "…",
  "status": "safe",
  "message": "無事です",
  "reported_at": "2025-10-17T01:23:45Z",
  "reported_by_user_id": null
}
```

### Checklists（`CHECKLISTS`）

| エンドポイント           | メソッド            | 説明                                                      | 認証 |
| ------------------------ | ------------------- | --------------------------------------------------------- | :--: |
| `/checklists`            | GET/POST/PUT/DELETE | 備蓄リスト（**items_json に remind_at / repeat を内包**） |  🔒  |
| `/checklists/{id}/items` | PATCH               | items_json の部分更新（任意）                             |  🔒  |

> **/reminders は廃止**（DB に専用テーブルが無いため）。

### News（`NEWS`）

| エンドポイント | メソッド | 説明                        | 認証 |
| -------------- | -------- | --------------------------- | :--: |
| `/news`        | GET      | 一覧（area/level フィルタ） |  🔓  |
| `/news/{id}`   | GET      | 詳細                        |  🔓  |

---

## サンプル DTO

**GET `/users/me/plan`** → 200

```json
{
  "plan": "premium",
  "premium_until": "2025-12-01T00:00:00Z",
  "billing_status": "active"
}
```

**GET `/shelters`** → 200

```json
{
  "items": [
    {
      "id": "b2f3b9a0-...",
      "name": "藤沢第一小学校",
      "address": "神奈川県藤沢市...",
      "type": "accompany",
      "capacity": 120,
      "lat": 35.333,
      "lng": 139.475,
      "latest_status": "open",
      "latest_congestion": 35,
      "latest_reported_at": "2025-10-10T12:00:00Z",
      "pin_icon": "blue-star",
      "image_urls": []
    }
  ]
}
```

**POST `/premium/webhook`** → 200  
Webhook では `USERS.plan/billing_status/premium_until/stripe_*` を更新（`SUBSCRIPTIONS`表は使用しない）。

---

## 実装メモ（抜粋）

- 有料判定：`plan='premium' OR premium_until > now()`
- Webhook イベント：
  - `checkout.session.completed` → `plan='premium'`, `billing_status='active'`, `stripe_*`, `premium_until` 更新
  - `invoice.paid` → `billing_status='active'`, `premium_until` 更新
  - `customer.subscription.updated` → `billing_status`, `premium_until` 更新
  - `invoice.payment_failed` → `billing_status='past_due'`
  - `customer.subscription.deleted` → `billing_status='canceled'`, `plan='free'`（即時 or 期限まで据え置き）
