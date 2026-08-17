import Badge from "@/components/ui/Badge";

const VARIANT_BY_STATUS = {
  // Complaints
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  CLOSED: "neutral",
  // Visitors
  APPROVED: "info",
  CHECKED_IN: "success",
  COMPLETED: "neutral",
  EXPIRED: "danger",
  CANCELLED: "neutral",
  // Emergency
  ACTIVE: "danger",
  // Billing
  PENDING: "warning",
  OVERDUE: "danger",
  PAID: "success",
  // Generic / demo data
  open: "warning",
  pending: "warning",
  progress: "info",
  resolved: "success",
  checked_in: "success",
  checked_out: "neutral",
  confirmed: "success",
  urgent: "danger",
};

export default function StatusBadge({ status, children }) {
  return <Badge variant={VARIANT_BY_STATUS[status] || "neutral"}>{children}</Badge>;
}
