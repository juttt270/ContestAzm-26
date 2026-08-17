import { useNavigate } from "react-router-dom";
import { IconMenu, IconSearch, IconBell, IconChevronDown, IconSun, IconMoon } from "@/components/ui/icons";
import Menu from "@/components/ui/Menu";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants";

const pillButton =
  "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-faint shadow-[0_0_14px_rgba(0,0,0,0.06)] transition hover:border-ink-ghost hover:text-ink dark:shadow-[0_0_14px_rgba(0,0,0,0.5)]";

export default function Topbar({ onMenuClick, onLogoutClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-line-soft bg-canvas/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-ink-faint transition hover:bg-surface-hover hover:text-ink lg:hidden"
        aria-label="Toggle sidebar"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      <label className="hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-ink-faint shadow-[0_0_14px_rgba(0,0,0,0.04)] transition focus-within:border-ink-ghost dark:shadow-[0_0_14px_rgba(0,0,0,0.4)] md:flex">
        <IconSearch className="h-4 w-4 shrink-0" />
        <input
          type="text"
          placeholder="Search residents, flats, complaints..."
          className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <kbd className="shrink-0 rounded-full border border-line px-1.5 py-0.5 text-[10px] text-ink-ghost">
          ⌘K
        </kbd>
      </label>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className={pillButton}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <IconSun className="h-[18px] w-[18px]" /> : <IconMoon className="h-[18px] w-[18px]" />}
        </button>

        <button type="button" className={`relative ${pillButton}`} aria-label="Notifications">
          <IconBell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink shadow-[0_0_6px_rgba(0,0,0,0.3)] dark:shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
        </button>

        <div className="h-6 w-px bg-line" />

        <Menu
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 shadow-[0_0_14px_rgba(0,0,0,0.06)] transition hover:border-ink-ghost dark:shadow-[0_0_14px_rgba(0,0,0,0.5)]"
            >
              <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 text-xs font-semibold text-white ring-1 ring-black/10 dark:from-zinc-600 dark:to-zinc-800 dark:ring-white/10">
                {user?.avatar?.url ? <img src={user.avatar.url} alt="" className="h-full w-full object-cover" /> : initial}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-surface bg-emerald-400" />
              </span>
              <span className="hidden text-sm font-medium text-ink sm:block">{user?.name?.split(" ")[0] || "..."}</span>
              <IconChevronDown className="hidden h-4 w-4 text-ink-faint sm:block" />
            </button>
          }
          items={[
            { label: "My Profile", onClick: () => navigate(ROUTES.PROFILE) },
            { divider: true },
            { label: "Log out", danger: true, onClick: onLogoutClick },
          ]}
        />
      </div>
    </header>
  );
}
