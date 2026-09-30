import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Users, RefreshCw, ArrowRight } from "lucide-react";
import { getAdminTeams } from "../../api/admin";
import type { AdminTeamResponse } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";

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

  const inputClass =
    "w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Teams"
        subtitle="View all registered teams"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by team name, description, or leader..."
          className={inputClass}
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-sm text-status-rejected">{error}</p>
          <button
            onClick={fetchTeams}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
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
              className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-border-strong hover:bg-surface-elevated"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-base font-semibold text-text-primary">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {team.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-tertiary">
                <span>Leader: {team.leader_name}</span>
                <span>Members: {team.member_count}/{team.max_members}</span>
                <span>Slots: {team.available_slots}</span>
              </div>
              <p className="mt-2 font-mono text-[10px] text-text-tertiary">
                Created {new Date(team.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
