const VARIANTS = {
  neutral: "bg-ink/[0.06] text-ink-dim ring-1 ring-inset ring-ink/10",
  info: "bg-blue-500/10 text-blue-700 ring-1 ring-inset ring-blue-500/20 dark:text-blue-400",
  warning: "bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400",
  danger: "bg-red-500/10 text-red-700 ring-1 ring-inset ring-red-500/20 dark:text-red-400",
};

export default function Badge({ variant = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-medium ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
