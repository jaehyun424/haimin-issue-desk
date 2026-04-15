/**
 * 초기 seed.
 *
 * - 카테고리 11개 (이미 있으면 skip)
 * - feature flags 3종 (이미 있으면 skip; 값 덮어쓰기 없음)
 * - 관리자 계정 2개 (admin/editor). 이메일은 env에서 읽고, 이미 존재하면 skip.
 *
 * 운영 전환 시:
 *  - seed 계정의 비밀번호는 반드시 로그인 후 즉시 변경.
 *  - TOTP 추가 예정 (v1.5).
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { INITIAL_CATEGORIES } from "../constants/categories";
import { defaultFlagSeeds } from "../constants/feature-flags";
import { db } from "./index";
import { featureFlags, issueCategories, users } from "./schema";

async function seedCategories() {
  let inserted = 0;
  for (const c of INITIAL_CATEGORIES) {
    const existing = await db
      .select({ id: issueCategories.id })
      .from(issueCategories)
      .where(eq(issueCategories.name, c.name))
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(issueCategories).values({
      name: c.name,
      sortOrder: c.sortOrder,
      isActive: true,
    });
    inserted += 1;
  }
  console.log(`[seed] 카테고리: ${inserted}개 삽입, ${INITIAL_CATEGORIES.length - inserted}개 존재`);
}

async function seedFlags() {
  let inserted = 0;
  for (const f of defaultFlagSeeds()) {
    const existing = await db
      .select({ key: featureFlags.key })
      .from(featureFlags)
      .where(eq(featureFlags.key, f.key))
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(featureFlags).values({
      key: f.key,
      enabled: f.enabled,
      description: f.description,
    });
    inserted += 1;
  }
  console.log(`[seed] feature_flags: ${inserted}개 삽입`);
}

async function seedUsers() {
  const cases: Array<{ email: string; password: string | undefined; role: "admin" | "editor"; name: string }> = [
    {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@haimin.local",
      password: process.env.SEED_ADMIN_PASSWORD,
      role: "admin",
      name: "초기 관리자",
    },
    {
      email: process.env.SEED_EDITOR_EMAIL ?? "editor@haimin.local",
      password: process.env.SEED_EDITOR_PASSWORD,
      role: "editor",
      name: "초기 편집자",
    },
  ];

  for (const c of cases) {
    if (!c.password) {
      console.warn(
        `[seed] ${c.role} 비밀번호 미설정 → 스킵. .env 에 SEED_${c.role.toUpperCase()}_PASSWORD 설정 필요`,
      );
      continue;
    }
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, c.email))
      .limit(1);
    if (existing.length > 0) {
      console.log(`[seed] ${c.email} 이미 존재 → 스킵`);
      continue;
    }
    const passwordHash = await bcrypt.hash(c.password, 12);
    await db.insert(users).values({
      email: c.email,
      name: c.name,
      role: c.role,
      passwordHash,
      isActive: true,
    });
    console.log(`[seed] ${c.role} 계정 생성: ${c.email}`);
  }
}

async function main() {
  await seedCategories();
  await seedFlags();
  await seedUsers();
  console.log("[seed] 완료");
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] 실패", err);
  process.exit(1);
});
