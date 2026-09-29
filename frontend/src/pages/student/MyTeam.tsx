import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Plus, ArrowRight } from "lucide-react";
import { getStudentDashboard } from "../../api/dashboard";
import type { StudentDashboardResponse } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function MyTeam() {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getStudentDashboard();
        setData(result);
        // If user has a team, redirect to team details
        if (result.team) {
          navigate(`/teams/${result.team.id}`, { replace: true });
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) return null;

  // If no team, show empty state with options
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your team
        </p>
      </div>

      <EmptyState
        icon={Users}
        title="You are not part of a team yet."
        description="Join an existing team or create your own to start collaborating."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/teams"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Users className="h-4 w-4" />
          Find a Team
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/teams/create"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Create a Team
        </Link>
      </div>
    </div>
  );
}
