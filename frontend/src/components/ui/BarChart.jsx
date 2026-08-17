import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;
const BAR_WIDTH = 22;

export default function BarChart({ data, formatValue = (v) => v, actualLabel = "Collected", targetLabel = "Billed" }) {
  const { theme } = useTheme();
  const color = theme === "dark" ? "#3987e5" : "#2a78d6";
  const [hoverIndex, setHoverIndex] = useState(null);

  const plotW = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const maxValue = Math.max(...data.map((d) => Math.max(d.actual, d.target)), 1);
  const niceMax = Math.ceil((maxValue * 1.1) / 5) * 5 || 5;
  const slot = plotW / data.length;

  const bars = data.map((d, i) => {
    const cx = PAD_LEFT + slot * i + slot / 2;
    const barH = (d.actual / niceMax) * plotH;
    const targetY = PAD_TOP + plotH - (d.target / niceMax) * plotH;
    return {
      ...d,
      cx,
      x: cx - BAR_WIDTH / 2,
      y: PAD_TOP + plotH - barH,
      h: Math.max(barH, 2),
      targetY,
    };
  });

  const hovered = hoverIndex != null ? bars[hoverIndex] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" onPointerLeave={() => setHoverIndex(null)}>
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

        {bars.map((b, i) => (
          <g key={b.label} onPointerEnter={() => setHoverIndex(i)} className="cursor-default">
            <rect x={b.cx - slot / 2} y={PAD_TOP} width={slot} height={plotH} fill="transparent" />
            <rect
              x={b.x}
              y={b.y}
              width={BAR_WIDTH}
              height={b.h}
              rx="4"
              fill={color}
              opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.4}
              style={{ transition: "opacity 150ms" }}
            />
            <line
              x1={b.x - 4}
              x2={b.x + BAR_WIDTH + 4}
              y1={b.targetY}
              y2={b.targetY}
              className="stroke-ink-ghost"
              strokeWidth="2"
            />
            <text x={b.cx} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-ghost" style={{ fontSize: 11 }}>
              {b.label}
            </text>
          </g>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg shadow-black/10 dark:shadow-black/50"
          style={{ left: `${(hovered.cx / WIDTH) * 100}%` }}
        >
          <p className="font-semibold text-ink">{formatValue(hovered.actual)}</p>
          <p className="text-ink-faint">
            of {formatValue(hovered.target)} billed · {hovered.label}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: color }} />
          {actualLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full bg-ink-ghost" />
          {targetLabel}
        </span>
      </div>
    </div>
  );
}
