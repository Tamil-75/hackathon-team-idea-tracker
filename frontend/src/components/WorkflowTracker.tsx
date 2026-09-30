import type { IdeaStatus } from "../types";
import FlowConnector from "./FlowConnector";

interface WorkflowTrackerProps {
  status: IdeaStatus;
}

const workflowSteps = [
  { key: "Draft", label: "DRAFT" },
  { key: "Submitted", label: "SUBMITTED" },
  { key: "Under Review", label: "UNDER REVIEW" },
  { key: "Approved", label: "APPROVED" },
];

/**
 * Single-idea pipeline. Mirrors the backend workflow exactly:
 * Draft → Submitted → Under Review → Approved | Rejected,
 * with Rejected ↔ Under Review (admin can reopen).
 */
export default function WorkflowTracker({ status }: WorkflowTrackerProps) {
  const isRejected = status === "Rejected";
  // A rejected idea has travelled through Draft → Submitted → Under Review.
  const currentIndex = isRejected ? 2 : workflowSteps.findIndex((s) => s.key === status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
          Workflow
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-start">
        {workflowSteps.map((step, index) => {
          const isCompleted = isRejected ? index <= 2 : index < currentIndex;
          const isCurrent = !isRejected && index === currentIndex;
          const isReviewAndRejected = isRejected && index === 2;
          const isFuture = !isCompleted && !isCurrent;

          return (
            <div key={step.key} className="contents">
              <div className="flex w-14 flex-col items-center gap-2 sm:w-20">
                <div className="relative">
                  {isCurrent && (
                    <span className="team-ring absolute inset-0 rounded-full border border-accent/60" aria-hidden="true" />
                  )}
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[10px] font-semibold transition-all ${
                      isCurrent
                        ? "border-accent bg-accent/10 text-accent shadow-[0_0_14px_rgba(59,130,246,0.4)]"
                        : isCompleted
                          ? "border-accent/40 bg-accent-subtle text-accent"
                          : "border-border bg-surface text-text-tertiary"
                    }`}
                  >
                    {isCompleted && !isReviewAndRejected ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </div>
                </div>
                <span
                  className={`text-center font-mono text-[8px] font-medium uppercase leading-tight tracking-wider sm:text-[9px] ${
                    isCurrent ? "text-accent" : isFuture ? "text-text-tertiary" : "text-text-secondary"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < workflowSteps.length - 1 && (
                <div className="mt-4 px-1">
                  <FlowConnector
                    lit={index < currentIndex}
                    flow={!isRejected && index === currentIndex - 1}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rejected branch: REJECTED ↕ UNDER REVIEW */}
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-start">
        <div className="col-start-5 flex w-14 flex-col items-center sm:w-20">
          <FlowConnector direction="v" className="h-5" lit={isRejected} flow={isRejected} tone="danger" />
          <span className="my-0.5 font-mono text-[10px] text-text-tertiary" aria-hidden="true">↕</span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[10px] font-semibold ${
              isRejected
                ? "border-status-rejected bg-status-rejected/10 text-status-rejected shadow-[0_0_14px_rgba(239,68,68,0.35)]"
                : "border-border bg-surface text-text-tertiary"
            }`}
          >
            ✕
          </div>
          <span
            className={`mt-2 text-center font-mono text-[8px] font-medium uppercase tracking-wider sm:text-[9px] ${
              isRejected ? "text-status-rejected" : "text-text-tertiary"
            }`}
          >
            REJECTED
          </span>
        </div>
      </div>

      {isRejected && (
        <div className="flex items-center gap-2 rounded-lg border border-status-rejected/20 bg-status-rejected/5 px-3 py-2">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-rejected" />
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-status-rejected">
            Rejected — can be reopened for review
          </span>
        </div>
      )}
    </div>
  );
}
