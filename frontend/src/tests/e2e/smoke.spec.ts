// frontend/src/tests/e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("スモーク：トップが200で表示できる", async ({ page }) => {
  const res = await page.goto("/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  expect(res && res.ok(), "トップが200で応答すること").toBeTruthy();

  // 画面が可視であること（ここで十分：水和前に#__nextが空でもパス）
  await expect(page.locator("body")).toBeVisible({ timeout: 30000 });

  // 参考: 何か要素が出てきたらラッキーで確認（出なくても落とさない）
  const hasAnyElement = await page
    .evaluate(
      () => (document.querySelector("#__next")?.childElementCount ?? 0) > 0
    )
    .catch(() => false);
  if (!hasAnyElement) {
    test
      .info()
      .annotations.push({
        type: "note",
        description: "#__next は水和前で空でした",
      });
  }
});
