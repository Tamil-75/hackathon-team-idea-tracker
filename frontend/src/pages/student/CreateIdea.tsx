import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createIdea } from "../../api/ideas";
import { getStudentDashboard } from "../../api/dashboard";
import type { StudentDashboardResponse } from "../../types";
import Toast from "../../components/Toast";

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
        // Ignore - user might not have team
      }
    };
    fetchTeam();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Idea</h1>
        <p className="mt-1 text-sm text-gray-600">
          Submit a new project idea for the hackathon
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter idea title"
            />
            <p className="mt-1 text-xs text-gray-500">{title.length}/150</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Brief description of your idea"
            />
            <p className="mt-1 text-xs text-gray-500">{description.length}/2000</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Problem Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="What problem does your idea solve?"
            />
            <p className="mt-1 text-xs text-gray-500">{problemStatement.length}/2000</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Proposed Solution <span className="text-red-500">*</span>
            </label>
            <textarea
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              maxLength={2000}
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="How does your idea solve the problem?"
            />
            <p className="mt-1 text-xs text-gray-500">{proposedSolution.length}/2000</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g., Healthcare, AI, Blockchain"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Technology Stack <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={technologyStack}
                onChange={(e) => setTechnologyStack(e.target.value)}
                maxLength={255}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="e.g., Python, React, TensorFlow"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="https://github.com/username/repository"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Team
            </label>
            {userTeam ? (
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="">No team</option>
                <option value={userTeam.id}>{userTeam.name}</option>
              </select>
            ) : (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                You are not part of a team. You can create one later.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/ideas")}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Idea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
