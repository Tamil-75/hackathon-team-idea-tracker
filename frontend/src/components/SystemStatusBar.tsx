export type StatusTone = "ok" | "idle" | "warn" | "error";

export interface StatusItem {
  label: string;
  value: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, { dot: string; text: string }> = {
  ok: { dot: "bg-status-approved text-status-approved", text: "text-status-approved" },
  idle: { dot: "bg-text-tertiary text-text-tertiary", text: "text-text-secondary" },
  warn: { dot: "bg-status-review text-status-review", text: "text-status-review" },
  error: { dot: "bg-status-rejected text-status-rejected", text: "text-status-rejected" },
};

/** Technical status strip — values are derived from real load state by callers. */
export default function SystemStatusBar({ items }: { items: StatusItem[] }) {
  return (
    <div
      role="status"
      className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl border border-border bg-surface px-4 py-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item) => {
        const tone = item.tone ?? "ok";
        const c = toneClasses[tone];
        return (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
          >
            <span className="text-text-tertiary">{item.label}</span>
            <span className={`inline-flex items-center gap-2 ${c.text}`}>
              <span
                className={`status-dot h-1.5 w-1.5 rounded-full ${c.dot} ${tone === "ok" ? "is-pulsing" : ""}`}
              />
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
