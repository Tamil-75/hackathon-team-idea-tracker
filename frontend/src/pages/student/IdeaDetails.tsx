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
import WorkflowTracker from "../../components/WorkflowTracker";
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
        <p className="text-sm text-status-rejected">{error || "Idea not found."}</p>
        <Link
          to="/ideas"
          className="rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
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
          className="rounded-lg border border-border p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">{idea.title}</h1>
        </div>
        <StatusBadge status={idea.status} />
      </div>

      {/* Actions */}
      {(canEdit || canSubmit || canDelete) && (
        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/ideas/${ideaId}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}
          {canSubmit && (
            <button
              onClick={() => setShowSubmitDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-status-rejected/20 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-status-rejected hover:bg-status-rejected/5"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Workflow Tracker */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <WorkflowTracker status={idea.status} />
      </div>

      {/* Details */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{idea.description}</p>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Problem Statement</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{idea.problem_statement}</p>
          </div>

          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Proposed Solution</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{idea.proposed_solution}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Category</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-primary">
                <Tag className="h-4 w-4 text-text-tertiary" />
                {idea.category}
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Technology Stack</h3>
              <p className="mt-1 text-sm text-text-primary">{idea.technology_stack || "Not specified"}</p>
            </div>
          </div>

          {idea.github_url && (
            <div>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">GitHub Repository</h3>
              <a
                href={idea.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover"
              >
                <Github className="h-4 w-4" />
                {idea.github_url}
              </a>
            </div>
          )}

          {idea.team_name && (
            <div>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Team</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-primary">
                <Users className="h-4 w-4 text-text-tertiary" />
                {idea.team_name}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Created</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-primary">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                {new Date(idea.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Updated</h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-primary">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                {new Date(idea.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
