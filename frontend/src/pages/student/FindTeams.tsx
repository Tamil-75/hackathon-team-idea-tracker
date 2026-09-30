import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Users } from "lucide-react";
import { getTeams, joinTeam } from "../../api/teams";
import { getStudentDashboard } from "../../api/dashboard";
import type { Team } from "../../types";
import TeamCard from "../../components/TeamCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Toast from "../../components/Toast";
import PageHeader from "../../components/PageHeader";

export default function FindTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isInTeam, setIsInTeam] = useState(false);
  const navigate = useNavigate();

  const fetchTeams = useCallback(async (query?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeams(query);
      setTeams(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load teams.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserTeamStatus = useCallback(async () => {
    try {
      const dashboard = await getStudentDashboard();
      setIsInTeam(dashboard.team !== null);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchUserTeamStatus();
  }, [fetchTeams, fetchUserTeamStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeams(search.trim() || undefined);
  };

  const handleClearSearch = () => {
    setSearch("");
    fetchTeams();
  };

  const handleJoin = async (teamId: number) => {
    setJoiningId(teamId);
    setToast(null);

    try {
      await joinTeam(teamId);
      setToast({ message: "Successfully joined the team!", type: "success" });
      await fetchTeams(search.trim() || undefined);
      await fetchUserTeamStatus();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to join team.";
      setToast({ message, type: "error" });
    } finally {
      setJoiningId(null);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors";

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Find Teams"
        subtitle="Browse and join available teams"
        actions={
          <button
            onClick={() => navigate("/teams/create")}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </button>
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name..."
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="rounded-lg border border-border px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-sm text-status-rejected">{error}</p>
          <button
            onClick={() => fetchTeams(search.trim() || undefined)}
            className="rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
          >
            Try Again
          </button>
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No teams found." : "No teams available yet."}
          description={
            search
              ? "Try a different search term."
              : "Be the first to create a team!"
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onJoin={handleJoin}
              isAlreadyInTeam={isInTeam}
              joining={joiningId === team.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
