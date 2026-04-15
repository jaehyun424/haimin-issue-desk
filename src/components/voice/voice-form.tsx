"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  VOICE_TYPE_DESCRIPTIONS,
  VOICE_TYPE_LABELS,
  type VOICE_TYPES,
} from "@/lib/validation/voice";
import { submitVoiceAction } from "@/app/(public)/voice/actions";
import { TurnstileWidget } from "./turnstile-widget";

interface Option {
  id: string;
  name: string;
}

/**
 * 제출 가능한 유형: policy_proposal, field_report.
 * personal_grievance, partnership 은 카드로만 안내하고 실제 접수는 받지 않는다.
 */
const FORM_VOICE_TYPES = [
  "policy_proposal",
  "field_report",
] as const satisfies ReadonlyArray<(typeof VOICE_TYPES)[number]>;

export function VoiceForm({
  categories,
  turnstileSiteKey,
}: {
  categories: Option[];
  turnstileSiteKey?: string;
}) {
  const [state, formAction, pending] = useActionState(submitVoiceAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;

  return (
    <form action={formAction} className="space-y-8">
      <p className="sr-only">
        과방위 관련 정책 제안 및 현장 의견을 접수하는 양식입니다. 필수 항목은 제출 유형,
        제목, 내용, 개인정보 수집·이용 동의입니다.
      </p>

      {/* 제출 유형 — 제출 가능한 2개만 라디오 카드로 노출 */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          제출 유형 <span aria-hidden>*</span>
        </legend>
        <div className="grid gap-2 md:grid-cols-2">
          {FORM_VOICE_TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-start gap-3 rounded border border-border bg-card p-3 text-sm transition-colors hover:border-foreground/40 has-[:checked]:border-primary has-[:checked]:bg-accent"
            >
              <input
                type="radio"
                name="type"
                value={t}
                required
                className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">
                  {VOICE_TYPE_LABELS[t]}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {VOICE_TYPE_DESCRIPTIONS[t]}
                </span>
              </span>
            </label>
          ))}
        </div>
        <ul className="space-y-1 pl-0.5 text-xs text-muted-foreground">
          <li>
            개인 민원은{" "}
            <a
              href="https://epeople.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4"
            >
              국민신문고
            </a>
            를 이용해 주세요.
          </li>
          <li>
            협업·인터뷰·자료 전달은 의원실 이메일{" "}
            <a
              href="mailto:haimin.office@assembly.go.kr"
              className="underline underline-offset-4"
            >
              haimin.office@assembly.go.kr
            </a>
            로 연락해 주세요.
          </li>
        </ul>
      </fieldset>

      {/* 관련 분야 */}
      <div className="space-y-2">
        <Label htmlFor="voice-category">관련 분야</Label>
        <select
          id="voice-category"
          name="categoryId"
          defaultValue=""
          className="h-10 w-full rounded border border-input bg-background px-3 text-sm"
        >
          <option value="">선택 안 함</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="voice-title">
          제목 <span aria-hidden>*</span>
        </Label>
        <Input id="voice-title" name="title" required maxLength={120} className="w-full" />
        <p className="text-xs text-muted-foreground">최대 120자</p>
      </div>

      {/* 내용 */}
      <div className="space-y-2">
        <Label htmlFor="voice-body">
          내용 <span aria-hidden>*</span>
        </Label>
        <Textarea
          id="voice-body"
          name="body"
          rows={10}
          required
          minLength={20}
          maxLength={3000}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">20~3000자</p>
      </div>

      {/* 선택 입력 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="voice-name">이름 또는 닉네임 (선택)</Label>
          <Input
            id="voice-name"
            name="displayName"
            maxLength={40}
            autoComplete="off"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="voice-email">이메일 (선택)</Label>
          <Input
            id="voice-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            className="w-full"
          />
        </div>
      </div>

      {/* 동의 */}
      <div className="card-line space-y-3 p-5 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          동의
        </p>
        <label className="flex items-start gap-3">
          <span className="mt-0.5">
            <Checkbox name="consentRequired" required />
          </span>
          <span className="text-foreground">
            <span className="font-medium">[필수]</span> 개인정보 수집·이용에 동의합니다.
            수집 목적과 보관 기간은{" "}
            <a href="/privacy" className="underline underline-offset-4">
              개인정보 처리방침
            </a>
            을 확인해 주세요.
          </span>
        </label>
        <label className="flex items-start gap-3">
          <span className="mt-0.5">
            <Checkbox name="consentOptionalContact" />
          </span>
          <span className="text-foreground">
            <span className="font-medium">[선택]</span> 이메일로 후속 연락을 받는 것에
            동의합니다. 동의하신 경우 이메일을 입력해 주세요.
          </span>
        </label>
      </div>

      <TurnstileWidget siteKey={turnstileSiteKey} />

      {err ? (
        <div
          role="alert"
          className="rounded border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <p className="font-medium">전송하지 못했습니다</p>
          <p className="mt-0.5">{err}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
          {pending ? "전송 중…" : "의견 보내기"}
        </Button>
        <p className="text-xs text-muted-foreground">
          제출 내용은 담당자만 열람합니다. 외부에는 종합 의견 형태로만 반영됩니다.
        </p>
      </div>
    </form>
  );
}
