import { useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;

export default function AreaChart({ data, formatValue = (v) => v }) {
  const { theme } = useTheme();
  const color = theme === "dark" ? "#3987e5" : "#2a78d6";
  const [hoverIndex, setHoverIndex] = useState(null);
  const gradientId = useMemo(() => `area-fill-${Math.random().toString(36).slice(2, 9)}`, []);

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const niceMax = Math.ceil((maxValue * 1.15) / 5) * 5 || 5;

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        x: PAD_LEFT + (data.length === 1 ? 0 : (i / (data.length - 1)) * plotW),
        y: PAD_TOP + plotH - (d.value / niceMax) * plotH,
      })),
    [data, plotW, plotH, niceMax],
  );

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${(PAD_TOP + plotH).toFixed(1)} L ${points[0].x} ${(PAD_TOP + plotH).toFixed(1)} Z`;

  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const labelIdxs = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full touch-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((s) => (
          <line
            key={s}
            x1={PAD_LEFT}
            x2={WIDTH - PAD_RIGHT}
            y1={PAD_TOP + plotH * (1 - s)}
            y2={PAD_TOP + plotH * (1 - s)}
            className="stroke-line-soft"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={PAD_TOP}
            y2={PAD_TOP + plotH}
            className="stroke-line"
            strokeWidth="1"
          />
        )}

        {points.map((p, i) => {
          const isEnd = i === points.length - 1;
          const isHovered = i === hoverIndex;
          if (!isEnd && !isHovered) return null;
          return (
            <circle
              key={p.label}
              cx={p.x}
              cy={p.y}
              r={isHovered ? 5 : 4}
              fill={color}
              stroke="var(--surface)"
              strokeWidth="2"
            />
          );
        })}

        {labelIdxs.map((i) => (
          <text
            key={i}
            x={points[i].x}
            y={HEIGHT - 8}
            textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            className="fill-ink-ghost"
            style={{ fontSize: 11 }}
          >
            {points[i].label}
          </text>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg shadow-black/10 dark:shadow-black/50"
          style={{ left: `${(hovered.x / WIDTH) * 100}%` }}
        >
          <p className="font-semibold text-ink">{formatValue(hovered.value)}</p>
          <p className="text-ink-faint">{hovered.label}</p>
        </div>
      )}
    </div>
  );
}
