import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Plus, ArrowRight } from "lucide-react";
import { getStudentDashboard } from "../../api/dashboard";
import type { StudentDashboardResponse } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Team"
        subtitle="View and manage your team"
      />

      <EmptyState
        icon={Users}
        title="You are not part of a team yet."
        description="Join an existing team or create your own to start collaborating."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/teams"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
        >
          <Users className="h-4 w-4" />
          Find a Team
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/teams/create"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <Plus className="h-4 w-4" />
          Create a Team
        </Link>
      </div>
    </div>
  );
}
