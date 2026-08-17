export default function Input({ icon: Icon, className = "", inputClassName = "", ...props }) {
  return (
    <label
      className={`flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-ink-faint transition focus-within:border-ink-ghost ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <input
        className={`w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none ${inputClassName}`}
        {...props}
      />
    </label>
  );
}
