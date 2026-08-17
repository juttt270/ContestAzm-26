import { IconArrowUpRight, IconArrowDownRight } from "@/components/ui/icons";
import Sparkline from "@/components/ui/Sparkline";
import Meter from "@/components/ui/Meter";

const TINTS = {
  neutral: { icon: "bg-surface-hover text-ink-dim", ring: "group-hover:ring-ink-ghost/25", hex: "#71717a" },
  info: { icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400", ring: "group-hover:ring-blue-500/25", hex: "#3987e5" },
  warning: { icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400", ring: "group-hover:ring-amber-500/25", hex: "#eda100" },
  success: { icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", ring: "group-hover:ring-emerald-500/25", hex: "#1baf7a" },
};

export default function StatCard({ icon: Icon, label, value, sub, delta, tint = "neutral", trend, meter, onClick }) {
  const t = TINTS[tint];
  const Root = onClick ? "button" : "div";

  return (
    <Root
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group w-full rounded-xl border border-line bg-surface p-3 text-left ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40 ${t.ring} ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-110 ${t.icon}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {delta && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-medium ${
              delta.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {delta.direction === "up" ? (
              <IconArrowUpRight className="h-3 w-3" />
            ) : (
              <IconArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <p className="mt-2 text-xl font-semibold leading-none tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs font-medium text-ink-faint">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-ghost">{sub}</p>}
      {trend && (
        <div className="mt-2">
          <Sparkline data={trend} accent={t.hex} />
        </div>
      )}
      {meter && (
        <div className="mt-2">
          <Meter value={meter.value} max={meter.max} accent={t.hex} />
        </div>
      )}
    </Root>
  );
}
