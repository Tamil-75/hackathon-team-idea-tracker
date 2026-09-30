import { Users, Crown } from "lucide-react";
import type { Team } from "../types";

interface TeamCardProps {
  team: Team;
  onJoin?: (id: number) => void;
  isAlreadyInTeam?: boolean;
  joining?: boolean;
}

export default function TeamCard({
  team,
  onJoin,
  isAlreadyInTeam = false,
  joining = false,
}: TeamCardProps) {
  const isFull = team.available_slots <= 0;
  const canJoin = !isFull && !isAlreadyInTeam;

  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-border-strong hover:bg-surface-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold text-text-primary">
            {team.name}
          </h3>
          {team.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
              {team.description}
            </p>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-hover px-2.5 py-0.5 font-mono text-[10px] font-medium text-text-secondary">
          <Crown className="h-3 w-3 text-accent" />
          {team.leader_name}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {team.member_count}/{team.max_members}
        </span>
        <span>
          {team.available_slots > 0
            ? `${team.available_slots} slots available`
            : "Team Full"}
        </span>
      </div>

      {onJoin && (
        <div className="mt-4">
          <button
            onClick={() => onJoin(team.id)}
            disabled={!canJoin || joining}
            className="w-full rounded-lg bg-accent py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {joining
              ? "Joining..."
              : isAlreadyInTeam
                ? "Already in a Team"
                : isFull
                  ? "Team Full"
                  : "Join Team"}
          </button>
        </div>
      )}
    </div>
  );
}
