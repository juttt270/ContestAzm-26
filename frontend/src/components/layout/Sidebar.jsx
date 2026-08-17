import { NavLink } from "react-router-dom";
import { env } from "@/config/env";
import { useAuth } from "@/context/AuthContext";
import { NAV_SECTIONS } from "@/components/layout/navConfig";
import { IconLogOut, IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

function NavItem({ item, collapsed }) {
  const Icon = item.icon;

  if (!item.to) {
    return (
      <div
        title={collapsed ? item.label : undefined}
        className={`flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-ink-ghost ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && item.label}
        </span>
        {!collapsed && <span className="h-1 w-1 rounded-full bg-ink-ghost" />}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center rounded-lg py-2.5 text-[15px] font-medium transition-colors ${
          collapsed ? "justify-center px-0" : "justify-between px-3"
        } ${
          isActive
            ? "bg-ink/[0.06] text-ink"
            : "text-ink-faint hover:bg-ink/[0.04] hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-ink transition-all ${
              isActive ? "w-[3px] opacity-100" : "w-[3px] opacity-0"
            }`}
          />
          <span className="flex items-center gap-3">
            <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-ink" : ""}`} />
            {!collapsed && item.label}
          </span>
          {!collapsed && item.badge && (
            <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[11px] font-semibold text-ink-dim">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse, onLogoutClick }) {
  const { user, role } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-line-soft bg-sidebar transition-[transform,width] duration-200 lg:static lg:translate-x-0 ${
          collapsed ? "w-[76px]" : "w-64"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-line-soft ${collapsed ? "justify-center px-0" : "gap-2.5 px-5"}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-900 to-black text-sm font-bold text-white shadow-[0_0_16px_rgba(0,0,0,0.15)] dark:from-white dark:to-zinc-400 dark:text-black dark:shadow-[0_0_16px_rgba(255,255,255,0.12)]">
            {env.APP_NAME.charAt(0)}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{env.APP_NAME}</p>
              <p className="text-xs text-ink-ghost">{role ? `${role} Panel` : "Society Admin"}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[52px] hidden h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-ink-faint shadow-lg shadow-black/10 transition hover:border-ink-ghost hover:text-ink dark:shadow-black/40 lg:flex"
        >
          {collapsed ? <IconChevronRight className="h-3.5 w-3.5" /> : <IconChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => !item.roles || item.roles.includes(role));
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                {!collapsed && (
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-ghost">
                    {section.label}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavItem key={item.label} item={item} collapsed={collapsed} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={`border-t border-line-soft p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? "" : "w-full"}`}>
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-sm font-semibold text-white ring-1 ring-black/10 dark:from-zinc-600 dark:to-zinc-800 dark:ring-white/10">
              {initial}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-400" />
            </span>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{user?.name || "..."}</p>
                  <p className="truncate text-xs text-ink-ghost">{user?.email || ""}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogoutClick}
                  className="rounded-md p-1.5 text-ink-ghost transition hover:bg-surface-hover hover:text-ink"
                  aria-label="Log out"
                >
                  <IconLogOut className="h-[18px] w-[18px]" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
