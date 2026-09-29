import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeam } from "../../api/teams";
import TeamForm from "../../components/TeamForm";
import Toast from "../../components/Toast";

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

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Team</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new team and invite others to join
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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
