import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { issueCategories, users } from "@/lib/db/schema";
import { requireCapability } from "@/lib/auth/session";
import { IssueForm } from "../issue-form";

export const metadata = { title: "새 이슈" };

export default async function NewIssuePage() {
  await requireCapability("issue.write");
  const [categories, owners] = await Promise.all([
    db
      .select({ id: issueCategories.id, name: issueCategories.name })
      .from(issueCategories)
      .where(eq(issueCategories.isActive, true))
      .orderBy(issueCategories.sortOrder),
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(users.name),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">새 이슈</h1>
        <p className="text-sm text-muted-foreground">
          슬러그는 제목에서 자동 생성됩니다.
        </p>
      </header>
      <IssueForm mode="create" categories={categories} owners={owners} />
    </div>
  );
}
