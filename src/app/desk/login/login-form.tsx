"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validation/auth";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  // 데모 seed 관리자 자격 증명을 prefill. 운영 전환 시 교체 예정.
  const [email, setEmail] = useState("admin@haimin.local");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");
          return;
        }
        startTransition(async () => {
          const res = await signIn("credentials", {
            email: parsed.data.email,
            password: parsed.data.password,
            redirect: false,
            callbackUrl,
          });
          if (!res || res.error) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            return;
          }
          router.push(res.url ?? callbackUrl);
          router.refresh();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full shadow-soft" disabled={pending}>
        {pending ? "로그인 중…" : "로그인"}
      </Button>
    </form>
  );
}
