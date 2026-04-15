import { formatKoreanDateTime, relativeFromNow } from "@/lib/utils";

interface Props {
  label?: string;
  value: Date | string | null | undefined;
  /** 60분 안쪽이면 "방금", 그 외에는 날짜+상대시각 */
  variant?: "relative" | "absolute" | "both";
}

export function FreshnessIndicator({ label = "마지막 갱신", value, variant = "both" }: Props) {
  if (!value) {
    return <span className="text-xs text-muted-foreground">{label}: 알 수 없음</span>;
  }
  const rel = relativeFromNow(value);
  const abs = formatKoreanDateTime(value);
  const content =
    variant === "relative" ? rel : variant === "absolute" ? abs : `${abs} · ${rel}`;
  return (
    <time
      className="text-xs text-muted-foreground"
      dateTime={typeof value === "string" ? value : value.toISOString()}
    >
      {label}: {content}
    </time>
  );
}
