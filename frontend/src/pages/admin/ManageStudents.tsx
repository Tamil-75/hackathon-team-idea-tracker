import { useState, useEffect, useCallback } from "react";
import { Search, Users, RefreshCw } from "lucide-react";
import { getAdminUsers } from "../../api/admin";
import type { AdminUserResponse } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";

export default function ManageStudents() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load users.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }
    const query = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.register_number.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
    );
  }, [search, users]);

  const inputClass =
    "w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Students"
        subtitle="View all registered users"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, register number, or email..."
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
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No users match your search." : "No users found."}
          description={search ? "Try a different search term." : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                {["Name", "Register Number", "Email", "Role", "Team", "Created"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-text-tertiary"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-surface-hover">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">
                    {user.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-text-secondary">
                    {user.register_number}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${
                        user.role === "admin"
                          ? "border-accent/20 bg-accent/10 text-accent"
                          : "border-border bg-surface-hover text-text-secondary"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {user.team_name || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-text-tertiary">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
