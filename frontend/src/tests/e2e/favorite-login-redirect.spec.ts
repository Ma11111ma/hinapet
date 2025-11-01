// frontend/src/tests/e2e/favorite-login-redirect.spec.ts
import { test, expect } from "@playwright/test";

test("ログイン前にお気に入り操作 → ログイン誘導", async ({ page, context }) => {
  // 未ログインを担保
  await context.clearCookies();
  await page.addInitScript(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });

  // 「お気に入り」クリック対象を柔軟に探索（どれか見つかったら使う）
  const candidates = [
    page.getByTestId("favorite-button"),
    page.getByRole("button", { name: /お気に入り|favorite|fav|ハート|heart/i }),
    page.locator(
      `[aria-label*="お気に入り" i],[title*="お気に入り" i],` +
        `[aria-label*="favorite" i],[title*="favorite" i],` +
        `[aria-label*="fav" i],[title*="fav" i],` +
        `[aria-label*="heart" i],[title*="heart" i]`
    ),
    // アイコンボタン想定のフォールバック（svgを内包するbutton/a）
    page.locator("button:has(svg), a:has(svg)"),
  ];

  let fav = null as null | ReturnType<typeof page.locator>;
  for (const c of candidates) {
    const first = c.first();
    if (await first.isVisible().catch(() => false)) {
      fav = first;
      break;
    }
  }
  expect(
    fav,
    'お気に入りボタンが見つかりません。data-testid="favorite-button" を付けると安定します。'
  ).toBeTruthy();

  await fav!.click();

  // A) URL が /auth/login に変わる もしくは B) ログインUIが見える のどちらでも合格
  const redirected = await page
    .waitForURL(/\/auth\/login(?:\?|$)/, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  let loginUiVisible = false;
  if (!redirected) {
    const uiLocators = [
      page.getByRole("heading", { name: /ログイン|sign\s*in|login/i }),
      page.getByRole("button", { name: /ログイン|sign\s*in|login/i }),
      page.getByPlaceholder(/メール|email/i),
      page.getByLabel(/メール|email/i),
    ];
    for (const loc of uiLocators) {
      if (
        await loc
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        loginUiVisible = true;
        break;
      }
    }
  }

  expect(
    redirected || loginUiVisible,
    [
      "お気に入りクリック後、/auth/login への遷移 もしくは ログインUIの表示が確認できませんでした。",
      'ヒント: FavoriteButton に data-testid="favorite-button" を付与、',
      "または未ログイン時の誘導を SSR/Middleware で 302 リダイレクトにするとより安定します。",
    ].join("\n")
  ).toBeTruthy();
});
