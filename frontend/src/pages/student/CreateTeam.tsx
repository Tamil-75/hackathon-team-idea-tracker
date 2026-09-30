import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeam } from "../../api/teams";
import TeamForm from "../../components/TeamForm";
import Toast from "../../components/Toast";
import PageHeader from "../../components/PageHeader";

export default function CreateTeam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (data: { name: string; description?: string; max_members: number }) => {
    setLoading(true);
    setError("");

    try {
      const team = await createTeam(data);
      setToast({ message: "Team created successfully!", type: "success" });
      setTimeout(() => {
        navigate(`/teams/${team.id}`, { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to create team.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Create Team"
        subtitle="Create a new team and invite others to join"
      />

      <div className="rounded-xl border border-border bg-surface p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-status-rejected/20 bg-status-rejected/5 px-4 py-3 text-sm text-status-rejected">
            {error}
          </div>
        )}
        <TeamForm
          onSubmit={handleSubmit}
          submitLabel="Create Team"
          loading={loading}
        />
      </div>
    </div>
  );
}
