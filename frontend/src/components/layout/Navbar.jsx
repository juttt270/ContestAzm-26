import { NavLink } from "react-router-dom";
import { env } from "@/config/env";
import { ROUTES } from "@/constants";

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"
  }`;

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NavLink to={ROUTES.HOME} className="text-lg font-semibold text-slate-900">
          {env.APP_NAME}
        </NavLink>
        <div className="flex items-center gap-6">
          <NavLink to={ROUTES.HOME} className={linkClass}>
            Home
          </NavLink>
          <NavLink to={ROUTES.ABOUT} className={linkClass}>
            About
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
