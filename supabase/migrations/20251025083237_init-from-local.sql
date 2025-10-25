create extension if not exists "fuzzystrmatch" with schema "public" version '1.1';

create extension if not exists "pg_trgm" with schema "public" version '1.6';

create extension if not exists "postgis" with schema "public" version '3.4.3';

create type "public"."billing_state" as enum ('none', 'active', 'past_due', 'canceled');

create type "public"."news_level" as enum ('info', 'alert', 'emergency');

create type "public"."news_status" as enum ('draft', 'published', 'archived');

create type "public"."pet_species" as enum ('dog', 'cat', 'other');

create type "public"."shelter_type" as enum ('companion', 'accompany');

create type "public"."user_plan" as enum ('free', 'premium');

create table "public"."alembic_version" (
    "version_num" character varying(32) not null
);


create table "public"."audit_logs" (
    "id" uuid not null,
    "actor_user_id" uuid,
    "action" text,
    "target_type" text,
    "target_id" text,
    "meta" jsonb,
    "created_at" timestamp with time zone default now()
);


create table "public"."checklists" (
    "id" uuid not null,
    "user_id" uuid,
    "title" text,
    "items_json" jsonb,
    "updated_at" timestamp with time zone default now()
);


create table "public"."family_checkins" (
    "id" uuid not null,
    "member_id" uuid,
    "status" text,
    "message" text,
    "reported_at" timestamp with time zone default now(),
    "reported_by_user_id" uuid
);


create table "public"."family_members" (
    "id" uuid not null,
    "user_id" uuid,
    "name" text,
    "relation" text,
    "contact" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."favorites" (
    "user_id" uuid not null,
    "shelter_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."news" (
    "id" uuid not null,
    "title" text not null,
    "body" text not null,
    "level" news_level not null,
    "area" text,
    "source_url" text,
    "published_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "status" news_status not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."pets" (
    "id" uuid not null,
    "owner_id" uuid not null,
    "name" character varying not null,
    "species" pet_species not null,
    "vaccinated" boolean default false,
    "memo" text,
    "certificate_image_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."shelters" (
    "id" uuid not null,
    "name" character varying not null,
    "address" character varying,
    "type" shelter_type not null,
    "capacity" integer default 0,
    "geom" geography(Point,4326) not null,
    "phone" text,
    "website_url" text,
    "is_emergency_flood" boolean default false,
    "is_emergency_landslide" boolean default false,
    "is_emergency_tidalwave" boolean default false,
    "is_emergency_large_fire" boolean default false,
    "has_parking" boolean default false,
    "has_barrier_free_toilet" boolean default false,
    "has_pet_space" boolean default false,
    "is_designated_shelter" boolean default false,
    "is_welfare_shelter_primary" boolean default false,
    "emergency_space_note" text,
    "notes" text,
    "contact_hq" text,
    "source_asof_date" date,
    "latest_status" text,
    "latest_congestion" integer,
    "latest_reported_at" timestamp with time zone,
    "pin_icon" text,
    "image_urls" text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "crowd_level" text
);


create table "public"."users" (
    "id" uuid not null,
    "display_name" character varying,
    "email" character varying,
    "firebase_uid" character varying not null,
    "plan" user_plan not null default 'free'::user_plan,
    "premium_until" timestamp with time zone,
    "billing_status" billing_state not null default 'none'::billing_state,
    "stripe_customer_id" text,
    "stripe_sub_id" text
);


CREATE UNIQUE INDEX alembic_version_pkc ON public.alembic_version USING btree (version_num);

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX checklists_pkey ON public.checklists USING btree (id);

CREATE UNIQUE INDEX family_checkins_pkey ON public.family_checkins USING btree (id);

CREATE UNIQUE INDEX family_members_pkey ON public.family_members USING btree (id);

CREATE INDEX idx_shelters_geom ON public.shelters USING gist (geom);

CREATE INDEX ix_fav_shelter ON public.favorites USING btree (shelter_id);

CREATE INDEX ix_fav_user ON public.favorites USING btree (user_id);

CREATE INDEX ix_pets_owner ON public.pets USING btree (owner_id);

CREATE INDEX ix_shelters_geom ON public.shelters USING gist (geom);

CREATE INDEX ix_shelters_name_trgm ON public.shelters USING gin (name gin_trgm_ops);

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);

CREATE UNIQUE INDEX news_pkey ON public.news USING btree (id);

CREATE UNIQUE INDEX pets_pkey ON public.pets USING btree (id);

CREATE UNIQUE INDEX pk_favorites_user_shelter ON public.favorites USING btree (user_id, shelter_id);

CREATE UNIQUE INDEX shelters_pkey ON public.shelters USING btree (id);

CREATE UNIQUE INDEX uq_users_firebase_uid ON public.users USING btree (firebase_uid);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."alembic_version" add constraint "alembic_version_pkc" PRIMARY KEY using index "alembic_version_pkc";

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."checklists" add constraint "checklists_pkey" PRIMARY KEY using index "checklists_pkey";

alter table "public"."family_checkins" add constraint "family_checkins_pkey" PRIMARY KEY using index "family_checkins_pkey";

alter table "public"."family_members" add constraint "family_members_pkey" PRIMARY KEY using index "family_members_pkey";

alter table "public"."favorites" add constraint "pk_favorites_user_shelter" PRIMARY KEY using index "pk_favorites_user_shelter";

alter table "public"."news" add constraint "news_pkey" PRIMARY KEY using index "news_pkey";

alter table "public"."pets" add constraint "pets_pkey" PRIMARY KEY using index "pets_pkey";

alter table "public"."shelters" add constraint "shelters_pkey" PRIMARY KEY using index "shelters_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_actor_user_id_fkey" FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_actor_user_id_fkey";

alter table "public"."checklists" add constraint "checklists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."checklists" validate constraint "checklists_user_id_fkey";

alter table "public"."family_checkins" add constraint "family_checkins_member_id_fkey" FOREIGN KEY (member_id) REFERENCES family_members(id) ON DELETE CASCADE not valid;

alter table "public"."family_checkins" validate constraint "family_checkins_member_id_fkey";

alter table "public"."family_checkins" add constraint "family_checkins_reported_by_user_id_fkey" FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE SET NULL not valid;

alter table "public"."family_checkins" validate constraint "family_checkins_reported_by_user_id_fkey";

alter table "public"."family_members" add constraint "family_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."family_members" validate constraint "family_members_user_id_fkey";

alter table "public"."favorites" add constraint "favorites_shelter_id_fkey" FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_shelter_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_user_id_fkey";

alter table "public"."pets" add constraint "pets_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."pets" validate constraint "pets_owner_id_fkey";

alter table "public"."users" add constraint "uq_users_firebase_uid" UNIQUE using index "uq_users_firebase_uid";

create type "public"."geometry_dump" as ("path" integer[], "geom" geometry);

create type "public"."valid_detail" as ("valid" boolean, "reason" character varying, "location" geometry);

grant select on table "public"."spatial_ref_sys" to "PUBLIC";


