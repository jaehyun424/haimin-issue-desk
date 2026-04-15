"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  VOICE_TYPES,
  VOICE_TYPE_DESCRIPTIONS,
  VOICE_TYPE_LABELS,
} from "@/lib/validation/voice";
import { submitVoiceAction } from "@/app/(public)/voice/actions";

interface Option {
  id: string;
  name: string;
}

export function VoiceForm({ categories }: { categories: Option[] }) {
  const [state, formAction, pending] = useActionState(submitVoiceAction, null as unknown);
  const err = (state as { error?: string } | null)?.error;

  return (
    <form action={formAction} className="space-y-5" aria-describedby="voice-help">
      <p id="voice-help" className="sr-only">
        과방위 관련 정책 제안 및 현장 의견을 접수하는 양식입니다. 필수 항목은 제목, 내용, 개인정보
        수집·이용 동의입니다.
      </p>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">제출 유형 *</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {VOICE_TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-start gap-2 rounded-md border border-input p-3 hover:bg-accent"
            >
              <input type="radio" name="type" value={t} required className="mt-1" />
              <span className="flex flex-col text-sm">
                <span className="font-medium">{VOICE_TYPE_LABELS[t]}</span>
                <span className="text-xs text-muted-foreground">
                  {VOICE_TYPE_DESCRIPTIONS[t]}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="voice-category">관련 분야</Label>
        <select
          id="voice-category"
          name="categoryId"
          defaultValue=""
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">선택 안 함</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="voice-title">제목 *</Label>
        <Input id="voice-title" name="title" required maxLength={120} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="voice-body">내용 * (20~3000자)</Label>
        <Textarea id="voice-body" name="body" rows={10} required minLength={20} maxLength={3000} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="voice-name">이름 또는 닉네임 (선택)</Label>
          <Input id="voice-name" name="displayName" maxLength={40} autoComplete="off" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="voice-email">이메일 (선택)</Label>
          <Input
            id="voice-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-border bg-muted/20 p-4 text-sm">
        <label className="flex items-start gap-2">
          <Checkbox name="consentRequired" required />
          <span>
            [필수] 개인정보 수집·이용에 동의합니다. 수집 목적과 보관 기간은{" "}
            <a href="/privacy" className="underline">
              개인정보 처리방침
            </a>
            을 확인해 주세요.
          </span>
        </label>
        <label className="flex items-start gap-2">
          <Checkbox name="consentOptionalContact" />
          <span>
            [선택] 이메일로 후속 연락을 받는 것에 동의합니다. 동의하신 경우 이메일을 입력해
            주세요.
          </span>
        </label>
      </div>

      {err ? (
        <Alert variant="destructive">
          <AlertTitle>전송하지 못했습니다</AlertTitle>
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "전송 중…" : "의견 보내기"}
      </Button>
      <p className="text-xs text-muted-foreground">
        제출 후에는 담당자만 내용을 열람합니다. 외부에는 종합 의견 형태로만 반영됩니다.
      </p>
    </form>
  );
}
