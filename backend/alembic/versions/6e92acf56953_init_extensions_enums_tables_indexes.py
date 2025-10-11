"""init: extensions, enums, tables, indexes

Revision ID: 6e92acf56953
Revises:
Create Date: 2025-10-11 09:38:23.230879
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql
from geoalchemy2.types import Geography

# --- Alembic identifiers (必須。型注釈は付けない) ---
revision = "6e92acf56953"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 拡張
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # ENUM（型そのものを先に作る）
    sa.Enum("free", "premium", name="user_plan").create(op.get_bind(), checkfirst=True)
    sa.Enum("dog", "cat", "other", name="pet_species").create(op.get_bind(), checkfirst=True)
    sa.Enum("companion", "accompany", name="shelter_type").create(op.get_bind(), checkfirst=True)

    # 既存 ENUM を列で参照（再作成しない）
    user_plan_t = psql.ENUM(name="user_plan", create_type=False)
    pet_species_t = psql.ENUM(name="pet_species", create_type=False)
    shelter_type_t = psql.ENUM(name="shelter_type", create_type=False)

    # USERS
    op.create_table(
        "users",
        sa.Column("id", psql.UUID(as_uuid=True), primary_key=True),
        sa.Column("display_name", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("firebase_uid", sa.String(), nullable=True),
        sa.Column("plan", user_plan_t, nullable=False, server_default="free"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # SHELTERS
    op.create_table(
        "shelters",
        sa.Column("id", psql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("type", shelter_type_t, nullable=False),
        sa.Column("capacity", sa.Integer(), server_default="0"),
        sa.Column("geom", Geography(geometry_type="POINT", srid=4326), nullable=False),
    )
    op.execute('CREATE INDEX "ix_shelters_geom" ON shelters USING GIST (geom)')
    op.execute('CREATE INDEX "ix_shelters_name_trgm" ON shelters USING GIN (name gin_trgm_ops)')

    # PETS
    op.create_table(
        "pets",
        sa.Column("id", psql.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_id", psql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("species", pet_species_t, nullable=False),
    )
    op.create_index("ix_pets_owner", "pets", ["owner_id"])

    # FAVORITES
    op.create_table(
        "favorites",
        sa.Column("id", psql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", psql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shelter_id", psql.UUID(as_uuid=True), sa.ForeignKey("shelters.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("user_id", "shelter_id", name="uq_fav_user_shelter"),
    )
    op.create_index("ix_fav_user", "favorites", ["user_id"])
    op.create_index("ix_fav_shelter", "favorites", ["shelter_id"])


def downgrade():
    op.drop_index("ix_fav_shelter", table_name="favorites")
    op.drop_index("ix_fav_user", table_name="favorites")
    op.drop_table("favorites")

    op.drop_index("ix_pets_owner", table_name="pets")
    op.drop_table("pets")

    op.execute('DROP INDEX IF EXISTS "ix_shelters_name_trgm"')
    op.execute('DROP INDEX IF EXISTS "ix_shelters_geom"')
    op.drop_table("shelters")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS shelter_type")
    op.execute("DROP TYPE IF EXISTS pet_species")
    op.execute("DROP TYPE IF EXISTS user_plan")

    op.execute("DROP EXTENSION IF EXISTS pg_trgm")
    op.execute("DROP EXTENSION IF EXISTS postgis")
