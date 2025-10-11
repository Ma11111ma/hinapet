# 🐾 藤沢市・ペット同行避難支援アプリ — DB 設計書

## ✅ 概要

藤沢市の「ペット同行避難」を“行動できる情報”に変えるため、
避難所の受け入れ可否・リアルタイム状況・住民の利用情報（ユーザー/ペット/お気に入り/チェックリスト/リマインダー）・お知らせ配信を一元管理するバックエンド基盤 DB。

---

## テーブル定義

### USERS（ユーザー情報）

| カラム名           | 型            | 制約 / デフォルト値           | 説明                 |
| ------------------ | ------------- | ----------------------------- | -------------------- |
| id                 | uuid          | PK, default gen_random_uuid() | ユーザー ID          |
| firebase_uid       | text          | UNIQUE, NOT NULL              | Firebase UID         |
| display_name       | text          |                               | 表示名               |
| phone              | text          |                               | 電話番号             |
| email              | text          |                               | メール               |
| plan               | user_plan     | NOT NULL, default 'free'      | プラン区分           |
| premium_until      | timestamptz   |                               | 有料期限             |
| billing_status     | billing_state | NOT NULL, default 'none'      | 請求状態             |
| stripe_customer_id | text          |                               | Stripe 顧客 ID       |
| stripe_sub_id      | text          |                               | Stripe サブスク ID   |
| last_payment_at    | timestamptz   |                               | 最終支払日時         |
| qr                 | text          |                               | QR コード URL/文字列 |
| created_at         | timestamptz   | default now()                 | 登録日時             |
| updated_at         | timestamptz   | default now()                 | 更新日時             |

---

### PETS（ペット情報）

| カラム名              | 型          | 制約 / デフォルト値           | 説明              |
| --------------------- | ----------- | ----------------------------- | ----------------- |
| id                    | uuid        | PK, default gen_random_uuid() | ペット ID         |
| owner_id              | uuid        | FK → users.id, index          | 飼い主ユーザー ID |
| name                  | text        | NOT NULL                      | ペット名          |
| species               | pet_species | NOT NULL                      | 種別              |
| vaccinated            | boolean     | default false                 | ワクチン接種済み  |
| memo                  | text        |                               | メモ              |
| certificate_image_url | text        |                               | 証明画像 URL      |
| created_at            | timestamptz | default now()                 | 作成              |
| updated_at            | timestamptz | default now()                 | 更新              |

---

### SHELTERS（避難所 + 最新ステータス統合）

| カラム名           | 型                    | 制約 / デフォルト値 | 説明                   |
| ------------------ | --------------------- | ------------------- | ---------------------- |
| id                 | uuid                  | PK                  | 避難所 ID              |
| name               | text                  | NOT NULL            | 名称                   |
| address            | text                  |                     | 住所                   |
| phone              | text                  |                     | 電話                   |
| website_url        | text                  |                     | 公式 URL               |
| type               | shelter_type          |                     | 区分（同行/同伴/分離） |
| capacity           | integer               |                     | 収容人数               |
| geom               | geography(Point,4326) | NOT NULL            | 位置情報               |
| latest_status      | shelter_open_status   |                     | 最新状態               |
| latest_congestion  | integer               |                     | 混雑度(%)              |
| latest_reported_at | timestamptz           |                     | 最終更新               |
| pin_icon           | text                  |                     | ピン色/アイコン識別子  |
| image_urls         | text[]                |                     | 画像 URL 配列          |
| created_at         | timestamptz           | default now()       | 作成                   |
| updated_at         | timestamptz           | default now()       | 更新                   |

---

### FAVORITES（お気に入り避難所）

| カラム名   | 型                    | 制約 / デフォルト値 | 説明        |
| ---------- | --------------------- | ------------------- | ----------- |
| user_id    | uuid                  | FK → users.id       | ユーザー ID |
| shelter_id | uuid                  | FK → shelters.id    | 避難所 ID   |
| created_at | timestamptz           | default now()       | 登録日時    |
| updated_at | timestamptz           | default now()       | 更新日時    |
| **PK**     | (user_id, shelter_id) |                     | 複合 PK     |

---

### CHECKLISTS（チェックリスト＋リマインダー統合）

| カラム名   | 型          | 制約 / デフォルト値 | 説明                                            |
| ---------- | ----------- | ------------------- | ----------------------------------------------- |
| id         | uuid        | PK                  | リスト ID                                       |
| user_id    | uuid        | FK → users.id       | ユーザー ID                                     |
| title      | text        |                     | タイトル                                        |
| items_json | jsonb       |                     | `[{name,checked,expiry,remind_at,repeat,note}]` |
| updated_at | timestamptz | default now()       | 更新日時                                        |

---

### FAMILY_MEMBERS（家族）

| カラム名   | 型          | 制約 / デフォルト値  | 説明        |
| ---------- | ----------- | -------------------- | ----------- |
| id         | uuid        | PK                   | 家族 ID     |
| user_id    | uuid        | FK → users.id, index | ユーザー ID |
| name       | text        |                      | 名前        |
| relation   | text        |                      | 続柄        |
| contact    | text        |                      | 連絡先      |
| created_at | timestamptz | default now()        | 作成        |
| updated_at | timestamptz | default now()        | 更新        |

### FAMILY_CHECKINS（安否）

| カラム名    | 型          | 制約 / デフォルト値    | 説明                          |
| ----------- | ----------- | ---------------------- | ----------------------------- |
| id          | uuid        | PK                     | チェックイン ID               |
| member_id   | uuid        | FK → family_members.id | 家族 ID                       |
| status      | text        |                        | 安否状態（safe/need_help 等） |
| message     | text        |                        | コメント                      |
| reported_at | timestamptz | default now()          | 報告日時                      |

---

### AUDIT_LOGS（操作履歴）

| カラム名      | 型          | 制約 / デフォルト値 | 説明                 |
| ------------- | ----------- | ------------------- | -------------------- |
| id            | uuid        | PK                  | ログ ID              |
| actor_user_id | uuid        | FK → users.id       | 実行者               |
| action        | text        |                     | 操作名               |
| target_type   | text        |                     | 対象種別             |
| target_id     | text        |                     | 対象 ID              |
| meta          | jsonb       |                     | 追加情報（差分など） |
| created_at    | timestamptz | default now()       | 作成日時             |

---

### NEWS（お知らせ／災害情報）

| カラム名     | 型          | 制約 / デフォルト値 | 説明                     |
| ------------ | ----------- | ------------------- | ------------------------ |
| id           | uuid        | PK                  | 記事 ID                  |
| title        | text        | NOT NULL            | タイトル                 |
| body         | text        | NOT NULL            | 本文（Markdown 可）      |
| level        | news_level  |                     | 情報レベル               |
| area         | text        |                     | 配信エリア               |
| source_url   | text        |                     | 情報元 URL               |
| published_at | timestamptz |                     | 公開日時                 |
| expires_at   | timestamptz |                     | 掲載終了日時             |
| status       | news_status |                     | draft/published/archived |
| created_at   | timestamptz | default now()       | 作成                     |
| updated_at   | timestamptz | default now()       | 更新                     |

---
