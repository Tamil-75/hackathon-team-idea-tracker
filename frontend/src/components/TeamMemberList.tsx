import { User } from "lucide-react";
import type { TeamMember } from "../types";

interface TeamMemberListProps {
  members: TeamMember[];
  currentUserId?: number;
}

export default function TeamMemberList({
  members,
  currentUserId,
}: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <p className="font-mono text-[11px] text-text-tertiary">No members in this team.</p>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-border-strong"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
              <User className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {member.name}
                {member.user_id === currentUserId && (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-accent">
                    (You)
                  </span>
                )}
              </p>
              <p className="font-mono text-[11px] text-text-tertiary">
                {member.register_number}
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] text-text-tertiary">
            Joined {new Date(member.joined_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
