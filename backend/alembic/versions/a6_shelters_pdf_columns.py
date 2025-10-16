# backend/alembic/versions/a6_shelters_pdf_columns.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql

revision = "a6_shelters_pdf_columns"
down_revision = "5c0363896404"  # 直前の merge head にぶら下げる
branch_labels = None
depends_on = None

def upgrade():
    # 連絡系
    op.add_column("shelters", sa.Column("phone", sa.Text(), nullable=True))
    op.add_column("shelters", sa.Column("website_url", sa.Text(), nullable=True))

    # PDF由来の boolean 群
    for col in [
        "is_emergency_flood",
        "is_emergency_landslide",
        "is_emergency_tidalwave",
        "is_emergency_large_fire",
        "has_parking",
        "has_barrier_free_toilet",
        "has_pet_space",
        "is_designated_shelter",
        "is_welfare_shelter_primary",
    ]:
        op.add_column("shelters", sa.Column(col, sa.Boolean(), nullable=True, server_default=sa.text("false")))

    # PDF由来の text / date
    op.add_column("shelters", sa.Column("emergency_space_note", sa.Text(), nullable=True))
    op.add_column("shelters", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column("shelters", sa.Column("contact_hq", sa.Text(), nullable=True))
    op.add_column("shelters", sa.Column("source_asof_date", sa.Date(), nullable=True))

    # 最新ステータス群（まずは text/int/timestamptz で運用）
    op.add_column("shelters", sa.Column("latest_status", sa.Text(), nullable=True))
    op.add_column("shelters", sa.Column("latest_congestion", sa.Integer(), nullable=True))
    op.add_column("shelters", sa.Column("latest_reported_at", sa.TIMESTAMP(timezone=True), nullable=True))
    op.add_column("shelters", sa.Column("pin_icon", sa.Text(), nullable=True))
    op.add_column("shelters", sa.Column("image_urls", psql.ARRAY(sa.Text()), nullable=True))
    op.add_column("shelters", sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=True))
    op.add_column("shelters", sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=True))

def downgrade():
    for col in [
        "updated_at","created_at","image_urls","pin_icon","latest_reported_at",
        "latest_congestion","latest_status","source_asof_date","contact_hq",
        "notes","emergency_space_note","is_welfare_shelter_primary",
        "is_designated_shelter","has_pet_space","has_barrier_free_toilet",
        "has_parking","is_emergency_large_fire","is_emergency_tidalwave",
        "is_emergency_landslide","is_emergency_flood","website_url","phone",
    ]:
        try:
            op.drop_column("shelters", col)
        except Exception:
            pass
