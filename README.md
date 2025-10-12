# 藤沢市・ペット同行避難支援アプリ 🐶😺🐰🦉

### 1. プロジェクト概要（Overview）

## 🎓 プロジェクト概要（卒業課題用）

- **プロジェクト名**: ペット同行避難支援アプリ（Pet Evacuation App）
- **目的**: 災害時に飼い主とペットが共に安全に避難できる情報を提供
- **対象地域**: 神奈川県藤沢市（実在データをベースに MVP 検証）
- **チーム構成**: 4 名（機能別に担当を分担）
- **開発期間**: 2025 年 10 月〜2025 年 11 月（約４週間）

### 主な機能

1. 避難所の可視化（同行・同伴）と検索（現在地／距離／キーワード）
2. お気に入り（★）登録・解除 → マップ／リスト連動
3. 事前備え：飼い主・ペット情報の登録・更新
4. プレミアム（Stripe Checkout）※将来拡張: リマインダー、家族共有 等

---

ペットと一緒に安心して避難できる場所を「地図で可視化」し、災害時に迷わず避難行動が取れるよう支援する Web アプリです。

Google Maps を活用した避難所検索と、自治体によるリアルタイム開設・混雑情報の発信を可能にします。

## 2. 背景（Background）

### ■ なぜこのプロダクト／機能が必要か？

神奈川県藤沢市では、災害時にペット同伴避難が可能な避難所は**市内でわずか 1 箇所・約 100 組限定**です。

しかもその情報は市の Web サイトの深い階層にあり、平時の確認・災害時の即時検索が困難です。

一方、ペット飼育世帯は増加しており、次のような課題が発生しています：

- 「どこに避難できるのか」がわからない
- 「ペットを連れて行ってよいのか」が不明
- 受け入れ状況や混雑がリアルタイムでわからない

自治体・ボランティア・住民の情報連携が十分でないため、防災意識はあっても「行動につながる情報提供」ができていません。

本アプリは、**「ペット同行避難 × 情報のリアルタイム可視化」**という切り口で、市民と自治体双方を支援します。

### 藤沢市の「同行／同伴」現況（要点）

- **同伴避難（屋内同室可）**：
  市内で**秋葉台文化体育館の 1 施設のみ**。想定**約 100 組限定**、対象は**風水害時**の避難先としての運用。[藤沢市公式サイト+1](https://www.city.fujisawa.kanagawa.jp/kikikanri/bosai/akibadai.html?utm_source=chatgpt.com)
- **同行避難（同室不可＝原則屋外で飼養）**：
  **地震等の震災時**は、市内**81 件**の**指定避難所**で受け入れ可能（※同室不可）。これは地元紙の取材記事だが、市の避難先一覧の総数とも整合。[タウンニュース+1](https://www.townnews.co.jp/0601/2025/08/29/799866.html?utm_source=chatgpt.com)
- **風水害時の「同行」受け入れ**：
  近年の報道では**28 か所**で同行可能との記載あり。いっぽう、市が 2025/4/1 時点で公開している**公式「避難先一覧（PDF）」では合計行に**「ペット用避難スペース」**の合計が**24\*\*となっており、集計方法・定義更新で差分が出ています。[タウンニュース+1](https://www.townnews.co.jp/0601/2025/08/29/799866.html?utm_source=chatgpt.com)

> 補足：市公式「ペットの防災について」ページでも、**水害避難所の一覧（2025/4/1 現在）**と「ペット用避難スペース」の注意書きが明示。最新はこのページと添付 PDF を基準に参照してください。[藤沢市公式サイト](https://www.city.fujisawa.kanagawa.jp/seiei/pet_bousai.html)

### ■ 現在の課題やビジネス的背景

- 自治体の防災サイトやハザードマップは「情報提供」に留まり、行動支援機能が不足している
- ペット避難に関する情報が分散しており、市民が自力で検索するしかない
- 情報の更新頻度が低く、災害発生時には実際の受入状況を反映できない
- ペット防災市場は潜在的に大きく（全国 1,400 万世帯規模）、自治体 DX・防災 Tech 分野としての事業展開余地がある

これらの背景から、\***\*「ペット同行避難 × 情報のリアルタイム可視化」\*\***という新しい切り口で

市民・行政の双方を支援する Web アプリの必要性が高まっています。

## 3. 目的・ゴール（Goals / Objectives）

### ■ このプロダクトで達成したいこと

### 目的

「ペットと一緒に、迷わず安全に避難場所がパッと見て直感的にわかる」状態を実現する。

### ゴール（MVP 想定）

- 避難所の **同行／同伴** 形態を地図上で色分け表示
- 現在地・キーワード・距離検索による避難所検索
- 避難所の開設・混雑情報を自治体がリアルタイムで更新
- 飼い主・ペット情報の事前登録とお気に入り避難所機能
- Stripe によるプレミアム登録（チェックリスト／リマインダー）

## 🛠 技術スタック

| カテゴリ           | 使用技術                                                                            |
| ------------------ | ----------------------------------------------------------------------------------- |
| **フロントエンド** | Next.js (TypeScript), ESLint, Prettier, Firebase Web SDK, Stripe JS, Google Maps JS |
| **バックエンド**   | Python 3, FastAPI, Firebase Admin SDK, Stripe Python, Alembic, SQLAlchemy           |
| **データベース**   | PostgreSQL（Supabase）                                                              |
| **インフラ**       | Frontend: Vercel / Backend: Render or Railway / DB: Supabase                        |
| **テスト**         | pytest（バックエンド）, Playwright（E2E）                                           |
| **コンテナ環境**   | Docker / Docker Compose                                                             |
| **CI/CD**          | GitHub Actions（lint・build・test 自動実行）                                        |

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

## 🚀 初回セットアップ手順（新メンバー向け）

1. **リポジトリを取得**

   ```bash
   git clone https://github.com/ms-engineer-bc25-08/Pet_evacuation_app.git
   cd Pet_evacuation_app
   ```

2. **依存関係をインストール**
   - フロントエンド
     ```bash
     cd apps/frontend
     npm install
     ```
   - バックエンド（必要に応じて）
     ```bash
     cd ../backend
     pip install -r requirements.txt
     ```
3. **環境変数を設定**
   - `.env.example` をコピーして フロント用：`env.local`と、バックエンド用：`.env` を作成し、Firebase / Stripe / Supabase などのキーを設定
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env.local
   cp apps/backend/.env.example apps/backend/.env
   ```
4. **Docker 起動**

```bash
docker compose up -d --build
```

5. **DB マイグレーション**

```bash
docker compose exec backend alembic upgrade head
```

6. **アクセス確認**

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

主要エンドポイントは [API 設計書](docs/API設計書.md) を参照。開発時は [http://localhost:8000/docs](http://localhost:8000/docs) で OpenAPI を確認。

## 🧪 テスト

- 単体: `docker compose exec backend pytest -q`
- E2E: `npm run test:e2e`（frontend ディレクトリ）

## 🧹 品質

- `npm run lint --fix` / `npm run format`
- PR テンプレ & CI 実行

## 🧾 設計書・資料リンク集

| ドキュメント      | 説明                                   | ファイルパス                                          |
| ----------------- | -------------------------------------- | ----------------------------------------------------- |
| 要件定義書        | アプリの目的・課題・ユーザーストーリー | [docs/要件定義書.md](docs/要件定義書.md)              |
| 画面設計書        | UI 構成・ページ遷移・モックアップ      | [docs/画面設計書.md](docs/画面設計書.md)              |
| ER 図             | DB 構成・リレーション定義              | [docs/ER 図.md](docs/ER図.md)                         |
| API 設計書        | エンドポイント・レスポンス仕様         | [docs/API 設計書.md](docs/API設計書.md)               |
| DB 設計書         | データベースのテーブル仕様・設計       | [docs/DB 設計書.md](docs/DB設計書.md)                 |
| アーキテクチャ図  | チーム開発のブランチ命名・PR ルール    | [docs/アーキテクチャ図.md](docs/アーキテクチャ図.md)  |
| シーケンス図      | DB 構成・リレーション定義              | [docs/シーケンス図.md](docs/シーケンス図.md)          |
| PRD               | プロダクト要件整理                     | [docs/PRD.md](docs/PRD.md)                            |
| テスト計画書      | E2E・単体テストの観点整理              | [docs/テスト計画書.md](docs/テスト計画書.md)          |
| GitHub 運用ルール | チーム開発のブランチ命名・PR ルール    | [docs/GitHub 運用ルール.md](docs/GitHub運用ルール.md) |
| コーディング規約  | チーム開発時のコーディング規約         | [docs/コーディング規約.md](docs/コーディング規約.md)  |

💡 **リンクの書き方**  
Markdown では次のように相対パスでリンクが可能です：

```md
[API 設計書](docs/API設計書.md)
```

---

## ⚠️ 注意事項

- 個人情報（電話番号・メールアドレス・証明画像 URL）はログ出力しない
- Webhook 秘密鍵は `.env` 管理（Vercel/Render の Secret に登録）
- `main` への直接 push 禁止。必ず Pull Request 経由でマージ
- `.env` ファイルは Git 管理対象外（`.gitignore` で保護）

---
