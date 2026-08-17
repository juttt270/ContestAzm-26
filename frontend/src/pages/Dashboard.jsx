import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import * as flatService from "@/services/flatService";
import * as complaintService from "@/services/complaintService";
import * as visitorService from "@/services/visitorService";
import * as billingService from "@/services/billingService";
import * as noticeService from "@/services/noticeService";
import * as emergencyService from "@/services/emergencyService";
import * as amenityService from "@/services/amenityService";
import { dailyTrend, isToday, formatDate } from "@/lib/date";
import { formatCurrency, monthlyBillingTrend } from "@/lib/currency";
import { ROUTES } from "@/constants";

import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import AreaChart from "@/components/ui/AreaChart";
import BarChart from "@/components/ui/BarChart";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import {
  IconBuilding,
  IconAlertCircle,
  IconUsers,
  IconCreditCard,
  IconShield,
  IconClock,
  IconMegaphone,
  IconCalendar,
} from "@/components/ui/icons";

const COMPLAINT_STATUS_LABEL = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed" };
const VISITOR_STATUS_LABEL = {
  APPROVED: "Approved",
  CHECKED_IN: "Checked in",
  COMPLETED: "Checked out",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};
const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{eyebrow}</p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-1.5 text-[15px] text-ink-faint">{subtitle}</p>
      </div>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

const today = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export default function Dashboard() {
  const { role, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let result = null;

        if (role === "Admin") {
          const [occupancy, complaints, visitors, collection, bills, notices, alerts] = await Promise.all([
            flatService.getOccupancyMap(),
            complaintService.getComplaints(),
            visitorService.getVisitors(),
            billingService.getCollectionReport(),
            billingService.getBills(),
            noticeService.getNotices(),
            emergencyService.getActiveAlerts(),
          ]);
          result = { occupancy, complaints, visitors, collection, bills, notices, alerts };
        } else if (role === "Resident") {
          const [complaints, bills, notices, bookings] = await Promise.all([
            complaintService.getComplaints(),
            billingService.getBills(),
            noticeService.getNotices(),
            amenityService.getMyBookings(),
          ]);
          result = { complaints, bills, notices, bookings };
        } else if (role === "Guard") {
          const [visitors, overstay, alerts] = await Promise.all([
            visitorService.getVisitors(),
            visitorService.getOverstayAlerts(),
            emergencyService.getActiveAlerts(),
          ]);
          result = { visitors, overstay, alerts };
        } else if (role === "Staff") {
          const [complaints] = await Promise.all([complaintService.getComplaints()]);
          result = { complaints };
        }

        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (role) load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (role === "Admin") return <AdminDashboard data={data} />;
  if (role === "Resident") return <ResidentDashboard data={data} user={user} />;
  if (role === "Guard") return <GuardDashboard data={data} />;
  if (role === "Staff") return <StaffDashboard data={data} />;
  return null;
}

function AdminDashboard({ data }) {
  const navigate = useNavigate();
  const { occupancy, complaints, visitors, collection, bills, notices, alerts } = data;

  const openComplaints = complaints.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS");
  const todayVisitors = visitors.filter((v) => isToday(v.createdAt));

  const stats = [
    {
      icon: IconBuilding,
      label: "Total Flats",
      value: occupancy.totalFlats,
      sub: `${occupancy.ownerOccupied + occupancy.tenantOccupied} occupied · ${occupancy.vacant} vacant`,
      tint: "neutral",
      meter: occupancy.totalFlats
        ? { value: occupancy.ownerOccupied + occupancy.tenantOccupied, max: occupancy.totalFlats }
        : null,
    },
    {
      icon: IconAlertCircle,
      label: "Pending Complaints",
      value: openComplaints.length,
      tint: "warning",
      trend: dailyTrend(complaints, 8).map((d) => d.value),
    },
    {
      icon: IconUsers,
      label: "Visitors Today",
      value: todayVisitors.length,
      tint: "success",
      trend: dailyTrend(visitors, 8).map((d) => d.value),
    },
    {
      icon: IconCreditCard,
      label: "Maintenance Collected",
      value: formatCurrency(collection.totalCollected),
      sub: collection.totalInvoiced
        ? `${Math.round((collection.totalCollected / collection.totalInvoiced) * 100)}% of ${formatCurrency(collection.totalInvoiced)} billed`
        : "No invoices generated yet",
      tint: "info",
      meter: collection.totalInvoiced ? { value: collection.totalCollected, max: collection.totalInvoiced } : null,
    },
  ];

  const complaintColumns = [
    { key: "flatId", header: "Flat", className: "font-medium text-ink", render: (r) => flatLabel(r.flatId) },
    { key: "title", header: "Issue" },
    { key: "residentId", header: "Raised by", render: (r) => r.residentId?.name || "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status}>{COMPLAINT_STATUS_LABEL[r.status]}</StatusBadge>,
    },
    { key: "createdAt", header: "Date", align: "right", render: (r) => formatDate(r.createdAt) },
  ];

  const visitorColumns = [
    { key: "visitorName", header: "Visitor", className: "font-medium text-ink" },
    { key: "targetFlatId", header: "Flat", render: (r) => flatLabel(r.targetFlatId) },
    { key: "purpose", header: "Purpose" },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (r) => <StatusBadge status={r.status}>{VISITOR_STATUS_LABEL[r.status] || r.status}</StatusBadge>,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader eyebrow="Overview" title="Society Dashboard" subtitle={today()} />
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={() => navigate(ROUTES.COMPLAINTS)}>
            View complaints
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Complaints Trend</h2>
            <p className="text-sm text-ink-faint">Last 14 days</p>
          </div>
          <div className="mt-4">
            <AreaChart data={dailyTrend(complaints, 14)} formatValue={(v) => `${v} complaint${v === 1 ? "" : "s"}`} />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Maintenance Collection</h2>
            <p className="text-sm text-ink-faint">Collected vs billed, by month</p>
          </div>
          <div className="mt-4">
            {monthlyBillingTrend(bills).length > 0 ? (
              <BarChart data={monthlyBillingTrend(bills)} formatValue={formatCurrency} />
            ) : (
              <EmptyState icon={IconCreditCard} title="No bills generated yet" />
            )}
          </div>
        </div>
      </div>

      <Table
        title="Recent Complaints"
        columns={complaintColumns}
        data={complaints.slice(0, 5)}
        searchable={false}
        pageSize={5}
        emptyIcon={IconAlertCircle}
        emptyTitle="No complaints yet"
        headerAction={
          <button
            onClick={() => navigate(ROUTES.COMPLAINTS)}
            className="text-sm font-medium text-ink-faint transition hover:text-ink"
          >
            View all
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table
            title="Visitor Log"
            columns={visitorColumns}
            data={visitors.slice(0, 5)}
            searchable={false}
            pageSize={5}
            emptyIcon={IconUsers}
            emptyTitle="No visitors logged yet"
          />
        </div>

        <div className="space-y-5">
          <Panel title="Notices">
            {notices.length === 0 ? (
              <EmptyState icon={IconMegaphone} title="No notices published" />
            ) : (
              <ul className="divide-y divide-line-soft">
                {notices.slice(0, 3).map((n) => (
                  <li key={n._id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] text-ink-dim">{n.title}</p>
                      <p className="mt-1 text-sm text-ink-faint">{formatDate(n.createdAt)}</p>
                    </div>
                    <StatusBadge status={n.category === "Urgent" ? "urgent" : "checked_out"}>
                      {n.category}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="rounded-xl border border-line bg-surface p-5">
            {alerts.length === 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <IconShield className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-ink">All clear</p>
                    <p className="text-sm text-ink-faint">No active emergency alerts</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                    <IconShield className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {alerts.length} active alert{alerts.length === 1 ? "" : "s"}
                    </p>
                    <p className="text-sm text-ink-faint">{alerts[0].alertType} · {alerts[0].locationDetails}</p>
                  </div>
                </div>
              </>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-ghost">
              <IconClock className="h-4 w-4" />
              Updated just now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentDashboard({ data, user }) {
  const navigate = useNavigate();
  const { complaints, bills, notices, bookings } = data;

  const pendingBills = bills.filter((b) => b.paymentStatus !== "PAID");
  const totalDue = pendingBills.reduce((sum, b) => sum + (b.amountDue || 0) + (b.penaltyAmount || 0), 0);
  const openComplaints = complaints.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS");
  const upcomingBookings = bookings.filter((b) => new Date(b.bookingDate) >= new Date());

  const stats = [
    {
      icon: IconCreditCard,
      label: "Amount Due",
      value: formatCurrency(totalDue),
      sub: `${pendingBills.length} bill${pendingBills.length === 1 ? "" : "s"} pending`,
      tint: totalDue > 0 ? "warning" : "success",
    },
    {
      icon: IconAlertCircle,
      label: "My Complaints",
      value: complaints.length,
      sub: `${openComplaints.length} open`,
      tint: "info",
    },
    {
      icon: IconCalendar,
      label: "Upcoming Bookings",
      value: upcomingBookings.length,
      sub: "Amenity reservations",
      tint: "neutral",
    },
  ];

  const complaintColumns = [
    { key: "ticketNumber", header: "Ticket", className: "font-medium text-ink" },
    { key: "title", header: "Title" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status}>{COMPLAINT_STATUS_LABEL[r.status]}</StatusBadge>,
    },
    { key: "createdAt", header: "Date", align: "right", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader eyebrow="Overview" title={`Welcome, ${user?.name?.split(" ")[0] || "Resident"}`} subtitle={today()} />
        <Button variant="primary" size="md" onClick={() => navigate(ROUTES.COMPLAINTS)}>
          + New Complaint
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table
            title="My Complaints"
            columns={complaintColumns}
            data={complaints}
            searchable={false}
            pageSize={5}
            emptyIcon={IconAlertCircle}
            emptyTitle="No complaints raised yet"
            headerAction={
              <button
                onClick={() => navigate(ROUTES.COMPLAINTS)}
                className="text-sm font-medium text-ink-faint transition hover:text-ink"
              >
                View all
              </button>
            }
          />
        </div>

        <Panel title="Notices">
          {notices.length === 0 ? (
            <EmptyState icon={IconMegaphone} title="No notices yet" />
          ) : (
            <ul className="divide-y divide-line-soft">
              {notices.slice(0, 4).map((n) => (
                <li key={n._id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-ink-dim">{n.title}</p>
                    <p className="mt-1 text-sm text-ink-faint">{formatDate(n.createdAt)}</p>
                  </div>
                  <StatusBadge status={n.category === "Urgent" ? "urgent" : "checked_out"}>{n.category}</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function GuardDashboard({ data }) {
  const { visitors, overstay, alerts } = data;
  const todayVisitors = visitors.filter((v) => isToday(v.createdAt));
  const checkedIn = visitors.filter((v) => v.status === "CHECKED_IN");

  const stats = [
    { icon: IconUsers, label: "Visitors Today", value: todayVisitors.length, tint: "success" },
    { icon: IconClock, label: "Currently Inside", value: checkedIn.length, tint: "info" },
    { icon: IconAlertCircle, label: "Overstay Alerts", value: overstay.length, tint: overstay.length > 0 ? "warning" : "neutral" },
    { icon: IconShield, label: "Emergency Alerts", value: alerts.length, tint: alerts.length > 0 ? "warning" : "success" },
  ];

  const visitorColumns = [
    { key: "visitorName", header: "Visitor", className: "font-medium text-ink" },
    { key: "targetFlatId", header: "Flat", render: (r) => flatLabel(r.targetFlatId) },
    { key: "purpose", header: "Purpose" },
    { key: "phone", header: "Phone" },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (r) => <StatusBadge status={r.status}>{VISITOR_STATUS_LABEL[r.status] || r.status}</StatusBadge>,
    },
  ];

  return (
    <div className="space-y-7">
      <SectionHeader eyebrow="Gate Overview" title="Guard Dashboard" subtitle={today()} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Table
        title="Visitor Log"
        columns={visitorColumns}
        data={visitors.slice(0, 8)}
        searchable={false}
        pageSize={8}
        emptyIcon={IconUsers}
        emptyTitle="No visitors logged yet"
      />
    </div>
  );
}

function StaffDashboard({ data }) {
  const navigate = useNavigate();
  const { complaints } = data;

  const openTickets = complaints.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS");
  const resolvedThisMonth = complaints.filter((c) => {
    if (!c.resolvedAt) return false;
    const d = new Date(c.resolvedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const stats = [
    { icon: IconAlertCircle, label: "Assigned Tickets", value: complaints.length, tint: "info" },
    { icon: IconClock, label: "Open / In Progress", value: openTickets.length, tint: "warning" },
    { icon: IconShield, label: "Resolved This Month", value: resolvedThisMonth.length, tint: "success" },
  ];

  const complaintColumns = [
    { key: "ticketNumber", header: "Ticket", className: "font-medium text-ink" },
    { key: "title", header: "Issue" },
    { key: "flatId", header: "Flat", render: (r) => flatLabel(r.flatId) },
    {
      key: "priority",
      header: "Priority",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status}>{COMPLAINT_STATUS_LABEL[r.status]}</StatusBadge>,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader eyebrow="Overview" title="Maintenance Dashboard" subtitle={today()} />
        <Button variant="outline" size="md" onClick={() => navigate(ROUTES.COMPLAINTS)}>
          View all tickets
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Table
        title="Assigned Tickets"
        columns={complaintColumns}
        data={complaints}
        searchable={false}
        pageSize={8}
        emptyIcon={IconAlertCircle}
        emptyTitle="No tickets assigned to you yet"
      />
    </div>
  );
}
