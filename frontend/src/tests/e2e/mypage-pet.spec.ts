// frontend/src/tests/e2e/mypage-pet.spec.ts
import { test, expect } from "@playwright/test";

test("未ログインで /mypage → /auth/login へリダイレクト（またはログインUI表示）", async ({
  page,
  context,
}) => {
  // 0) 未ログインを担保（Cookie/Storage 全クリア）
  await context.clearCookies();
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // 必要なら IndexedDB も消す（名前が分かるなら個別に）
      // indexedDB.deleteDatabase("firebaseLocalStorageDb");
    } catch {}
  });

  // 1) /mypage へ遷移
  await page.goto("/mypage", { waitUntil: "domcontentloaded" });

  // 2) どちらか成立すれば合格：
  //    A) URL が /auth/login になる（サーバ/Middleware or CSR リダイレクト）
  //    B) ログイン UI（見出し or ボタンなど）が可視
  const pass = await Promise.race<boolean>([
    page
      .waitForURL(/\/auth\/login(?:\?|$)/, { timeout: 15000 })
      .then(() => true)
      .catch(() => false),

    (async () => {
      const candidates = [
        page.getByRole("heading", { name: /ログイン|sign\s*in|login/i }),
        page.getByRole("button", { name: /ログイン|sign\s*in|login/i }),
        page.getByPlaceholder(/メール|email/i),
        page.getByLabel(/メール|email/i),
      ];
      for (const loc of candidates) {
        if (
          await loc
            .first()
            .isVisible()
            .catch(() => false)
        )
          return true;
      }
      // 少し待ってから再チェック（CSR 初期化待ち）
      await page.waitForTimeout(1000);
      for (const loc of candidates) {
        if (
          await loc
            .first()
            .isVisible()
            .catch(() => false)
        )
          return true;
      }
      return false;
    })(),
  ]);

  expect(
    pass,
    [
      "未ログインで /mypage へアクセスした際に、/auth/login へのリダイレクト",
      "またはログインUIの表示が確認できませんでした。",
      "（ヒント）SSR/Middleware で保護するか、ログインページに見出し/ボタンのアクセシブルなラベルを付けると安定します。",
    ].join("\n")
  ).toBeTruthy();
});
