import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  User,
  ArrowRight,
} from "lucide-react";
import { getStudentDashboard } from "../../api/dashboard";
import type { StudentDashboardResponse } from "../../types";
import IdeaCard from "../../components/IdeaCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getStudentDashboard();
      setData(result);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Unable to load your dashboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Ideas", value: data.idea_statistics.total, icon: Lightbulb, color: "text-primary-600 bg-primary-50" },
    { label: "Draft", value: data.idea_statistics.draft, icon: FileText, color: "text-gray-600 bg-gray-100" },
    { label: "Submitted", value: data.idea_statistics.submitted, icon: Clock, color: "text-blue-600 bg-blue-50" },
    { label: "Under Review", value: data.idea_statistics.under_review, icon: AlertCircle, color: "text-yellow-600 bg-yellow-50" },
    { label: "Approved", value: data.idea_statistics.approved, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "Rejected", value: data.idea_statistics.rejected, icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {data.user.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <User className="h-4 w-4" />
            {data.user.register_number}
          </span>
          <span>{data.user.email}</span>
        </div>
      </div>

      {/* Team Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">My Team</h2>
        {data.team ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  {data.team.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {data.team.description}
                </p>
              </div>
              {data.is_team_leader && (
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  Leader
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Leader: {data.team.leader_name}</span>
              <span>Members: {data.team.member_count}/{data.team.max_members}</span>
              <span>Available Slots: {data.team.available_slots}</span>
            </div>
            <Link
              to={`/teams/${data.team.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <EmptyState
              icon={Users}
              title="You are not part of a team yet."
              description="Join a team to start collaborating on projects."
            />
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Find a Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Idea Statistics */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Idea Statistics
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className={`mb-2 inline-flex rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ideas */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Ideas</h2>
          <div className="flex gap-2">
            <Link
              to="/ideas"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View All Ideas
            </Link>
            <Link
              to="/ideas/create"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Create Idea
            </Link>
          </div>
        </div>
        {data.recent_ideas.length > 0 ? (
          <div className="space-y-3">
            {data.recent_ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="No ideas yet."
            description="Create your first project idea to get started."
          />
        )}
      </div>
    </div>
  );
}
