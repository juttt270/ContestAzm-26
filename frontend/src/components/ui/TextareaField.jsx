export default function TextareaField({ label, error, className = "", rows = 4, ...props }) {
  return (
    <label className={`block text-sm font-medium text-ink-dim ${className}`}>
      {label}
      <textarea
        rows={rows}
        className={`mt-1.5 w-full resize-none rounded-lg border bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint transition focus:outline-none ${
          error ? "border-red-500/50 focus:border-red-500/70" : "border-line focus:border-ink-ghost"
        }`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
