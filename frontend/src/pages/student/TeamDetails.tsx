import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  Users,
  Edit,
  Trash2,
  LogOut,
  Calendar,
} from "lucide-react";
import { getTeam, updateTeam, deleteTeam, leaveTeam } from "../../api/teams";
import { useAuth } from "../../contexts/AuthContext";
import type { TeamDetail } from "../../types";
import TeamMemberList from "../../components/TeamMemberList";
import TeamNetwork from "../../components/TeamNetwork";
import TeamForm from "../../components/TeamForm";
import ConfirmDialog from "../../components/ConfirmDialog";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const teamId = parseInt(id || "0", 10);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeam(teamId);
      setTeam(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load team.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const isLeader = team?.leader_id === user?.id;
  const isMember = team?.members.some((m) => m.user_id === user?.id);

  const handleUpdate = async (data: { name: string; description?: string; max_members: number }) => {
    setActionLoading(true);
    try {
      const updated = await updateTeam(teamId, data);
      setTeam(updated);
      setIsEditing(false);
      setToast({ message: "Team updated successfully!", type: "success" });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to update team.";
      setToast({ message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteTeam(teamId);
      setToast({ message: "Team deleted successfully!", type: "success" });
      setTimeout(() => {
        navigate("/teams", { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to delete team.";
      setToast({ message, type: "error" });
      setShowDeleteDialog(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await leaveTeam(teamId);
      setToast({ message: "You have left the team.", type: "success" });
      setTimeout(() => {
        navigate("/teams", { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to leave team.";
      setToast({ message, type: "error" });
      setShowLeaveDialog(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-status-rejected">{error || "Team not found."}</p>
        <Link
          to="/teams"
          className="rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
        >
          Back to Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Team"
        message="Are you sure you want to delete this team? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={actionLoading}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showLeaveDialog}
        title="Leave Team"
        message="Are you sure you want to leave this team?"
        confirmLabel="Leave"
        onConfirm={handleLeave}
        onCancel={() => setShowLeaveDialog(false)}
        loading={actionLoading}
        variant="danger"
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/teams"
          className="rounded-lg border border-border p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">{team.name}</h1>
          {team.description && (
            <p className="mt-1 text-sm text-text-secondary">{team.description}</p>
          )}
        </div>
        {isLeader && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-status-rejected/20 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-status-rejected hover:bg-status-rejected/5"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
        {isMember && !isLeader && (
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-status-rejected/20 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-status-rejected hover:bg-status-rejected/5"
          >
            <LogOut className="h-4 w-4" />
            Leave Team
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Leader", value: team.leader_name, icon: Crown },
          { label: "Members", value: `${team.member_count}/${team.max_members}`, icon: Users },
          { label: "Available Slots", value: String(team.available_slots), icon: Users },
          { label: "Created", value: new Date(team.created_at).toLocaleDateString(), icon: Calendar },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-text-tertiary">
              <stat.icon className="h-4 w-4" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-text-primary">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Edit Form Modal */}
      {isEditing && isLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface-elevated p-6 shadow-2xl">
            <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">
              Edit Team
            </h2>
            <TeamForm
              initialData={{
                name: team.name,
                description: team.description,
                max_members: team.max_members,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
              loading={actionLoading}
            />
          </div>
        </div>
      )}

      {/* Team network */}
      <div className="hud-frame rounded-xl border border-border bg-surface p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-tertiary">
            TEAM_LINK // {team.name}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <TeamNetwork
          teamName={team.name}
          leaderId={team.leader_id}
          members={team.members}
          maxMembers={team.max_members}
          currentUserId={user?.id}
        />
      </div>

      {/* Members */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-text-primary">
          Team Members ({team.member_count})
        </h2>
        <TeamMemberList members={team.members} currentUserId={user?.id} />
      </div>
    </div>
  );
}
