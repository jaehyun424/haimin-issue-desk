import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/common/section";
import { db } from "@/lib/db";
import { issueCategories, featureFlags } from "@/lib/db/schema";
import { requireDeskSession } from "@/lib/auth/session";
import { getAllFlags } from "@/lib/feature-flags";
import { defaultFlagSeeds } from "@/lib/constants/feature-flags";
import { FlagToggle } from "./flag-toggle";
import { CategoryEditor } from "./category-editor";

export const metadata = { title: "설정" };

export default async function DeskSettingsPage() {
  const session = await requireDeskSession();
  const [flagValues, flagRows, categories] = await Promise.all([
    getAllFlags().catch(() => ({}) as Record<string, boolean>),
    db.select().from(featureFlags),
    db.select().from(issueCategories).orderBy(issueCategories.sortOrder, desc(issueCategories.createdAt)),
  ]);

  const flagDescriptions = new Map(
    defaultFlagSeeds().map((f) => [f.key as string, f.description]),
  );
  const flagDbDescriptions = new Map(flagRows.map((f) => [f.key, f.description]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
        <p className="text-sm text-muted-foreground">
          feature flag · 카테고리 · 권한 관리. (사용자·감사 로그 편집은 v1.5에서 추가 예정)
        </p>
      </header>

      <Section
        title="Feature flags"
        description="DB에 저장된 플래그가 우선합니다. 토글은 즉시 반영되며 감사 로그에 기록됩니다."
      >
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {defaultFlagSeeds().map((f) => (
                <li key={f.key} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm">{f.key}</p>
                    <p className="text-xs text-muted-foreground">
                      {flagDbDescriptions.get(f.key) ?? flagDescriptions.get(f.key) ?? ""}
                    </p>
                  </div>
                  <FlagToggle flagKey={f.key} enabled={Boolean(flagValues[f.key])} role={session.user.role} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="카테고리"
        description="과방위 카테고리는 고정값이 아닙니다. 운영 중 자유롭게 변경 가능합니다."
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryEditor categories={categories} role={session.user.role} />
          </CardContent>
        </Card>
      </Section>

      <p className="text-xs text-muted-foreground">
        로그인: {session.user.email} · 역할: {session.user.role}
      </p>
    </div>
  );
}
