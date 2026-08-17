import { IconChevronDown } from "@/components/ui/icons";

export default function SelectField({ label, options, error, className = "", ...props }) {
  return (
    <label className={`block text-sm font-medium text-ink-dim ${className}`}>
      {label}
      <span className="relative mt-1.5 block">
        <select
          className={`w-full appearance-none rounded-lg border bg-canvas px-3 py-2.5 pr-9 text-sm text-ink transition focus:outline-none ${
            error ? "border-red-500/50 focus:border-red-500/70" : "border-line focus:border-ink-ghost"
          }`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      </span>
      {error && <span className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
