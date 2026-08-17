import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as billingService from "@/services/billingService";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Loader from "@/components/ui/Loader";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { downloadBillReceipt } from "@/lib/generateReceipt";
import { IconCreditCard, IconPlus, IconAlertCircle, IconEye, IconDownload } from "@/components/ui/icons";

const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");
const STATUS_LABEL = { PENDING: "Pending", PAID: "Paid", OVERDUE: "Overdue" };

function currentBillingMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Billing() {
  const { role } = useAuth();
  const [bills, setBills] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({ billingMonth: currentBillingMonth(), dueDate: "" });
  const [generateError, setGenerateError] = useState("");

  const [penaltyOpen, setPenaltyOpen] = useState(false);

  const [payTarget, setPayTarget] = useState(null);
  const [payMethod, setPayMethod] = useState("SIMULATED_CARD");
  const [payError, setPayError] = useState("");

  const [breakdownTarget, setBreakdownTarget] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const tasks = [billingService.getBills()];
      if (role === "Admin") tasks.push(billingService.getCollectionReport());
      const [billsData, reportData] = await Promise.all(tasks);
      setBills(billsData);
      if (reportData) setReport(reportData);
    } catch (err) {
      setError(err.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerateError("");
    setSubmitting(true);
    try {
      await billingService.generateMonthlyBills(generateForm);
      setGenerateOpen(false);
      fetchAll();
    } catch (err) {
      setGenerateError(err.message || "Failed to generate bills");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPenalties = async () => {
    await billingService.applyOverduePenalties({ penaltyPercentage: 5 });
    fetchAll();
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPayError("");
    setSubmitting(true);
    try {
      await billingService.payBill(payTarget._id, { paymentMethod: payMethod });
      setPayTarget(null);
      fetchAll();
    } catch (err) {
      setPayError(err.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "billNumber", header: "Invoice", className: "font-medium text-ink" },
    { key: "flatId", header: "Flat", render: (r) => flatLabel(r.flatId), searchValue: (r) => flatLabel(r.flatId) },
    ...(role === "Admin" ? [{ key: "residentId", header: "Resident", render: (r) => r.residentId?.name || "—" }] : []),
    { key: "billingMonth", header: "Month" },
    { key: "amountDue", header: "Amount", align: "right", render: (r) => formatCurrency(r.amountDue + (r.penaltyAmount || 0)) },
    { key: "dueDate", header: "Due", align: "right", render: (r) => formatDate(r.dueDate) },
    {
      key: "paymentStatus",
      header: "Status",
      render: (r) => <StatusBadge status={r.paymentStatus}>{STATUS_LABEL[r.paymentStatus]}</StatusBadge>,
      exportValue: (r) => STATUS_LABEL[r.paymentStatus],
    },
  ];

  const rowActions = (row) => [
    { label: "View breakdown", icon: IconEye, onClick: () => setBreakdownTarget(row) },
    ...(role === "Resident" && row.paymentStatus !== "PAID"
      ? [
          {
            label: "Pay now",
            icon: IconCreditCard,
            onClick: () => {
              setPayTarget(row);
              setPayError("");
              setPayMethod("SIMULATED_CARD");
            },
          },
        ]
      : []),
    ...(role === "Resident" && row.paymentStatus === "PAID"
      ? [{ label: "Download receipt", icon: IconDownload, onClick: () => downloadBillReceipt(row) }]
      : []),
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Finance</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Billing</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">
            {role === "Admin" ? "Monthly maintenance invoicing & collections" : "Your maintenance invoices"}
          </p>
        </div>
        {role === "Admin" && (
          <div className="flex gap-2.5">
            <Button variant="outline" size="md" onClick={() => setPenaltyOpen(true)}>
              Apply Penalties
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setGenerateForm({ billingMonth: currentBillingMonth(), dueDate: "" });
                setGenerateError("");
                setGenerateOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" />
              Generate Monthly Bills
            </Button>
          </div>
        )}
      </div>

      {report && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={IconCreditCard} label="Total Invoiced" value={formatCurrency(report.totalInvoiced)} tint="neutral" />
          <StatCard icon={IconCreditCard} label="Total Collected" value={formatCurrency(report.totalCollected)} tint="success" />
          <StatCard icon={IconAlertCircle} label="Pending Dues" value={formatCurrency(report.pendingDues)} tint="warning" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading bills..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <Table
          title="Maintenance Bills"
          columns={columns}
          data={bills}
          pageSize={10}
          searchPlaceholder="Search bills..."
          exportFileName="bills"
          emptyIcon={IconCreditCard}
          emptyTitle="No bills found"
          rowActions={rowActions}
        />
      )}

      <Modal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        title="Generate monthly bills"
        description="Creates invoices for every occupied flat that doesn't already have one this month."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleGenerate}>
              {submitting ? "Generating..." : "Generate"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          {generateError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {generateError}
            </div>
          )}
          <TextField
            label="Billing month"
            required
            placeholder="YYYY-MM"
            value={generateForm.billingMonth}
            onChange={(e) => setGenerateForm({ ...generateForm, billingMonth: e.target.value })}
          />
          <TextField
            label="Due date"
            type="date"
            required
            value={generateForm.dueDate}
            onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={penaltyOpen}
        onClose={() => setPenaltyOpen(false)}
        onConfirm={handleApplyPenalties}
        title="Apply overdue penalties?"
        description="Adds a 5% penalty to every unpaid bill that has passed its due date."
        confirmLabel="Apply"
        variant="danger"
      />

      <Modal
        open={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title={payTarget ? `Pay ${payTarget.billNumber}` : ""}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPayTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handlePay}>
              {submitting ? "Processing..." : "Pay now"}
            </Button>
          </>
        }
      >
        <form onSubmit={handlePay} className="space-y-4">
          {payError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {payError}
            </div>
          )}
          {payTarget && (
            <p className="text-sm text-ink-faint">
              Amount due: <span className="font-semibold text-ink">{formatCurrency(payTarget.amountDue + (payTarget.penaltyAmount || 0))}</span>
            </p>
          )}
          <SelectField
            label="Payment method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={[
              { label: "Simulated Card", value: "SIMULATED_CARD" },
              { label: "UPI", value: "UPI" },
              { label: "Net Banking", value: "NET_BANKING" },
              { label: "Cash", value: "CASH" },
            ]}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(breakdownTarget)}
        onClose={() => setBreakdownTarget(null)}
        title={breakdownTarget ? `${breakdownTarget.billNumber} — Charges Breakdown` : ""}
        description={breakdownTarget ? `${breakdownTarget.billingMonth} · ${flatLabel(breakdownTarget.flatId)}` : ""}
        size="sm"
        footer={
          breakdownTarget?.paymentStatus === "PAID" &&
          role === "Resident" && (
            <Button variant="primary" size="sm" onClick={() => downloadBillReceipt(breakdownTarget)}>
              <IconDownload className="h-4 w-4" /> Download receipt
            </Button>
          )
        }
      >
        {breakdownTarget && (
          <div className="space-y-2">
            {[
              ["Water Charges", breakdownTarget.breakdown?.waterCharges],
              ["Security Charges", breakdownTarget.breakdown?.securityCharges],
              ["Repair Charges", breakdownTarget.breakdown?.repairCharges],
              ["Common Area Charges", breakdownTarget.breakdown?.commonAreaCharges],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm">
                <span className="text-ink-faint">{label}</span>
                <span className="font-medium text-ink">{formatCurrency(value || 0)}</span>
              </div>
            ))}
            {breakdownTarget.penaltyAmount > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm">
                <span className="text-red-600 dark:text-red-400">Overdue Penalty</span>
                <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(breakdownTarget.penaltyAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-line-soft px-1 pt-3 text-sm font-semibold text-ink">
              <span>Total</span>
              <span>{formatCurrency(breakdownTarget.amountDue + (breakdownTarget.penaltyAmount || 0))}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
