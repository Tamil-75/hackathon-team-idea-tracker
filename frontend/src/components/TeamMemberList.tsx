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
      <p className="text-sm text-gray-500">No members in this team.</p>
    );
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {member.name}
                {member.user_id === currentUserId && (
                  <span className="ml-2 text-xs text-gray-500">(You)</span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {member.register_number}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            Joined {new Date(member.joined_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
