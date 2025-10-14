"""A-4: favorites を複合PK(user_id, shelter_id)化

Revision ID: a4_favorites_composite_pk
Revises: 6e92acf56953
Create Date: 2025-10-14 09:20:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql

revision = "a4_favorites_composite_pk"
down_revision = "6e92acf56953"
branch_labels = None
depends_on = None

def upgrade():
    # 既存インデックス・制約の整理（環境差はtry/exceptで吸収）
    with op.batch_alter_table("favorites") as batch:
        for name in ("ix_fav_user", "ix_fav_shelter"):
            try:
                batch.drop_index(name)
            except Exception:
                pass
        try:
            batch.drop_constraint("uq_fav_user_shelter", type_="unique")
        except Exception:
            pass
        try:
            batch.drop_constraint("favorites_pkey", type_="primary")
        except Exception:
            pass
        try:
            batch.drop_column("id")
        except Exception:
            pass

        batch.create_primary_key("pk_favorites_user_shelter", ["user_id", "shelter_id"])
        batch.add_column(sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")))
        batch.add_column(sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")))

    op.create_index("ix_fav_user", "favorites", ["user_id"])
    op.create_index("ix_fav_shelter", "favorites", ["shelter_id"])

def downgrade():
    op.drop_index("ix_fav_shelter", table_name="favorites")
    op.drop_index("ix_fav_user", table_name="favorites")
    with op.batch_alter_table("favorites") as batch:
        batch.drop_constraint("pk_favorites_user_shelter", type_="primary")
        batch.drop_column("updated_at")
        batch.drop_column("created_at")
        batch.add_column(sa.Column("id", psql.UUID(as_uuid=True), primary_key=True))
        batch.create_unique_constraint("uq_fav_user_shelter", ["user_id", "shelter_id"])
