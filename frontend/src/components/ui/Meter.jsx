export default function Meter({ value, max, label, accent = "#3987e5" }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-ink-faint">{label}</span>
          <span className="font-medium text-ink-dim">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
}
