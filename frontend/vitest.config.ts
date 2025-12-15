// frontend/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],

    include: [
      // ✅ Vitest は unit / integration のみ対象
      "src/tests/unit/**/*.{test,spec}.{ts,tsx}",
      "src/tests/integration/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".next",
      // 🚫 e2e は Playwright 専用。Vitest から完全除外
      "src/tests/e2e/**",
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // まずは今テストしている範囲だけを計測
      include: [
        "src/hooks/**/*.{ts,tsx}",
        "src/components/FavoriteButton.tsx",
        "src/store/**/*.{ts,tsx}",
        // 必要に応じて広げる: "src/features/**/*.{ts,tsx}",
      ],
      exclude: [
        "src/app/**",
        "src/components/MapView.tsx",
        "src/components/**/Map*.tsx",
        "src/components/**/Search*.tsx",
        "src/components/**/Modal*.tsx",
        "src/features/auth/**",
        "src/types/**",
        "src/lib/**",
        "src/_trash/**",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
