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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-primary">이해민 의원실</p>
          <h1 className="text-2xl font-semibold tracking-tight">Desk 관리자 로그인</h1>
          <p className="text-sm text-muted-foreground">
            이메일과 비밀번호를 입력해 주세요.
          </p>
        </div>
        {hasError ? (
          <Alert variant="destructive">
            <AlertTitle>로그인 실패</AlertTitle>
            <AlertDescription>
              이메일 또는 비밀번호가 올바르지 않거나, 계정이 비활성 상태입니다.
            </AlertDescription>
          </Alert>
        ) : null}
        <LoginForm callbackUrl={params.callbackUrl ?? "/desk"} />
        <p className="text-center text-xs text-muted-foreground">
          공개 페이지로{" "}
          <Link className="underline" href="/">
            돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
