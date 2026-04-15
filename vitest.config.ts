import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "dist"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Next.js `server-only` 가드는 테스트 환경에서 의미 없음 → noop 으로 alias.
      "server-only": path.resolve(__dirname, "./src/test/server-only-noop.ts"),
    },
  },
});
