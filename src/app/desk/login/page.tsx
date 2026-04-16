import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gov-strip" aria-hidden />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="kicker">관리 콘솔</p>
            <h1 className="mt-3 text-[1.75rem]">관리자 로그인</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              이해민 의원실 실무자 전용. 공개 페이지와 별개의 내부 운영 콘솔입니다.
            </p>
          </div>

          {hasError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>로그인 실패</AlertTitle>
              <AlertDescription>
                이메일·비밀번호가 올바르지 않거나 계정이 비활성 상태입니다.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="card-line p-6">
            <LoginForm callbackUrl={params.callbackUrl ?? "/desk"} />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            로그인 시도는 변경 내역에 기록됩니다. 공개 페이지로{" "}
            <Link className="underline underline-offset-4 hover:text-foreground" href="/">
              돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
