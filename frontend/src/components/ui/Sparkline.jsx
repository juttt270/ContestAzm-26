const VIEW_W = 240;
const VIEW_H = 36;

export default function Sparkline({ data, accent = "#3987e5" }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = VIEW_W / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: VIEW_H - ((v - min) / range) * (VIEW_H - 6) - 3,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className="h-9 w-full overflow-visible">
      <path
        d={linePath}
        fill="none"
        className="stroke-ink-ghost"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r="3" fill={accent} stroke="var(--surface)" strokeWidth="1.5" />
    </svg>
  );
}
