import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __PG_CLIENT__: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __DB__: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL 이 설정되지 않았습니다. .env.local 또는 배포 환경변수를 확인하세요.",
    );
  }
  return url;
}

function createClient() {
  return postgres(getConnectionString(), {
    max: process.env.APP_ENV === "production" ? 10 : 3,
    prepare: false,
    idle_timeout: 20,
  });
}

// dev 에서는 HMR 으로 연결이 누적되지 않도록 global 재사용.
const client = globalThis.__PG_CLIENT__ ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__PG_CLIENT__ = client;
}

export const db =
  globalThis.__DB__ ??
  drizzle(client, {
    schema,
    logger: process.env.APP_ENV === "local",
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__DB__ = db;
}

export { schema };
export type DB = typeof db;
