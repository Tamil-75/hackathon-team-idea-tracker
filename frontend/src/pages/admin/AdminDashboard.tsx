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
import SectionHeading from "../../components/SectionHeading";
import SystemStatusBar from "../../components/SystemStatusBar";
import PipelineFlow from "../../components/PipelineFlow";
import AnimatedCounter from "../../components/AnimatedCounter";
import Reveal from "../../components/Reveal";

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
        <p className="text-sm text-status-rejected">{error || "Failed to load dashboard."}</p>
        <button
          onClick={fetchDashboard}
          className="rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    { title: "Total Students", value: data.total_students, icon: Users, accent: true },
    { title: "Total Admins", value: data.total_admins, icon: Shield },
    { title: "Total Teams", value: data.total_teams, icon: Users },
    { title: "Total Ideas", value: data.total_ideas, icon: Lightbulb },
    { title: "Students in Teams", value: data.students_in_teams, icon: UserCheck },
    { title: "Students without Teams", value: data.students_without_team, icon: UserX },
    { title: "Teams with Ideas", value: data.teams_with_ideas, icon: CheckCircle },
    { title: "Teams without Ideas", value: data.teams_without_ideas, icon: XCircle },
  ];

  const ideaStats = [
    { title: "Draft", value: data.draft_ideas, icon: FileText },
    { title: "Submitted", value: data.submitted_ideas, icon: Clock },
    { title: "Under Review", value: data.under_review_ideas, icon: AlertCircle },
    { title: "Approved", value: data.approved_ideas, icon: CheckCircle },
    { title: "Rejected", value: data.rejected_ideas, icon: XCircle },
  ];

  // Ideas awaiting an admin decision: Submitted (not yet picked up) + Under Review.
  const pending = data.submitted_ideas + data.under_review_ideas;
  const controlTiles = [
    { label: "USERS", value: data.total_users, hint: `${data.total_students} students · ${data.total_admins} admins`, alert: false },
    { label: "TEAMS", value: data.total_teams, hint: `${data.teams_with_ideas} with ideas`, alert: false },
    { label: "IDEAS", value: data.total_ideas, hint: `${data.approved_ideas} approved`, alert: false },
    { label: "PENDING REVIEW", value: pending, hint: `${data.submitted_ideas} submitted · ${data.under_review_ideas} under review`, alert: pending > 0 },
  ];

  return (
    <div className="space-y-8">
      <SystemStatusBar
        items={[
          { label: "SYSTEM STATUS", value: "ONLINE", tone: "ok" },
          { label: "TEAM NETWORK", value: data.total_teams > 0 ? "ACTIVE" : "STANDBY", tone: data.total_teams > 0 ? "ok" : "idle" },
          { label: "REVIEW QUEUE", value: pending > 0 ? `${pending} PENDING` : "CLEAR", tone: pending > 0 ? "warn" : "ok" },
          { label: "DATABASE", value: "SYNCED", tone: "ok" },
        ]}
      />

      <div className="hud-frame rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-accent-bright">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          ADMIN // 01
        </div>
        <h1 className="mt-3 break-words font-display text-2xl font-bold uppercase tracking-tight text-text-primary sm:text-4xl">
          SYSTEM CONTROL <span className="text-accent">// ADMIN</span>
        </h1>
        <p className="mt-2 text-sm text-text-secondary">System overview and management</p>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {controlTiles.map((tile) => (
            <div
              key={tile.label}
              className={`rounded-lg border bg-background/50 p-4 ${
                tile.alert ? "border-status-review/40" : "border-border"
              }`}
            >
              <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
                {tile.alert && (
                  <span className="status-dot is-pulsing h-1.5 w-1.5 rounded-full bg-status-review text-status-review" />
                )}
                {tile.label}
              </p>
              <p
                className={`mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl ${
                  tile.alert ? "text-status-review" : "text-text-primary"
                }`}
              >
                <AnimatedCounter value={tile.value} pad={2} />
              </p>
              <p className="mt-1 font-mono text-[10px] text-text-tertiary">{tile.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { to: "/admin/students", label: "Manage Students", icon: Users },
          { to: "/admin/teams", label: "Manage Teams", icon: Shield },
          { to: "/admin/ideas", label: "Manage Ideas", icon: Lightbulb },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-border-strong hover:bg-surface-elevated"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-surface-hover p-2 text-text-secondary transition-colors group-hover:text-accent">
                <link.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-text-primary">{link.label}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        ))}
      </div>

      {/* Main Stats */}
      <div className="space-y-4">
        <SectionHeading number="01" label="Overview" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              accent={stat.accent}
            />
          ))}
        </div>
      </div>

      {/* Idea Status Stats */}
      <div className="space-y-4">
        <SectionHeading number="02" label="Idea Status" />
        <Reveal>
          <PipelineFlow
            counts={{
              draft: data.draft_ideas,
              submitted: data.submitted_ideas,
              under_review: data.under_review_ideas,
              approved: data.approved_ideas,
              rejected: data.rejected_ideas,
            }}
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {ideaStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <SectionHeading number="03" label="Recent Activity" />
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Recent Ideas */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-text-primary">Recent Ideas</h3>
              <Link to="/admin/ideas" className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent hover:text-accent-hover">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent_ideas.slice(0, 5).map((idea) => (
                <div key={idea.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{idea.title}</p>
                    <p className="font-mono text-[10px] text-text-tertiary">{idea.creator_name}</p>
                  </div>
                  <StatusBadge status={idea.status as "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected"} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Teams */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-text-primary">Recent Teams</h3>
              <Link to="/admin/teams" className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent hover:text-accent-hover">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent_teams.slice(0, 5).map((team) => (
                <div key={team.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{team.name}</p>
                    <p className="font-mono text-[10px] text-text-tertiary">
                      {team.leader_name} · {team.member_count}/{team.max_members}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-text-primary">Recent Users</h3>
              <Link to="/admin/students" className="font-mono text-[10px] font-medium uppercase tracking-wider text-accent hover:text-accent-hover">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {data.recent_users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
                    <p className="font-mono text-[10px] text-text-tertiary">{user.register_number}</p>
                  </div>
                  <span className="rounded-full border border-border bg-surface-hover px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
