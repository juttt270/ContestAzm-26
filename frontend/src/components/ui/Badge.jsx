const DOT_COLORS = {
  neutral: "bg-ink-ghost",
  info: "bg-blue-500 dark:bg-blue-400",
  warning: "bg-amber-500 dark:bg-amber-400",
  success: "bg-emerald-500 dark:bg-emerald-400",
  danger: "bg-red-500 dark:bg-red-400",
};

export default function Badge({ variant = "neutral", className = "", children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-ink-dim ${className}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLORS[variant]}`} />
      {children}
    </span>
  );
}
