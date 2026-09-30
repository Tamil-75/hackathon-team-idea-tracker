import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createIdea } from "../../api/ideas";
import { getStudentDashboard } from "../../api/dashboard";
import type { StudentDashboardResponse } from "../../types";
import Toast from "../../components/Toast";
import PageHeader from "../../components/PageHeader";
import FormField from "../../components/FormField";

export default function CreateIdea() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [category, setCategory] = useState("");
  const [technologyStack, setTechnologyStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [userTeam, setUserTeam] = useState<StudentDashboardResponse["team"]>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const dashboard = await getStudentDashboard();
        setUserTeam(dashboard.team);
      } catch {
        // Ignore
      }
    };
    fetchTeam();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || title.length < 3 || title.length > 100) {
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

    setLoading(true);

    try {
      const idea = await createIdea({
        title: title.trim(),
        description: description.trim(),
        problem_statement: problemStatement.trim(),
        proposed_solution: proposedSolution.trim(),
        category: category.trim(),
        technology_stack: technologyStack.trim(),
        github_url: githubUrl.trim() || undefined,
        team_id: teamId === "" ? null : teamId,
      });
      setToast({ message: "Idea created successfully!", type: "success" });
      setTimeout(() => {
        navigate(`/ideas/${idea.id}`, { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to create idea.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

      <PageHeader
        title="Create Idea"
        subtitle="Submit a new project idea for the hackathon"
      />

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
              placeholder="Enter idea title"
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
              placeholder="Brief description of your idea"
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
              placeholder="What problem does your idea solve?"
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
              placeholder="How does your idea solve the problem?"
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
                placeholder="e.g., Healthcare, AI, Blockchain"
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
                placeholder="e.g., Python, React, TensorFlow"
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
                You are not part of a team. You can create one later.
              </p>
            )}
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/ideas")}
              className="flex-1 rounded-lg border border-border py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-accent py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Idea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
