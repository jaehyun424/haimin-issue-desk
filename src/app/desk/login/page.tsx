import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "관리자 로그인" };

interface Props {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user) redirect("/desk");

  const params = await searchParams;
  const hasError = Boolean(params.error);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 gradient-paper" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center">
          <span className="gov-seal flex h-10 w-10 items-center justify-center rounded-md text-xs font-bold tracking-tight shadow-soft">
            이해민
          </span>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Issue Desk
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            관리자 로그인
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            이해민 의원실 실무자 전용. 공개 페이지와 별개의 내부 운영 콘솔입니다.
          </p>
        </div>

        <div className="card-line mt-8 p-6 shadow-lift">
          {hasError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>로그인 실패</AlertTitle>
              <AlertDescription>
                이메일·비밀번호가 올바르지 않거나 계정이 비활성 상태입니다.
              </AlertDescription>
            </Alert>
          ) : null}
          <LoginForm callbackUrl={params.callbackUrl ?? "/desk"} />
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-border/80 bg-card/60 p-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p>
            이 시스템은 공공 업무 도구이며 로그인 시도는 감사 로그에 기록됩니다.
            비밀번호는 해시로 저장되며, 초기 배포 이후 정기 교체를 권장합니다.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          공개 페이지로{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" href="/">
            돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
