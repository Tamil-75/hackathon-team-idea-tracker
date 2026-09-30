import AnimatedCounter from "./AnimatedCounter";
import FlowConnector from "./FlowConnector";

export interface PipelineCounts {
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
}

const STAGES = [
  { key: "draft", label: "Draft", color: "text-status-draft", ring: "border-status-draft/40" },
  { key: "submitted", label: "Submitted", color: "text-status-submitted", ring: "border-status-submitted/40" },
  { key: "under_review", label: "Under Review", color: "text-status-review", ring: "border-status-review/40" },
  { key: "approved", label: "Approved", color: "text-status-approved", ring: "border-status-approved/40" },
] as const;

function Node({
  label,
  count,
  color,
  ring,
  index,
}: {
  label: string;
  count: number;
  color: string;
  ring: string;
  index?: number;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center gap-1.5 rounded-lg border bg-background/60 px-3 py-3 text-center ${
        count > 0 ? ring : "border-border"
      }`}
    >
      <span className={`font-display text-2xl font-bold leading-none ${count > 0 ? color : "text-text-tertiary"}`}>
        <AnimatedCounter value={count} duration={1000} />
      </span>
      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-text-secondary">
        {index !== undefined && <span className="mr-1 text-text-tertiary">{String(index + 1).padStart(2, "0")}</span>}
        {label}
      </span>
    </div>
  );
}

/**
 * Aggregate idea pipeline: DRAFT → SUBMITTED → UNDER REVIEW → APPROVED, with
 * REJECTED ↕ UNDER REVIEW. Counts come from the dashboard API responses.
 */
export default function PipelineFlow({ counts }: { counts: PipelineCounts }) {
  const values = STAGES.map((s) => counts[s.key]);
  const flowing = (i: number) => values[i] > 0 || values[i + 1] > 0;
  const rejectedActive = counts.rejected > 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-tertiary">
          IDEA_PIPELINE
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Desktop / tablet: horizontal */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-x-2">
          {STAGES.map((s, i) => (
            <div key={s.key} className="contents">
              <Node label={s.label} count={values[i]} color={s.color} ring={s.ring} index={i} />
              {i < STAGES.length - 1 && (
                <FlowConnector className="w-6 lg:w-10" lit={values[i] > 0} flow={flowing(i)} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-x-2">
          <div className="col-start-5 flex flex-col items-center">
            <FlowConnector direction="v" className="h-6" lit={rejectedActive} flow={rejectedActive} tone="danger" />
            <span className="my-1 font-mono text-[10px] text-text-tertiary" aria-hidden="true">↕</span>
            <FlowConnector direction="v" className="h-3" lit={rejectedActive} />
          </div>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-x-2">
          <div className="col-start-5">
            <Node
              label="Rejected"
              count={counts.rejected}
              color="text-status-rejected"
              ring="border-status-rejected/40"
            />
          </div>
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col items-stretch sm:hidden">
        {STAGES.map((s, i) => (
          <div key={s.key} className="flex flex-col items-center">
            <div className="w-full">
              <Node label={s.label} count={values[i]} color={s.color} ring={s.ring} index={i} />
            </div>
            {i < STAGES.length - 1 && (
              <FlowConnector direction="v" className="h-5" lit={values[i] > 0} flow={flowing(i)} />
            )}
          </div>
        ))}
        <div className="flex flex-col items-center">
          <FlowConnector direction="v" className="mt-3 h-4" lit={rejectedActive} flow={rejectedActive} tone="danger" />
          <span className="my-1 font-mono text-[10px] text-text-tertiary" aria-hidden="true">
            ↕ UNDER REVIEW
          </span>
          <div className="w-full">
            <Node label="Rejected" count={counts.rejected} color="text-status-rejected" ring="border-status-rejected/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
