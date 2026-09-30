import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Terminal, Mail, Lock, AlertCircle } from "lucide-react";
import RouteTransition from "../../components/RouteTransition";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = isAdmin ? "/admin/dashboard" : "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);
      const redirectTo = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors";

  return (
    <RouteTransition>
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Terminal className="h-5 w-5 text-accent" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-text-primary">
              HACKTRACK
            </span>
            <span className="font-mono text-xs font-medium text-text-tertiary">// 26</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-text-primary">
            Sign In
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="hud-frame rounded-2xl border border-border bg-surface p-8 backdrop-blur-sm">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-status-rejected/20 bg-status-rejected/5 px-4 py-3 text-sm text-status-rejected">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-tertiary">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
    </RouteTransition>
  );
}
