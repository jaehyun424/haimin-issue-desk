import { ExternalLink } from "lucide-react";
import { SOURCE_TYPE_LABELS } from "@/lib/validation/source";
import { formatKoreanDate } from "@/lib/utils";

export interface SourceListItem {
  id: string;
  title: string;
  url?: string | null;
  sourceName: string;
  sourceType: keyof typeof SOURCE_TYPE_LABELS;
  publishedAt?: Date | string | null;
  isPrimary?: boolean;
}

interface Props {
  items: SourceListItem[];
  emptyMessage?: string;
}

export function SourceList({ items, emptyMessage = "연결된 출처가 없습니다." }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <ol className="space-y-3 text-sm">
      {items.map((item, idx) => (
        <li key={item.id} className="flex gap-3">
          <span className="mt-0.5 w-6 shrink-0 tabular-nums text-muted-foreground">
            [{idx + 1}]
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {SOURCE_TYPE_LABELS[item.sourceType]} · {item.sourceName}
              </span>
              {item.isPrimary ? (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                  주요 출처
                </span>
              ) : null}
              {item.publishedAt ? (
                <span className="text-xs text-muted-foreground">
                  {formatKoreanDate(item.publishedAt)}
                </span>
              ) : null}
            </div>
            {item.url ? (
              <a
                className="inline-flex items-start gap-1 break-words text-foreground underline underline-offset-4 hover:text-primary"
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {item.title}
                <ExternalLink className="mt-1 h-3 w-3 shrink-0" aria-hidden />
              </a>
            ) : (
              <span className="break-words">{item.title}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
