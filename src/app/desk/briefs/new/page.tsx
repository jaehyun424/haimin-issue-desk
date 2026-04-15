import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { issueSourceLinks, issues } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { BriefForm } from "../brief-form";

export const metadata = { title: "새 브리프" };

interface Props {
  searchParams: Promise<{ issueId?: string }>;
}

export default async function NewBriefPage({ searchParams }: Props) {
  await requireCapability("brief.draft");
  const { issueId } = await searchParams;
  if (!issueId) notFound();

  const issue = await db
    .select({ id: issues.id, title: issues.title })
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1)
    .then((r) => r[0]);
  if (!issue) notFound();

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(issueSourceLinks)
    .where(eq(issueSourceLinks.issueId, issue.id));
  const count = row?.count ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">새 브리프</h1>
        <p className="text-sm text-muted-foreground">
          대상 이슈:{" "}
          <span className="font-medium text-foreground">{issue.title}</span>
        </p>
        {count === 0 ? (
          <p className="mt-2 text-sm text-destructive">
            ⚠ 이 이슈에는 아직 연결된 출처가 없습니다. 발행 전에 출처를 최소 1건 연결해야 합니다.
          </p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">브리프 초안</CardTitle>
        </CardHeader>
        <CardContent>
          <BriefForm mode="create" issueId={issue.id} />
        </CardContent>
      </Card>
    </div>
  );
}
