import { useState, useEffect, useCallback } from "react";
import { Search, Lightbulb, RefreshCw, Filter } from "lucide-react";
import { getAdminIdeas, updateIdeaStatus } from "../../api/admin";
import type { AdminIdeaResponse, IdeaStatus } from "../../types";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Toast from "../../components/Toast";

export default function ManageIdeas() {
  const [ideas, setIdeas] = useState<AdminIdeaResponse[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<AdminIdeaResponse[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    idea: AdminIdeaResponse;
    newStatus: IdeaStatus;
    message: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminIdeas();
      setIdeas(data);
      applyFilters(data, search, statusFilter, categoryFilter);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load ideas.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const applyFilters = (
    data: AdminIdeaResponse[],
    searchQuery: string,
    status: IdeaStatus | "",
    category: string
  ) => {
    let result = data;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.creator_name.toLowerCase().includes(query) ||
          idea.category.toLowerCase().includes(query)
      );
    }

    if (status) {
      result = result.filter((idea) => idea.status === status);
    }

    if (category.trim()) {
      const query = category.toLowerCase();
      result = result.filter((idea) => idea.category.toLowerCase().includes(query));
    }

    setFilteredIdeas(result);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(ideas, search, statusFilter, categoryFilter);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setCategoryFilter("");
    setFilteredIdeas(ideas);
  };

  const handleStatusUpdate = async () => {
    if (!confirmAction) return;

    setActionLoading(true);
    try {
      await updateIdeaStatus(confirmAction.idea.id, confirmAction.newStatus);
      setToast({ message: confirmAction.message, type: "success" });
      await fetchIdeas();
      setConfirmAction(null);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to update idea status.";
      setToast({ message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusActions = (idea: AdminIdeaResponse) => {
    switch (idea.status) {
      case "Submitted":
        return [
          {
            label: "Start Review",
            newStatus: "Under Review" as IdeaStatus,
            message: "Idea moved to Under Review.",
            variant: "primary" as const,
          },
        ];
      case "Under Review":
        return [
          {
            label: "Approve",
            newStatus: "Approved" as IdeaStatus,
            message: "Idea approved successfully.",
            variant: "primary" as const,
          },
          {
            label: "Reject",
            newStatus: "Rejected" as IdeaStatus,
            message: "Idea rejected.",
            variant: "danger" as const,
          },
        ];
      case "Rejected":
        return [
          {
            label: "Reopen Review",
            newStatus: "Under Review" as IdeaStatus,
            message: "Idea reopened for review.",
            variant: "primary" as const,
          },
        ];
      default:
        return [];
    }
  };

  const hasFilters = search || statusFilter || categoryFilter;

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmAction}
        title="Confirm Action"
        message={
          confirmAction
            ? `Are you sure you want to ${confirmAction.newStatus === "Under Review" && confirmAction.idea.status === "Submitted" ? "move this idea to Under Review" : confirmAction.newStatus === "Approved" ? "approve this idea" : confirmAction.newStatus === "Rejected" ? "reject this idea" : "reopen this idea for review"}?`
            : ""
        }
        confirmLabel={confirmAction?.newStatus || "Confirm"}
        onConfirm={handleStatusUpdate}
        onCancel={() => setConfirmAction(null)}
        loading={actionLoading}
        variant={confirmAction?.newStatus === "Rejected" ? "danger" : "primary"}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Ideas</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage all submitted ideas
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ideas..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IdeaStatus | "")}
              className="rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter by category..."
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>
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
            onClick={fetchIdeas}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={hasFilters ? "No ideas match your filters." : "No ideas found."}
          description={hasFilters ? "Try adjusting your search or filters." : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => {
            const actions = getStatusActions(idea);
            return (
              <div
                key={idea.id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {idea.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {idea.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>By: {idea.creator_name}</span>
                      <span>Category: {idea.category}</span>
                      {idea.team_name && <span>Team: {idea.team_name}</span>}
                      <span>
                        Created: {new Date(idea.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={idea.status} />
                </div>

                {actions.length > 0 && (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() =>
                          setConfirmAction({
                            idea,
                            newStatus: action.newStatus,
                            message: action.message,
                          })
                        }
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                          action.variant === "danger"
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "bg-primary-600 text-white hover:bg-primary-700"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
