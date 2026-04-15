/**
 * 운영용 마이그레이션 러너.
 * dev 는 `drizzle-kit push` 로 충분하므로, 이 파일은 CI/운영 배포에서 사용.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 미설정");

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  console.log("drizzle migrate 시작…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("drizzle migrate 완료");

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
