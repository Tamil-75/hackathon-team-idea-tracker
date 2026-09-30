import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getIdea, updateIdea } from "../../api/ideas";
import { getStudentDashboard } from "../../api/dashboard";
import type { Idea, StudentDashboardResponse } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import Toast from "../../components/Toast";
import FormField from "../../components/FormField";

export default function EditIdea() {
  const { id } = useParams<{ id: string }>();
  const ideaId = parseInt(id || "0", 10);
  const navigate = useNavigate();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [category, setCategory] = useState("");
  const [technologyStack, setTechnologyStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [userTeam, setUserTeam] = useState<StudentDashboardResponse["team"]>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const editableStatuses = ["Draft", "Rejected"];
  const isEditable = idea && editableStatuses.includes(idea.status);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [ideaData, dashboard] = await Promise.all([
          getIdea(ideaId),
          getStudentDashboard(),
        ]);
        setIdea(ideaData);
        setTitle(ideaData.title);
        setDescription(ideaData.description);
        setProblemStatement(ideaData.problem_statement);
        setProposedSolution(ideaData.proposed_solution);
        setCategory(ideaData.category);
        setTechnologyStack(ideaData.technology_stack || "");
        setGithubUrl(ideaData.github_url || "");
        setTeamId(ideaData.team_id || "");
        setUserTeam(dashboard.team);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail || "Failed to load idea.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ideaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || title.length < 3 || title.length > 150) {
      setError("Title must be 3-150 characters.");
      return;
    }
    if (!description.trim() || description.length > 2000) {
      setError("Description is required and must be under 2000 characters.");
      return;
    }
    if (!problemStatement.trim() || problemStatement.length > 2000) {
      setError("Problem statement is required and must be under 2000 characters.");
      return;
    }
    if (!proposedSolution.trim() || proposedSolution.length > 2000) {
      setError("Proposed solution is required and must be under 2000 characters.");
      return;
    }
    if (!category.trim() || category.length > 100) {
      setError("Category is required and must be under 100 characters.");
      return;
    }
    if (!technologyStack.trim() || technologyStack.length > 255) {
      setError("Technology stack is required and must be under 255 characters.");
      return;
    }
    if (githubUrl && !githubUrl.match(/^https?:\/\/(www\.)?github\.com\/[\w\-]+\/[\w\-]+\/?$/)) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setSaving(true);

    try {
      await updateIdea(ideaId, {
        title: title.trim(),
        description: description.trim(),
        problem_statement: problemStatement.trim(),
        proposed_solution: proposedSolution.trim(),
        category: category.trim(),
        technology_stack: technologyStack.trim(),
        github_url: githubUrl.trim() || null,
        team_id: teamId === "" ? null : teamId,
      });
      setToast({ message: "Idea updated successfully!", type: "success" });
      setTimeout(() => {
        navigate(`/ideas/${ideaId}`, { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to update idea.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !idea) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-status-rejected">{error}</p>
        <Link
          to="/ideas"
          className="rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
        >
          Back to Ideas
        </Link>
      </div>
    );
  }

  if (!isEditable) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-status-review" />
        <p className="text-sm text-text-secondary">
          This idea cannot be edited in its current status ({idea?.status}).
        </p>
        <Link
          to={`/ideas/${ideaId}`}
          className="rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
        >
          Back to Idea
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center gap-4">
        <Link
          to={`/ideas/${ideaId}`}
          className="rounded-lg border border-border p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">Edit Idea</h1>
          <p className="mt-1 text-sm text-text-secondary">Update your project idea</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-status-rejected/20 bg-status-rejected/5 px-4 py-3 text-sm text-status-rejected">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Title" required hint={`${title.length}/150`}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              className={inputClass}
            />
          </FormField>

          <FormField label="Description" required hint={`${description.length}/2000`}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              className={inputClass}
            />
          </FormField>

          <FormField label="Problem Statement" required hint={`${problemStatement.length}/2000`}>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              className={inputClass}
            />
          </FormField>

          <FormField label="Proposed Solution" required hint={`${proposedSolution.length}/2000`}>
            <textarea
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              className={inputClass}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Category" required>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={100}
                required
                className={inputClass}
              />
            </FormField>

            <FormField label="Technology Stack" required>
              <input
                type="text"
                value={technologyStack}
                onChange={(e) => setTechnologyStack(e.target.value)}
                maxLength={255}
                required
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="GitHub URL">
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className={inputClass}
              placeholder="https://github.com/username/repository"
            />
          </FormField>

          <FormField label="Team">
            {userTeam ? (
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value ? parseInt(e.target.value, 10) : "")}
                className={inputClass}
              >
                <option value="">No team</option>
                <option value={userTeam.id}>{userTeam.name}</option>
              </select>
            ) : (
              <p className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-tertiary">
                You are not part of a team.
              </p>
            )}
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/ideas/${ideaId}`)}
              className="flex-1 rounded-lg border border-border py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-accent py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
