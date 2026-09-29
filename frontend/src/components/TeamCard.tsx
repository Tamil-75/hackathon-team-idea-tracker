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
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{team.name}</h3>
          {team.description && (
            <p className="mt-1 text-sm text-gray-600">{team.description}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
          <Crown className="h-3 w-3" />
          {team.leader_name}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1">
          <Users className="h-4 w-4" />
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
            className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
