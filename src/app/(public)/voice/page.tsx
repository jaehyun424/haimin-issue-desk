import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { issueCategories } from "@/lib/db/schema";
import { FLAG, getFlags } from "@/lib/feature-flags";
import { VOICE_TYPE_DESCRIPTIONS, VOICE_TYPE_LABELS, VOICE_TYPES } from "@/lib/validation/voice";
import { VoiceForm } from "@/components/voice/voice-form";

export const metadata = { title: "과방위 정책 제안 접수" };
export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const flags = await getFlags([FLAG.VOICE_ENABLED]).catch(() => ({
    [FLAG.VOICE_ENABLED]: false,
  }));
  if (!flags[FLAG.VOICE_ENABLED]) {
    // 플래그 OFF: v1 배포 기본값. 라우트 자체를 404 로 처리.
    notFound();
  }
  const categories = await db
    .select({ id: issueCategories.id, name: issueCategories.name })
    .from(issueCategories)
    .where(eq(issueCategories.isActive, true))
    .orderBy(issueCategories.sortOrder);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">과방위 정책 제안 접수</h1>
        <p className="text-muted-foreground">
          이해민 의원실이 과방위 관련 정책 참고를 위해 검토하는 제안 및 현장 의견을 접수합니다.
        </p>
        <Alert variant="info">
          <AlertTitle>공식 청원 · 민원 시스템이 아닙니다</AlertTitle>
          <AlertDescription>
            이 페이지는 국회 공식 청원(국민동의청원) 또는 정부 민원(국민신문고) 창구가 아닙니다.
            공식 청원은{" "}
            <a
              href="https://petitions.assembly.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              국민동의청원
            </a>
            , 민원은{" "}
            <a
              href="https://epeople.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="underline"
            >
              국민신문고
            </a>
            를 이용해 주세요.
          </AlertDescription>
        </Alert>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {VOICE_TYPES.map((t) => (
          <Card key={t} className="card-line">
            <CardHeader>
              <CardTitle className="text-base">{VOICE_TYPE_LABELS[t]}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {VOICE_TYPE_DESCRIPTIONS[t]}
            </CardContent>
          </Card>
        ))}
      </section>

      <Alert variant="warning">
        <AlertTitle>개인정보 최소 수집 원칙</AlertTitle>
        <AlertDescription>
          이름·이메일은 선택 입력이며, 휴대전화·주소·주민번호·첨부파일은 받지 않습니다. 접수된
          의견은 공개되지 않으며, 담당자만 열람합니다. 자세한 내용은{" "}
          <Link className="underline" href="/privacy">
            개인정보 처리방침
          </Link>
          을 확인해 주세요.
        </AlertDescription>
      </Alert>

      <VoiceForm categories={categories} />
    </div>
  );
}
