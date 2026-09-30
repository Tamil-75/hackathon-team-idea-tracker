import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  User,
  Lightbulb,
  Shield,
  Terminal,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import RouteTransition from "./RouteTransition";
import SystemClock from "./SystemClock";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const studentLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/teams", label: "Find Teams", icon: Users },
    { to: "/my-team", label: "My Team", icon: User },
    { to: "/ideas", label: "Ideas", icon: Lightbulb },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/teams", label: "Teams", icon: Shield },
    { to: "/admin/ideas", label: "Ideas", icon: Lightbulb },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Longest matching link wins, so nested pages (e.g. /teams/3) keep the right section lit.
  const activeLink = links
    .filter((l) => isActive(l.to))
    .sort((a, b) => b.to.length - a.to.length)[0];

  return (
    <div className="flex h-screen bg-transparent">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-border bg-[#0c0c0e]/95 backdrop-blur-xl transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:bg-surface ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 shadow-[0_0_14px_rgba(59,130,246,0.18)]">
              <Terminal className="h-4 w-4 text-accent" />
            </div>
            <div>
              <span className="font-display text-sm font-bold tracking-tight text-text-primary">
                HACKTRACK
              </span>
              <span className="ml-1.5 font-mono text-[10px] font-medium text-text-tertiary">
                // 26
              </span>
            </div>
          </div>

          <div className="px-5 pb-1 pt-4 font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-text-tertiary">
            {isAdmin ? "CONTROL // NAV" : "SYSTEM // NAV"}
          </div>

          <nav className="flex-1 space-y-0.5 p-3 pt-1" aria-label="Main">
            {links.map((link) => {
              const active = activeLink?.to === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 before:absolute before:-left-3 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:origin-center before:rounded-full before:bg-accent before:shadow-[0_0_10px_rgba(59,130,246,0.8)] before:transition-transform before:duration-300 ${
                    active
                      ? "bg-accent-subtle text-accent before:scale-y-100"
                      : "text-text-secondary before:scale-y-0 hover:bg-surface-hover hover:text-text-primary"
                  }`}
                >
                  <link.icon
                    className={`h-4 w-4 transition-colors ${
                      active ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary"
                    }`}
                  />
                  {link.label}
                  {active && (
                    <div className="status-dot is-pulsing ml-auto h-1.5 w-1.5 rounded-full bg-accent text-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user?.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-status-rejected"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-surface px-4 backdrop-blur-md lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-text-tertiary">
            <span className="hidden sm:inline">HACKTRACK // 26</span>
            <span className="hidden text-border-strong sm:inline">/</span>
            <span className="truncate uppercase tracking-wider text-text-secondary">
              {isAdmin ? "SYSTEM CONTROL" : "COMMAND CENTER"}
              {activeLink ? ` // ${activeLink.label}` : ""}
            </span>
          </div>
          <SystemClock />
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          <RouteTransition>{children}</RouteTransition>
        </main>
      </div>
    </div>
  );
}
