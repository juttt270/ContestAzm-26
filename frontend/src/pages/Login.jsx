import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { env } from "@/config/env";
import { ROUTES } from "@/constants";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-black text-base font-bold text-white shadow-[0_0_16px_rgba(0,0,0,0.15)] dark:from-white dark:to-zinc-400 dark:text-black dark:shadow-[0_0_16px_rgba(255,255,255,0.12)]">
            {env.APP_NAME.charAt(0)}
          </span>
          <h1 className="mt-4 text-xl font-semibold text-ink">{env.APP_NAME}</h1>
          <p className="mt-1 text-sm text-ink-faint">Sign in to manage your society</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-line bg-surface p-6 shadow-sm shadow-black/5 dark:shadow-black/30"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <TextField
            label="Email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@society.com"
          />

          <TextField
            className="mt-4"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" size="md" disabled={submitting} className="mt-6 w-full">
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-ghost">
          © {new Date().getFullYear()} {env.APP_NAME} · Society management, built for residents and staff
        </p>
      </div>
    </div>
  );
}
