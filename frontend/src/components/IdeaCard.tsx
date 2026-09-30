import { Link } from "react-router-dom";
import { Calendar, Tag, Users, ArrowRight } from "lucide-react";
import type { Idea, StudentDashboardIdea, IdeaStatus } from "../types";
import StatusBadge from "./StatusBadge";

interface IdeaCardProps {
  idea: Idea | StudentDashboardIdea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const isFullIdea = "description" in idea;

  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-border-strong hover:bg-surface-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-text-primary">
            {idea.title}
          </h3>
          {isFullIdea && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
              {idea.description}
            </p>
          )}
        </div>
        <StatusBadge status={idea.status as IdeaStatus} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <Tag className="h-3 w-3" />
          {idea.category}
        </span>
        {isFullIdea && idea.technology_stack && (
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-3 w-3" />
            {idea.technology_stack}
          </span>
        )}
        {idea.team_name && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {idea.team_name}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {new Date(idea.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4">
        <Link
          to={`/ideas/${idea.id}`}
          className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wider text-accent transition-colors hover:text-accent-hover"
        >
          View Idea
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
