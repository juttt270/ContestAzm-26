import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <Link to={ROUTES.HOME} className="text-sm font-medium text-brand-600 hover:underline">
        Go back home
      </Link>
    </section>
  );
}
