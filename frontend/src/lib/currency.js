export const formatCurrency = (amount) => {
  const n = Number(amount) || 0;
  if (n >= 100000) return `Rs ${(n / 100000).toFixed(1)}L`;
  return `Rs ${n.toLocaleString("en-IN")}`;
};

/** Groups maintenance bills by billingMonth into { label, actual, target } for a bar chart. */
export const monthlyBillingTrend = (bills, monthsCount = 6) => {
  const map = new Map();

  bills.forEach((bill) => {
    const key = bill.billingMonth;
    if (!key) return;
    if (!map.has(key)) map.set(key, { billed: 0, collected: 0 });
    const entry = map.get(key);
    entry.billed += bill.amountDue || 0;
    if (bill.paymentStatus === "PAID") entry.collected += (bill.amountDue || 0) + (bill.penaltyAmount || 0);
  });

  const sortedKeys = [...map.keys()].sort().slice(-monthsCount);

  return sortedKeys.map((key) => {
    const [year, month] = key.split("-");
    const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "short" });
    const entry = map.get(key);
    return { label, actual: Math.round(entry.collected), target: Math.round(entry.billed) };
  });
};
