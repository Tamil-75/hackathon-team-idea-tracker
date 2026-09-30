import type { LucideIcon } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  accent?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent = false,
}: StatCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-border-strong hover:bg-surface-elevated">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg p-2.5 transition-colors ${
            accent
              ? "bg-accent/10 text-accent"
              : "bg-surface-hover text-text-secondary group-hover:text-accent"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-2xl font-bold tracking-tight text-text-primary">
            <AnimatedCounter value={value} duration={1100} />
          </p>
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
            {title}
          </p>
        </div>
      </div>
      {description && (
        <p className="mt-2 text-xs text-text-tertiary">{description}</p>
      )}
    </div>
  );
}
