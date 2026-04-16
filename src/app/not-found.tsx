import Link from "next/link";
import { MEMBER } from "@/lib/constants/member";

export const metadata = { title: "페이지를 찾을 수 없습니다" };

export default function NotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="kicker mb-2">404</p>
      <h1 className="mb-4">요청하신 페이지를 찾을 수 없습니다.</h1>
      <p className="mb-8 text-muted-foreground">
        주소가 바뀌었거나, 이미 보관 처리된 페이지일 수 있습니다.
      </p>
      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
        <Link href="/" className="underline underline-offset-4">
          홈으로
        </Link>
        <Link href="/brief" className="underline underline-offset-4">
          브리프 목록
        </Link>
      </div>
      <p className="mt-10 text-xs text-muted-foreground">
        오기·사실관계 정정은{" "}
        <a
          href={`mailto:${MEMBER.officeEmail}`}
          className="underline underline-offset-4"
        >
          {MEMBER.officeEmail}
        </a>
        로 알려 주세요.
      </p>
    </main>
  );
}
