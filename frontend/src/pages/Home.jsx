import { useEffect, useState } from "react";
import { getHealth } from "@/api/health.api";
import { env } from "@/config/env";
import Loader from "@/components/common/Loader";

export default function Home() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHealth()
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{env.APP_NAME}</h1>
        <p className="mt-2 text-slate-600">
          React + Vite + Tailwind frontend, Express + MongoDB backend se juda hua.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Backend connection
        </h2>

        {loading && <Loader label="Backend se connect ho raha hai..." />}

        {!loading && error && (
          <p className="text-sm text-red-600">
            Connection failed: {error} — check karein ke backend{" "}
            <code className="rounded bg-slate-100 px-1">{env.API_BASE_URL}</code>{" "}
            par chal raha hai.
          </p>
        )}

        {!loading && health && (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium text-emerald-600">{health.status}</dd>
            <dt className="text-slate-500">Database</dt>
            <dd className="font-medium text-slate-800">{health.database}</dd>
            <dt className="text-slate-500">Environment</dt>
            <dd className="font-medium text-slate-800">{health.environment}</dd>
            <dt className="text-slate-500">Uptime</dt>
            <dd className="font-medium text-slate-800">{health.uptime}</dd>
          </dl>
        )}
      </div>
    </section>
  );
}
