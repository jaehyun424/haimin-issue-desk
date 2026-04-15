import { Badge } from "@/components/ui/badge";
import {
  type ISSUE_PRIORITIES,
  ISSUE_PRIORITY_LABELS,
  type ISSUE_STATUSES,
  ISSUE_STATUS_LABELS,
} from "@/lib/validation/issue";
import { type BRIEF_STATUSES, BRIEF_STATUS_LABELS } from "@/lib/validation/brief";

export function IssueStatusBadge({ status }: { status: (typeof ISSUE_STATUSES)[number] }) {
  const map = {
    new: "secondary",
    reviewing: "warning",
    tracked: "default",
    ready_to_publish: "warning",
    published: "success",
    archived: "outline",
  } as const;
  return <Badge variant={map[status]}>{ISSUE_STATUS_LABELS[status]}</Badge>;
}

export function IssuePriorityBadge({
  priority,
}: {
  priority: (typeof ISSUE_PRIORITIES)[number];
}) {
  const map = {
    low: "outline",
    medium: "secondary",
    high: "warning",
    critical: "destructive",
  } as const;
  return <Badge variant={map[priority]}>{ISSUE_PRIORITY_LABELS[priority]}</Badge>;
}

export function BriefStatusBadge({ status }: { status: (typeof BRIEF_STATUSES)[number] }) {
  const map = {
    draft: "secondary",
    review: "warning",
    published: "success",
    archived: "outline",
  } as const;
  return <Badge variant={map[status]}>{BRIEF_STATUS_LABELS[status]}</Badge>;
}
