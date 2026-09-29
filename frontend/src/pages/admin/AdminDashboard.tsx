import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  ArrowRight,
} from "lucide-react";
import { getAdminDashboard } from "../../api/admin";
import type { AdminDashboardResponse } from "../../types";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminDashboard();
      setData(result);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to load dashboard.";
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

  if (error || !data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error || "Failed to load dashboard."}</p>
        <button
          onClick={fetchDashboard}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    { title: "Total Students", value: data.total_students, icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Total Admins", value: data.total_admins, icon: Shield, color: "text-purple-600 bg-purple-50" },
    { title: "Total Teams", value: data.total_teams, icon: Users, color: "text-green-600 bg-green-50" },
    { title: "Total Ideas", value: data.total_ideas, icon: Lightbulb, color: "text-yellow-600 bg-yellow-50" },
    { title: "Students in Teams", value: data.students_in_teams, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
    { title: "Students without Teams", value: data.students_without_team, icon: UserX, color: "text-orange-600 bg-orange-50" },
    { title: "Teams with Ideas", value: data.teams_with_ideas, icon: CheckCircle, color: "text-teal-600 bg-teal-50" },
    { title: "Teams without Ideas", value: data.teams_without_ideas, icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  const ideaStats = [
    { title: "Draft", value: data.draft_ideas, icon: FileText, color: "text-gray-600 bg-gray-100" },
    { title: "Submitted", value: data.submitted_ideas, icon: Clock, color: "text-blue-600 bg-blue-50" },
    { title: "Under Review", value: data.under_review_ideas, icon: AlertCircle, color: "text-yellow-600 bg-yellow-50" },
    { title: "Approved", value: data.approved_ideas, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { title: "Rejected", value: data.rejected_ideas, icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          System overview and management
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/students"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Manage Students</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link
          to="/admin/teams"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Manage Teams</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link
          to="/admin/ideas"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Manage Ideas</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
      </div>

      {/* Main Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </div>

      {/* Idea Status Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Idea Status</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {ideaStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Ideas */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Ideas</h3>
            <Link
              to="/admin/ideas"
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_ideas.slice(0, 5).map((idea) => (
              <div key={idea.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {idea.title}
                  </p>
                  <p className="text-xs text-gray-500">{idea.creator_name}</p>
                </div>
                <StatusBadge status={idea.status as "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected"} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Teams */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Teams</h3>
            <Link
              to="/admin/teams"
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_teams.slice(0, 5).map((team) => (
              <div key={team.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {team.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {team.leader_name} • {team.member_count}/{team.max_members}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Users</h3>
            <Link
              to="/admin/students"
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.register_number}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
