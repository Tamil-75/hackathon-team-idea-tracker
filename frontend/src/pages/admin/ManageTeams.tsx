import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Users, RefreshCw, ArrowRight } from "lucide-react";
import { getAdminTeams } from "../../api/admin";
import type { AdminTeamResponse } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function ManageTeams() {
  const [teams, setTeams] = useState<AdminTeamResponse[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<AdminTeamResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminTeams();
      setTeams(data);
      setFilteredTeams(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load teams.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Local search/filter on returned data
  useEffect(() => {
    if (!search.trim()) {
      setFilteredTeams(teams);
      return;
    }
    const query = search.toLowerCase();
    setFilteredTeams(
      teams.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          team.description.toLowerCase().includes(query) ||
          team.leader_name.toLowerCase().includes(query)
      )
    );
  }, [search, teams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Teams</h1>
        <p className="mt-1 text-sm text-gray-600">
          View all registered teams
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by team name, description, or leader..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchTeams}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No teams match your search." : "No teams found."}
          description={search ? "Try a different search term." : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {team.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Leader: {team.leader_name}</span>
                <span>Members: {team.member_count}/{team.max_members}</span>
                <span>Slots: {team.available_slots}</span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Created {new Date(team.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
