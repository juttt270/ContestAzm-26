const VARIANTS = {
  primary: "bg-ink text-canvas hover:opacity-90",
  outline: "border border-line text-ink-dim hover:border-ink-ghost hover:bg-surface-hover",
  ghost: "text-ink-faint hover:bg-surface-hover hover:text-ink",
  danger: "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20 hover:bg-red-500/15 dark:text-red-400",
};

const SIZES = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
