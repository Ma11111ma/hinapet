# 藤沢市・ペット同行避難支援アプリ 🐶😺🐰🦉

> **目的**: 「ペットと一緒に、迷わず安全に避難場所が直感的にわかる」を実現する Web アプリ。同行／同伴／分離の受け入れ形態を地図で可視化し、事前備え（飼い主・ペット情報）と災害時の行動を支援します。

## 🛠 技術スタック

- **フロントエンド**: Next.js (TypeScript), ESLint, Prettier, Firebase Web SDK, Stripe JS, Google Maps JS
- **バックエンド**: Python 3, FastAPI, Firebase Admin SDK, Stripe Python, Alembic, SQLAlchemy
- **DB**: PostgreSQL（Supabase）
- **インフラ**: Frontend=Vercel / Backend=Render or Railway / DB=Supabase
- **テスト**: pytest, Playwright（E2E）
- **コンテナ**: Docker / Docker Compose

## 🎯 機能

1. 避難所の可視化（同行・同伴・分離）と検索（現在地／距離／キーワード）
2. お気に入り（★）登録・解除 → マップ／リスト連動
3. 事前備え：飼い主・ペット情報の登録・更新
4. プレミアム（Stripe Checkout）※将来拡張: リマインダー、家族共有 等

## 📂 モノレポ構成

```
project-root/
└─ apps/
   ├─ frontend/        # Next.js
   │  ├─ app/
   │  ├─ components/
   │  └─ lib/
   ├─ backend/         # FastAPI
   │  ├─ app/
   │  ├─ alembic/
   │  └─ tests/
   └─ docs/            # 設計書・図・README
```

その他: `.github/`（CI）, `.vscode/`, `docker-compose.yml`, `.env.example`

## 🚀 セットアップ（開発）

1. リポジトリ取得 & 依存入手
2. `.env.example` から `.env` を作成（frontend/backend/Supabase/Stripe/Firebase キーを設定）
3. Docker 起動

```bash
docker compose up -d --build
```

4. マイグレーション

```bash
docker compose exec backend alembic upgrade head
```

5. アクセス

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs

## 🔐 環境変数（例）

**frontend** `.env.local`

```
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

**backend** `.env`

```
DATABASE_URL=postgresql+psycopg://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
STRIPE_SECRET_KEY=sk_live_or_test...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGINS=["http://localhost:3000"]
```

## 📘 API

主要エンドポイントは `docs/API設計書.md` を参照。開発時は `http://localhost:8000/docs` で OpenAPI を確認。

## 🧪 テスト

- 単体: `docker compose exec backend pytest -q`
- E2E: `npm run test:e2e`（frontend ディレクトリ）

## 🧹 品質

- `npm run lint --fix` / `npm run format`
- PR テンプレ & CI 実行

## ⚠️ 注意

- 個人情報（電話/メール/証明画像 URL）はログ出力しない
- Webhook 秘密鍵の管理（環境変数・Vercel/Render の Secret）