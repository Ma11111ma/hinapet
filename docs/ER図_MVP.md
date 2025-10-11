# ER 図（MVP）

```mermaid
erDiagram
    USERS ||--o{ PETS : owns
    USERS ||--o{ FAVORITES : bookmarks
    USERS ||--o{ AUDIT_LOGS : acts
    SHELTERS ||--o{ FAVORITES : saved_by

    USERS {
      uuid id PK
      text firebase_uid UK
      text display_name
      text phone
      text email
      user_plan plan
      timestamptz premium_until
      billing_state billing_status
      text stripe_customer_id
      text stripe_sub_id
      timestamptz last_payment_at
      text qr
      timestamptz created_at
      timestamptz updated_at
    }

    PETS {
      uuid id PK
      uuid owner_id FK "-> USERS.id"
      text name
      pet_species species
      boolean vaccinated
      text memo
      text certificate_image_url
      timestamptz created_at
      timestamptz updated_at
    }

    SHELTERS {
      uuid id PK
      text name
      text address
      text phone
      text website_url
      shelter_type type
      int capacity
      geography_point geom "geography(Point,4326)"
      shelter_open_status latest_status
      int latest_congestion "0..100"
      timestamptz latest_reported_at
      text pin_icon
      text_array image_urls
      timestamptz created_at
      timestamptz updated_at
    }

    FAVORITES {
      uuid user_id FK "-> USERS.id"
      uuid shelter_id FK "-> SHELTERS.id"
      timestamptz created_at
      timestamptz updated_at
      PK "user_id, shelter_id"
    }

    AUDIT_LOGS {
      uuid id PK
      uuid actor_user_id FK "-> USERS.id"
      text action
      text target_type
      text target_id
      jsonb meta
      timestamptz created_at
    }
```
