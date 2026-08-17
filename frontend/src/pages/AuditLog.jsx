import { useEffect, useState } from "react";
import * as auditLogService from "@/services/auditLogService";
import Table from "@/components/ui/Table";
import Loader from "@/components/ui/Loader";
import { formatDate } from "@/lib/date";
import { IconHistory } from "@/components/ui/icons";

const ACTION_LABEL = (action) =>
  action
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        setLogs(await auditLogService.getAuditLogs());
      } catch (err) {
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = [
    {
      key: "action",
      header: "Action",
      className: "font-medium text-ink",
      render: (r) => ACTION_LABEL(r.action),
      exportValue: (r) => ACTION_LABEL(r.action),
    },
    { key: "targetEntity", header: "Entity" },
    { key: "performedBy", header: "Performed By", render: (r) => r.performedBy?.name || "System", searchValue: (r) => r.performedBy?.name || "" },
    { key: "performedByRole", header: "Role", render: (r) => r.performedBy?.role || "—" },
    {
      key: "details",
      header: "Details",
      render: (r) => (
        <span className="text-xs text-ink-faint">
          {r.details && Object.keys(r.details).length ? JSON.stringify(r.details) : "—"}
        </span>
      ),
    },
    { key: "createdAt", header: "When", align: "right", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Administration</p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Audit Log</h1>
        <p className="mt-1.5 text-[15px] text-ink-faint">Trail of security-sensitive actions across the society — status changes, payments, and account edits</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading audit trail..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <Table
          title="Recent Activity"
          columns={columns}
          data={logs}
          pageSize={15}
          searchPlaceholder="Search audit log..."
          exportFileName="audit-log"
          emptyIcon={IconHistory}
          emptyTitle="No audit activity yet"
        />
      )}
    </div>
  );
}
