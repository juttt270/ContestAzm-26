function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const withGaps = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push("...");
    withGaps.push(p);
  });
  return withGaps;
}

export default function Pagination({ page, pageCount, totalItems, pageSize, onPageChange }) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 px-5 py-3.5 sm:flex-row">
      <p className="text-xs text-ink-ghost">
        Showing <span className="text-ink-dim">{start}-{end}</span> of{" "}
        <span className="text-ink-dim">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-dim transition hover:bg-surface-hover hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          Prev
        </button>
        {pageList(page, pageCount).map((p, i) =>
          p === "..." ? (
            <span key={`gap-${i}`} className="px-1.5 text-xs text-ink-ghost">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-7 w-7 rounded-md text-xs font-medium transition ${
                p === page ? "bg-ink text-canvas" : "text-ink-dim hover:bg-surface-hover hover:text-ink"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-dim transition hover:bg-surface-hover hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
