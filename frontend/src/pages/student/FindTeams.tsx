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
      // Ignore - user might not have team
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

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Teams</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and join available teams
          </p>
        </div>
        <button
          onClick={() => navigate("/teams/create")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Create Team
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </form>

      {/* Team List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => fetchTeams(search.trim() || undefined)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
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
