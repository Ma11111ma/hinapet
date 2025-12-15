// 例：既存設定は残しつつ、下記に切り替え or 簡単に置換でもOK
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "src/tests/e2e",
  timeout: 30_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // ★ 本番サーバで実行（安定）
  webServer: {
    command: "npm run build && npm run start",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
