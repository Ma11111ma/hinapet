"""add columns: USERS(4) & PETS(5); add billing_state enum"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql

# --- Alembic identifiers ---
revision = "users_pets_extensions"
down_revision = "family_checklists_news"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ENUM: billing_state（必要なら値は後で増やせます）
    billing_state_t = psql.ENUM(
        "none", "active", "past_due", "canceled",
        name="billing_state",
        create_type=False,
    )
    # 型そのものが無ければ作成
    sa.Enum("none", "active", "past_due", "canceled", name="billing_state").create(
        op.get_bind(), checkfirst=True
    )

    # USERS に 4 列追加
    op.add_column(
        "users",
        sa.Column("premium_until", sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("billing_status", billing_state_t, nullable=False, server_default="none"),
    )
    op.add_column(
        "users",
        sa.Column("stripe_customer_id", sa.Text(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("stripe_sub_id", sa.Text(), nullable=True),
    )

    # PETS に 5 列追加
    op.add_column(
        "pets",
        sa.Column("vaccinated", sa.Boolean(), nullable=True, server_default=sa.text("false")),
    )
    op.add_column(
        "pets",
        sa.Column("memo", sa.Text(), nullable=True),
    )
    op.add_column(
        "pets",
        sa.Column("certificate_image_url", sa.Text(), nullable=True),
    )
    op.add_column(
        "pets",
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("now()")),
    )
    op.add_column(
        "pets",
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), nullable=True, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    # PETS 側から先に落とす
    for col in ["updated_at", "created_at", "certificate_image_url", "memo", "vaccinated"]:
        try:
            op.drop_column("pets", col)
        except Exception:
            pass

    # USERS の列を落とす
    for col in ["stripe_sub_id", "stripe_customer_id", "billing_status", "premium_until"]:
        try:
            op.drop_column("users", col)
        except Exception:
            pass

    # ENUM 自体を削除（他で未使用なら）
    op.execute("DROP TYPE IF EXISTS billing_state")
