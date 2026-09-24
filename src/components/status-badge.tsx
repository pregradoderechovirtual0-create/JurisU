import { STATUS_COLORS, STATUS_LABELS } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
