"""add family, checklists, and news tables + enums"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# Revision identifiers
revision = "family_checklists_news"
down_revision = "20251016_0000_add_audit_logs"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()

    # === ENUM（既存があれば使う。新規作成は一度だけ）===
    # create_type=False にして、テーブル作成時に「暗黙作成」させない
    news_level = postgresql.ENUM(
        "info", "alert", "emergency", name="news_level", create_type=False
    )
    news_status = postgresql.ENUM(
        "draft", "published", "archived", name="news_status", create_type=False
    )
    # 明示作成。ただし checkfirst=True で既存ならスキップ
    news_level.create(bind=bind, checkfirst=True)
    news_status.create(bind=bind, checkfirst=True)

    # === family_members ===
    op.create_table(
        "family_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("name", sa.Text),
        sa.Column("relation", sa.Text),
        sa.Column("contact", sa.Text),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
    )
    # ※ Alembic では index=True が効かないことがあるので索引が必要なら明示で作成
    # op.create_index("ix_family_members_user_id", "family_members", ["user_id"])

    # === family_checkins ===
    op.create_table(
        "family_checkins",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("member_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("family_members.id", ondelete="CASCADE")),
        sa.Column("status", sa.Text),
        sa.Column("message", sa.Text),
        sa.Column("reported_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
        sa.Column("reported_by_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
    )

    # === checklists ===
    op.create_table(
        "checklists",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("title", sa.Text),
        sa.Column("items_json", postgresql.JSONB),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
    )

    # === news ===
    # ここが重要：列型に上で定義した ENUM オブジェクト（news_level/news_status）をそのまま使う
    op.create_table(
        "news",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("level", news_level, nullable=False),
        sa.Column("area", sa.Text),
        sa.Column("source_url", sa.Text),
        sa.Column("published_at", sa.TIMESTAMP(timezone=True)),
        sa.Column("expires_at", sa.TIMESTAMP(timezone=True)),
        sa.Column("status", news_status, nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()")),
    )


def downgrade():
    # 依存順でDROP
    op.drop_table("news")
    op.drop_table("checklists")
    op.drop_table("family_checkins")
    op.drop_table("family_members")

    # 型は他でも使う可能性があるため、通常は残すのが安全
    # どうしても落とす場合のみコメントアウト解除
    # op.execute("DROP TYPE IF EXISTS news_level")
    # op.execute("DROP TYPE IF EXISTS news_status")
