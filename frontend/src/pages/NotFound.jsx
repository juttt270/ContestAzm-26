import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="text-5xl font-bold text-ink-ghost">404</p>
      <h1 className="text-xl font-semibold text-ink">Page not found</h1>
      <Link
        to={ROUTES.DASHBOARD}
        className="text-sm font-medium text-ink-faint transition hover:text-ink hover:underline"
      >
        Go back to dashboard
      </Link>
    </section>
  );
}
