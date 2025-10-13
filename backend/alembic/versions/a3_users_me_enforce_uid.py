"""enforce users.firebase_uid NOT NULL + UNIQUE"""
from alembic import op
import sqlalchemy as sa

revision = "a3_users_me_enforce_uid"
down_revision = "6e92acf56953"  # あなたの初期REVに合わせる
branch_labels = None
depends_on = None

def upgrade():
    # 空文字があればNULLに正規化（必要に応じて）
    op.execute("UPDATE users SET firebase_uid = NULL WHERE firebase_uid = ''")

    op.alter_column(
        "users",
        "firebase_uid",
        existing_type=sa.String(),
        nullable=False,
    )
    op.create_unique_constraint("uq_users_firebase_uid", "users", ["firebase_uid"])

def downgrade():
    op.drop_constraint("uq_users_firebase_uid", "users", type_="unique")
    op.alter_column("users", "firebase_uid", nullable=True)
