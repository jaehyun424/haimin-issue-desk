import { defineConfig } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

// .env.local 우선, 없으면 .env
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL 이 없습니다. .env.local 을 생성하거나 환경변수를 설정하세요.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
