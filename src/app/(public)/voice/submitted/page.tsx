import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "접수 완료" };

interface Props {
  searchParams: Promise<{ kind?: string }>;
}

export default async function VoiceSubmittedPage({ searchParams }: Props) {
  const { kind } = await searchParams;
  const isGrievance = kind === "grievance";

  return (
    <div className="mx-auto max-w-xl space-y-8 py-8 text-center">
      {isGrievance ? (
        <>
          <h1>개인 민원은 공식 창구를 이용해 주세요</h1>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            이해민 의원실 정책 제안 창구는 과방위 관련 정책 의견 수렴을 위한 도구입니다.
            개인적 피해·불편은 아래 공식 채널에서 법정 기한 내 답변을 받으실 수 있습니다.
          </p>
          <div className="card-line p-5 text-left">
            <p className="text-sm font-semibold text-foreground">안내 채널</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <a
                  href="https://epeople.go.kr"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4"
                >
                  국민신문고
                </a>
                : 정부·공공기관 민원 접수 공식 창구
              </li>
              <li>
                <a
                  href="https://petitions.assembly.go.kr"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4"
                >
                  국민동의청원
                </a>
                : 국회 공식 청원 (동의자 5만 명 이상)
              </li>
              <li>의원실 공식 이메일: 현안과 관련된 경우 직접 연락 가능</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <h1>의견이 접수되었습니다</h1>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            보내 주신 내용을 의원실에서 검토하겠습니다. 연락처 제공에 동의하신 경우, 필요 시
            담당자가 이메일로 연락드릴 수 있습니다.
          </p>
          <div className="card-line p-5 text-left">
            <p className="text-sm font-semibold text-foreground">개인 민원이신가요?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              개인적 피해·불편은 국민신문고 또는 각 부처 민원 창구를 이용하시면 법정 기한 내
              공식 답변을 받으실 수 있습니다.
            </p>
          </div>
        </>
      )}
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">홈으로</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/brief">브리프 보기</Link>
        </Button>
      </div>
    </div>
  );
}
