"""add crowd_level to shelters
Revision ID: c5f1acb546da
Revises: users_pets_extensions
Create Date: 2025-10-20 04:39:51.884917
"""
from alembic import op
import sqlalchemy as sa

# 既存の新規IDをそのまま利用
revision = "c5f1acb546da"
down_revision = "users_pets_extensions"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # まずは TEXT で crowd_level を追加（NULL 許容）
    op.add_column(
        "shelters",
        sa.Column("crowd_level", sa.Text(), nullable=True),
    )
    # 必要なら将来の検索用インデックス（任意）
    # op.create_index("ix_shelters_crowd_level", "shelters", ["crowd_level"])

def downgrade() -> None:
    # インデックス作っていたら先に drop_index
    # op.drop_index("ix_shelters_crowd_level", table_name="shelters")
    op.drop_column("shelters", "crowd_level")
