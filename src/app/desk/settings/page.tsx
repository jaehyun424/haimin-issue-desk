import { asc, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { issueCategories, featureFlags, users } from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { getAllFlags } from "@/lib/feature-flags";
import { defaultFlagSeeds } from "@/lib/constants/feature-flags";
import { FlagToggle } from "./flag-toggle";
import { CategoryEditor } from "./category-editor";
import { UserManager } from "./user-manager";

export const metadata = { title: "설정" };

export default async function DeskSettingsPage() {
  const session = await requireDeskSession();
  const [flagValues, flagRows, categories, userRows] = await Promise.all([
    getAllFlags().catch(() => ({}) as Record<string, boolean>),
    db.select().from(featureFlags),
    db
      .select()
      .from(issueCategories)
      .orderBy(issueCategories.sortOrder, desc(issueCategories.createdAt)),
    db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .orderBy(asc(users.createdAt)),
  ]);

  const flagDescriptions = new Map(
    defaultFlagSeeds().map((f) => [f.key as string, f.description]),
  );
  const flagDbDescriptions = new Map(flagRows.map((f) => [f.key, f.description]));

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-6">
        <p className="kicker">Settings</p>
        <h1 className="mt-2">운영 설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          feature flag · 카테고리 · 사용자 관리. 모든 변경은 감사 로그에 기록됩니다.
        </p>
      </header>

      <section>
        <header className="border-b border-foreground/80 pb-2">
          <h2>Feature flags</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            DB 값이 우선 적용되며, 토글 즉시 반영됩니다.
          </p>
        </header>
        <Card className="mt-5">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {defaultFlagSeeds().map((f) => (
                <li
                  key={f.key}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm">{f.key}</p>
                    <p className="text-xs text-muted-foreground">
                      {flagDbDescriptions.get(f.key) ?? flagDescriptions.get(f.key) ?? ""}
                    </p>
                  </div>
                  <FlagToggle
                    flagKey={f.key}
                    enabled={Boolean(flagValues[f.key])}
                    role={session.user.role}
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <header className="border-b border-foreground/80 pb-2">
          <h2>카테고리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            과방위 카테고리는 고정값이 아닙니다. 운영 중 자유롭게 변경 가능.
          </p>
        </header>
        <Card className="mt-5">
          <CardHeader>
            <CardTitle className="text-base">카테고리 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryEditor categories={categories} role={session.user.role} />
          </CardContent>
        </Card>
      </section>

      <section>
        <header className="border-b border-foreground/80 pb-2">
          <h2>사용자 관리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            계정 생성·역할 변경·비활성화·비밀번호 재설정. 관리자만 실행 가능.
          </p>
        </header>
        <div className="mt-5">
          <UserManager
            users={userRows}
            currentUserId={session.user.id}
            currentRole={session.user.role}
          />
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        로그인: {session.user.email} · 역할: {session.user.role}
      </p>
    </div>
  );
}
