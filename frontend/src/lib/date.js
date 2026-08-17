export const formatDate = (iso, opts) =>
  iso ? new Date(iso).toLocaleDateString("en-US", opts || { month: "short", day: "numeric", year: "numeric" }) : "—";

export const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

/** Buckets `items` into a daily count trend for the last `days` days (oldest to newest). */
export const dailyTrend = (items, days, dateField = "createdAt") => {
  const now = new Date();
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return { key: d.toDateString(), label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: 0 };
  });

  items.forEach((item) => {
    const raw = item[dateField];
    if (!raw) return;
    const key = new Date(raw).toDateString();
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += 1;
  });

  return buckets.map(({ label, value }) => ({ label, value }));
};
