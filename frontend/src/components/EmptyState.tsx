import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-10 text-center">
      <div className="mb-4 rounded-full bg-surface-hover p-3.5">
        <Icon className="h-6 w-6 text-text-tertiary" />
      </div>
      <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-text-tertiary">
          {description}
        </p>
      )}
    </div>
  );
}
