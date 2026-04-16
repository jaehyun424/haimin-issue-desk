import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { issueCategories } from "@/lib/db/schema";
import { FLAG, getFlags } from "@/lib/feature-flags";
import { VoiceForm } from "@/components/voice/voice-form";

export const metadata = { title: "과방위 정책 제안 접수" };
export const dynamic = "force-dynamic";

export default async function VoicePage() {
  const flags = await getFlags([FLAG.VOICE_ENABLED]).catch(() => ({
    [FLAG.VOICE_ENABLED]: false,
  }));
  if (!flags[FLAG.VOICE_ENABLED]) {
    notFound();
  }
  const categories = await db
    .select({ id: issueCategories.id, name: issueCategories.name })
    .from(issueCategories)
    .where(eq(issueCategories.isActive, true))
    .orderBy(issueCategories.sortOrder);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="kicker">정책 제안</p>
        <h1>과방위 정책 제안 접수</h1>
        <p className="text-[17px] leading-relaxed text-muted-foreground">
          이해민 의원실이 과방위 관련 정책 참고를 위해 검토하는 제안 및 현장 의견을
          접수합니다. 아래 안내를 확인한 뒤 양식에 내용을 작성해 주세요.
        </p>
      </header>

      <section aria-label="안내" className="space-y-4">
        <div className="card-line p-5">
          <p className="text-sm font-semibold text-foreground">
            공식 청원·민원 시스템이 아닙니다
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            이 페이지는 국회 공식 청원(국민동의청원) 또는 정부 민원(국민신문고) 창구가
            아닙니다. 공식 청원은{" "}
            <a
              href="https://petitions.assembly.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4"
            >
              국민동의청원
            </a>
            , 민원은{" "}
            <a
              href="https://epeople.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4"
            >
              국민신문고
            </a>
            를 이용해 주세요.
          </p>
        </div>

        <div className="card-line p-5">
          <p className="text-sm font-semibold text-foreground">개인정보 최소 수집 원칙</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            이름·이메일은 선택 입력이며, 휴대전화·주소·주민번호·첨부파일은 받지
            않습니다. 접수된 의견은 공개되지 않으며, 담당자만 열람합니다. 자세한 내용은{" "}
            <Link className="underline underline-offset-4" href="/privacy">
              개인정보 처리방침
            </Link>
            을 확인해 주세요.
          </p>
        </div>
      </section>

      <section aria-label="제안 양식">
        <header className="border-b border-foreground/80 pb-2">
          <h2>제안 양식</h2>
        </header>
        <div className="mt-6">
          <VoiceForm
            categories={categories}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />
        </div>
      </section>
    </div>
  );
}
