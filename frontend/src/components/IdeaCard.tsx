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
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {idea.title}
          </h3>
          {isFullIdea && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
              {idea.description}
            </p>
          )}
        </div>
        <StatusBadge status={idea.status as IdeaStatus} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" />
          {idea.category}
        </span>
        {isFullIdea && idea.technology_stack && (
          <span className="inline-flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {idea.technology_stack}
          </span>
        )}
        {idea.team_name && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {idea.team_name}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(idea.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4">
        <Link
          to={`/ideas/${idea.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View Idea
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
