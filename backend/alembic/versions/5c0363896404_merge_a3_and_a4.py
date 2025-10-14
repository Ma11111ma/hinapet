"""merge a3_users_me_enforce_uid and a4_favorites_composite_pk"""

# このファイルは、枝分かれした2つの head を1つに束ねるための「空リビジョン」です。
# DB構造の変更はここでは行いません（upgrade/downgrade は pass）。

revision = "5c0363896404"  # ファイル名と同じIDでOK（ユニークなら可）
down_revision = ("a4_favorites_composite_pk", "a3_users_me_enforce_uid")  # ★ 単数名！タプルで複数親
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 変更なし（統合のみ）
    pass

def downgrade() -> None:
    # 変更なし
    pass
