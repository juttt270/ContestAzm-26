export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-ink-faint">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-ink-dim" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
