"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 민감 정보 누출 방지: 메시지·digest 만 남기고 stack 은 서버 로그에 의존.
    console.error("[app error]", error.message, error.digest);
  }, [error]);

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="kicker mb-2">오류</p>
      <h1 className="mb-4">일시적인 오류가 발생했습니다.</h1>
      <p className="mb-8 text-muted-foreground">
        잠시 후 다시 시도해 주세요. 문제가 지속되면 의원실에 알려 주세요.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>다시 시도</Button>
        <Button variant="outline" asChild>
          <Link href="/">홈으로</Link>
        </Button>
      </div>
    </main>
  );
}
