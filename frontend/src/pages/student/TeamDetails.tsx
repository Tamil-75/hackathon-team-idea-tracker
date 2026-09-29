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
        <p className="text-sm text-red-600">{error || "Team not found."}</p>
        <Link
          to="/teams"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
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
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          {team.description && (
            <p className="mt-1 text-sm text-gray-600">{team.description}</p>
          )}
        </div>
        {isLeader && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
        {isMember && !isLeader && (
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Leave Team
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Crown className="h-4 w-4" />
            <span className="text-xs">Leader</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {team.leader_name}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-xs">Members</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {team.member_count}/{team.max_members}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-xs">Available Slots</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {team.available_slots}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Created</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {new Date(team.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditing && isLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
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

      {/* Members */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Team Members ({team.member_count})
        </h2>
        <TeamMemberList members={team.members} currentUserId={user?.id} />
      </div>
    </div>
  );
}
