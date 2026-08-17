export default function EmptyState({ icon: Icon, title = "Nothing here yet", description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {Icon && (
        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-hover text-ink-ghost">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="text-sm font-medium text-ink-dim">{title}</p>
      {description && <p className="max-w-xs text-xs text-ink-ghost">{description}</p>}
    </div>
  );
}
