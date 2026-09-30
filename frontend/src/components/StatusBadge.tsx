import type { Idea } from "../types";

interface StatusBadgeProps {
  status: Idea["status"];
}

const statusConfig: Record<Idea["status"], { dot: string; text: string; bg: string; border: string; active?: boolean }> = {
  Draft: {
    dot: "bg-status-draft",
    text: "text-status-draft",
    bg: "bg-status-draft/10",
    border: "border-status-draft/20",
  },
  Submitted: {
    dot: "bg-status-submitted",
    text: "text-status-submitted",
    bg: "bg-status-submitted/10",
    border: "border-status-submitted/20",
    active: true,
  },
  "Under Review": {
    dot: "bg-status-review",
    text: "text-status-review",
    bg: "bg-status-review/10",
    border: "border-status-review/20",
    active: true,
  },
  Approved: {
    dot: "bg-status-approved",
    text: "text-status-approved",
    bg: "bg-status-approved/10",
    border: "border-status-approved/20",
  },
  Rejected: {
    dot: "bg-status-rejected",
    text: "text-status-rejected",
    bg: "bg-status-rejected/10",
    border: "border-status-rejected/20",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}
    >
      <span
        className={`status-dot h-1.5 w-1.5 rounded-full ${config.dot} ${
          config.active ? "is-pulsing" : ""
        }`}
      />
      {status}
    </span>
  );
}
