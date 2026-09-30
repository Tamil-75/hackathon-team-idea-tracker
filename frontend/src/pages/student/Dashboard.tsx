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
import { getTeam } from "../../api/teams";
import type { StudentDashboardResponse, TeamDetail } from "../../types";
import IdeaCard from "../../components/IdeaCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import SectionHeading from "../../components/SectionHeading";
import SystemStatusBar from "../../components/SystemStatusBar";
import TeamNetwork from "../../components/TeamNetwork";
import PipelineFlow from "../../components/PipelineFlow";
import AnimatedCounter from "../../components/AnimatedCounter";
import Reveal from "../../components/Reveal";

export default function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null);

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

  // Members for the team network visual come from the existing team API.
  const teamId = data?.team?.id;
  useEffect(() => {
    if (teamId === undefined) {
      setTeamDetail(null);
      return;
    }
    let cancelled = false;
    getTeam(teamId)
      .then((detail) => {
        if (!cancelled) setTeamDetail(detail);
      })
      .catch(() => {
        if (!cancelled) setTeamDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId]);

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
        <AlertCircle className="h-10 w-10 text-status-rejected" />
        <p className="text-sm text-text-secondary">{error}</p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Ideas", value: data.idea_statistics.total, icon: Lightbulb, accent: true },
    { label: "Draft", value: data.idea_statistics.draft, icon: FileText },
    { label: "Submitted", value: data.idea_statistics.submitted, icon: Clock },
    { label: "Under Review", value: data.idea_statistics.under_review, icon: AlertCircle },
    { label: "Approved", value: data.idea_statistics.approved, icon: CheckCircle },
    { label: "Rejected", value: data.idea_statistics.rejected, icon: XCircle },
  ];

  return (
    <div className="space-y-8">
      {/* System status */}
      <SystemStatusBar
        items={[
          { label: "SYSTEM STATUS", value: "ONLINE", tone: "ok" },
          { label: "TEAM NETWORK", value: data.team ? "ACTIVE" : "STANDBY", tone: data.team ? "ok" : "idle" },
          { label: "IDEA ENGINE", value: "ACTIVE", tone: "ok" },
          { label: "DATABASE", value: "SYNCED", tone: "ok" },
        ]}
      />

      {/* Welcome Section */}
      <div className="hud-frame rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-accent-bright">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          DASHBOARD // 01
        </div>
        <h1 className="mt-3 break-words font-display text-2xl font-bold uppercase tracking-tight text-text-primary sm:text-4xl">
          <span className="text-text-tertiary">WELCOME,</span> {data.user.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-text-tertiary">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {data.user.register_number}
          </span>
          <span className="break-all">{data.user.email}</span>
        </div>
      </div>

      {/* Team Section */}
      <div className="space-y-4">
        <SectionHeading number="01" label="Team" />
        <div className="rounded-xl border border-border bg-surface p-6">
          {data.team ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-text-primary">
                    {data.team.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {data.team.description}
                  </p>
                </div>
                {data.is_team_leader && (
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-accent">
                    Leader
                  </span>
                )}
              </div>
              {teamDetail && teamDetail.id === data.team.id && (
                <div className="rounded-lg border border-border bg-background/40 px-2 py-4">
                  <p className="mb-1 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
                    TEAM_LINK // {data.team.name}
                  </p>
                  <TeamNetwork
                    teamName={data.team.name}
                    leaderId={data.team.leader_id}
                    members={teamDetail.members}
                    maxMembers={data.team.max_members}
                    currentUserId={data.user.id}
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-4 font-mono text-[11px] text-text-tertiary">
                <span>Leader: {data.team.leader_name}</span>
                <span>Members: {data.team.member_count}/{data.team.max_members}</span>
                <span>Available Slots: {data.team.available_slots}</span>
              </div>
              <Link
                to={`/teams/${data.team.id}`}
                className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wider text-accent hover:text-accent-hover"
              >
                View Team
                <ArrowRight className="h-3.5 w-3.5" />
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
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
              >
                Find a Team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Idea Statistics */}
      <div className="space-y-4">
        <SectionHeading number="02" label="Ideas" />
        <Reveal>
          <PipelineFlow
            counts={{
              draft: data.idea_statistics.draft,
              submitted: data.idea_statistics.submitted,
              under_review: data.idea_statistics.under_review,
              approved: data.idea_statistics.approved,
              rejected: data.idea_statistics.rejected,
            }}
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-border-strong"
            >
              <div className={`mb-2 inline-flex rounded-lg p-2 ${stat.accent ? "bg-accent/10 text-accent" : "bg-surface-hover text-text-secondary"}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="font-display text-2xl font-bold text-text-primary">
                <AnimatedCounter value={stat.value} duration={1000} />
              </p>
              <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ideas */}
      <div className="space-y-4">
        <SectionHeading number="03" label="Activity" />
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-text-primary">Recent Ideas</h3>
          <div className="flex gap-2">
            <Link
              to="/ideas"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              View All
            </Link>
            <Link
              to="/ideas/create"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-accent-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Create
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
