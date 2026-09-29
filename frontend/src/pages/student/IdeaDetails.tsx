import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Users,
  Github,
  Edit,
  Send,
  Trash2,
} from "lucide-react";
import { getIdea, deleteIdea, submitIdea } from "../../api/ideas";
import type { Idea } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";

export default function IdeaDetails() {
  const { id } = useParams<{ id: string }>();
  const ideaId = parseInt(id || "0", 10);
  const navigate = useNavigate();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchIdea = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getIdea(ideaId);
      setIdea(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load idea.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteIdea(ideaId);
      setToast({ message: "Idea deleted successfully!", type: "success" });
      setTimeout(() => {
        navigate("/ideas", { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to delete idea.";
      setToast({ message, type: "error" });
      setShowDeleteDialog(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      await submitIdea(ideaId);
      setToast({ message: "Idea submitted for review!", type: "success" });
      await fetchIdea();
      setShowSubmitDialog(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to submit idea.";
      setToast({ message, type: "error" });
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

  if (error || !idea) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error || "Idea not found."}</p>
        <Link
          to="/ideas"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Back to Ideas
        </Link>
      </div>
    );
  }

  const canEdit = ["Draft", "Rejected"].includes(idea.status);
  const canSubmit = ["Draft", "Rejected"].includes(idea.status);
  const canDelete = ["Draft", "Rejected"].includes(idea.status);

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
        title="Delete Idea"
        message="Are you sure you want to delete this idea? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={actionLoading}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showSubmitDialog}
        title="Submit Idea"
        message="Submit this idea for review?"
        confirmLabel="Submit"
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitDialog(false)}
        loading={actionLoading}
        variant="primary"
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/ideas"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
        </div>
        <StatusBadge status={idea.status} />
      </div>

      {/* Actions */}
      {(canEdit || canSubmit || canDelete) && (
        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/ideas/${ideaId}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canSubmit && (
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-sm text-gray-900">{idea.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Problem Statement
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {idea.problem_statement}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Proposed Solution
            </h3>
            <p className="mt-1 text-sm text-gray-900">
              {idea.proposed_solution}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900">
                <Tag className="h-4 w-4" />
                {idea.category}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Technology Stack
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                {idea.technology_stack || "Not specified"}
              </p>
            </div>
          </div>

          {idea.github_url && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                GitHub Repository
              </h3>
              <a
                href={idea.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Github className="h-4 w-4" />
                {idea.github_url}
              </a>
            </div>
          )}

          {idea.team_name && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Team</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900">
                <Users className="h-4 w-4" />
                {idea.team_name}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900">
                <Calendar className="h-4 w-4" />
                {new Date(idea.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Updated</h3>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-gray-900">
                <Calendar className="h-4 w-4" />
                {new Date(idea.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
