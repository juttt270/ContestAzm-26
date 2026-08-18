import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getComplaints, createComplaint, assignComplaint, updateComplaintStatus } from "@/services/complaintService";
import { getUsers } from "@/services/userService";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import TextareaField from "@/components/ui/TextareaField";
import ImageUpload from "@/components/ui/ImageUpload";
import Loader from "@/components/ui/Loader";
import { validateRequired } from "@/utils/validators";
import { IconPlus, IconUserPlus, IconAlertCircle, IconClock, IconEye } from "@/components/ui/icons";

const CATEGORIES = ["Plumbing", "Electrical", "Carpentry", "Security", "Cleanliness", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Emergency"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const STATUS_LABEL = { OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved", CLOSED: "Closed" };
const PRIORITY_VARIANT = { Low: "neutral", Medium: "info", High: "warning", Emergency: "danger" };

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");

const emptyForm = { title: "", category: CATEGORIES[0], priority: "Medium", description: "" };

export default function Complaints() {
  const { role } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailTarget, setDetailTarget] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [assignTarget, setAssignTarget] = useState(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assignFieldErrors, setAssignFieldErrors] = useState({});
  const [assignError, setAssignError] = useState("");

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: "IN_PROGRESS", resolutionNotes: "" });
  const [statusFieldErrors, setStatusFieldErrors] = useState({});
  const [statusError, setStatusError] = useState("");

  const canCreate = role === "Resident" || role === "Admin";

  const fetchComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openAssign = async (row) => {
    setAssignTarget(row);
    setSelectedStaff("");
    setAssignFieldErrors({});
    setAssignError("");
    try {
      const staff = await getUsers({ role: "Staff", isActive: "true" });
      setStaffOptions(staff);
    } catch {
      setStaffOptions([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    const titleErr = validateRequired(form.title, "Title", 3, 100);
    const descErr = validateRequired(form.description, "Description", 5, 1000);

    if (titleErr || descErr) {
      setFieldErrors({
        title: titleErr,
        description: descErr,
      });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await createComplaint({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        attachments: photoFile || undefined
      });
      setCreateOpen(false);
      setForm(emptyForm);
      setPhotoFile(null);
      fetchComplaints();
    } catch (err) {
      setFormError(err.message || "Failed to create complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const staffErr = validateRequired(selectedStaff, "Staff selection");
    if (staffErr) {
      setAssignFieldErrors({ staff: staffErr });
      return;
    }
    setAssignFieldErrors({});
    setAssignError("");
    setSubmitting(true);
    try {
      await assignComplaint(assignTarget._id, selectedStaff);
      setAssignTarget(null);
      fetchComplaints();
    } catch (err) {
      setAssignError(err.message || "Failed to assign ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusError("");
    if (statusForm.status === "RESOLVED" || statusForm.status === "CLOSED") {
      const notesErr = validateRequired(statusForm.resolutionNotes, "Resolution notes", 3, 500);
      if (notesErr) {
        setStatusFieldErrors({ resolutionNotes: notesErr });
        return;
      }
    }
    setStatusFieldErrors({});
    setSubmitting(true);
    try {
      await updateComplaintStatus(statusTarget._id, {
        ...statusForm,
        resolutionNotes: statusForm.resolutionNotes.trim(),
      });
      setStatusTarget(null);
      fetchComplaints();
    } catch (err) {
      setStatusError(err.message || "Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "ticketNumber", header: "Ticket", className: "font-medium text-ink" },
    { key: "title", header: "Title" },
    { key: "category", header: "Category" },
    {
      key: "priority",
      header: "Priority",
      render: (row) => <Badge variant={PRIORITY_VARIANT[row.priority]}>{row.priority}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const isOverdue = row.status !== "RESOLVED" && row.status !== "CLOSED" && row.slaDueDate && new Date(row.slaDueDate) < new Date();
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.status}>{STATUS_LABEL[row.status]}</StatusBadge>
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400" title={`SLA due ${formatDate(row.slaDueDate)}`}>
                <IconClock className="h-3.5 w-3.5" /> Overdue
              </span>
            )}
          </div>
        );
      },
      exportValue: (row) => STATUS_LABEL[row.status],
    },
    {
      key: "flatId",
      header: "Flat",
      render: (row) => flatLabel(row.flatId),
      searchValue: (row) => flatLabel(row.flatId),
      exportValue: (row) => flatLabel(row.flatId),
    },
    {
      key: "assignedStaffId",
      header: "Assigned To",
      render: (row) => row.assignedStaffId?.name || "Unassigned",
      searchValue: (row) => row.assignedStaffId?.name || "",
      exportValue: (row) => row.assignedStaffId?.name || "Unassigned",
    },
    {
      key: "createdAt",
      header: "Date",
      align: "right",
      render: (row) => formatDate(row.createdAt),
      exportValue: (row) => formatDate(row.createdAt),
    },
  ];

  const rowActions = (row) => {
    const actions = [
      {
        label: "View details",
        icon: IconEye,
        onClick: () => setDetailTarget(row),
      },
    ];

    if (role === "Admin") {
      actions.push({
        label: "Assign to staff",
        icon: IconUserPlus,
        onClick: () => openAssign(row),
      });
    }

    if (role === "Staff" || role === "Admin") {
      actions.push({
        label: "Update status",
        icon: IconAlertCircle,
        onClick: () => {
          setStatusTarget(row);
          setStatusForm({ status: row.status, resolutionNotes: row.resolutionNotes || "" });
          setStatusError("");
        },
      });
    }

    return actions;
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Helpdesk</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Complaints</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">
            {role === "Resident"
              ? "Your maintenance tickets"
              : role === "Staff"
                ? "Tickets assigned to you"
                : "All society complaint tickets"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading complaints..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : (
        <Table
          title="Complaint Tickets"
          columns={columns}
          data={complaints}
          pageSize={10}
          searchPlaceholder="Search tickets..."
          exportFileName="complaints"
          emptyIcon={IconAlertCircle}
          emptyTitle="No complaints found"
          emptyDescription={role === "Resident" ? "You haven't raised any tickets yet." : undefined}
          rowActions={rowActions}
          headerAction={
            canCreate && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setForm(emptyForm);
                  setFormError("");
                  setCreateOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4" />
                New Complaint
              </Button>
            )
          }
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setPhotoFile(null);
        }}
        title="Raise a new complaint"
        description="Our maintenance team will get back to you based on priority."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateOpen(false);
                setPhotoFile(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleCreate}>
              {submitting ? "Submitting..." : "Submit ticket"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}
          <TextField
            label="Title"
            required
            error={fieldErrors.title}
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: "" });
            }}
            placeholder="e.g. Water leakage in bathroom"
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
            <SelectField
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              options={PRIORITIES.map((p) => ({ label: p, value: p }))}
            />
          </div>
          <TextareaField
            label="Description"
            required
            error={fieldErrors.description}
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
            }}
            placeholder="Describe the issue in detail..."
          />
          <ImageUpload label="Photo (optional)" onChange={setPhotoFile} />
        </form>
      </Modal>

      <Modal
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title={assignTarget ? `Assign ${assignTarget.ticketNumber}` : ""}
        description="Route this ticket to a maintenance staff member."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssignTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleAssign}>
              {submitting ? "Assigning..." : "Assign"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssign} className="space-y-4">
          {assignError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {assignError}
            </div>
          )}
          <SelectField
            label="Staff member"
            required
            error={assignFieldErrors.staff}
            value={selectedStaff}
            onChange={(e) => {
              setSelectedStaff(e.target.value);
              if (assignFieldErrors.staff) setAssignFieldErrors({ ...assignFieldErrors, staff: "" });
            }}
            options={[
              { label: staffOptions.length ? "Select staff" : "No staff members found", value: "" },
              ...staffOptions.map((s) => ({ label: s.profession ? `${s.name} — ${s.profession}` : s.name, value: s._id })),
            ]}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title={statusTarget ? `Update ${statusTarget.ticketNumber}` : ""}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleStatusUpdate}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        {statusTarget && (
          <div className="rounded-xl border border-line bg-surface-faint p-3.5 text-xs space-y-2 mb-4">
            <div className="flex justify-between items-center font-medium border-b border-line pb-2">
              <span className="text-ink font-semibold">{statusTarget.ticketNumber}: {statusTarget.title}</span>
              <span className="text-ink-faint">Flat: <b>{flatLabel(statusTarget.flatId)}</b></span>
            </div>
            {statusTarget.residentId?.name && (
              <p className="text-ink-faint">
                Resident: <b className="text-ink">{statusTarget.residentId.name}</b> {statusTarget.residentId.phone && <a href={`tel:${statusTarget.residentId.phone}`} className="text-primary hover:underline ml-1">📞 {statusTarget.residentId.phone}</a>}
              </p>
            )}
            <p className="text-ink leading-relaxed font-normal bg-surface p-2.5 rounded-lg border border-line">{statusTarget.description}</p>
            {statusTarget.attachments && statusTarget.attachments.length > 0 && (
              <div className="pt-1">
                <p className="font-semibold text-ink-faint mb-1.5">Attached Photos ({statusTarget.attachments.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {statusTarget.attachments.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="block group relative rounded overflow-hidden border border-line w-16 h-12">
                      <img src={att.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          {statusError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {statusError}
            </div>
          )}
          <SelectField
            label="Status"
            value={statusForm.status}
            onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
            options={STATUSES.map((s) => ({ label: STATUS_LABEL[s], value: s }))}
          />
          <TextareaField
            label="Resolution notes"
            error={statusFieldErrors.resolutionNotes}
            value={statusForm.resolutionNotes}
            onChange={(e) => {
              setStatusForm({ ...statusForm, resolutionNotes: e.target.value });
              if (statusFieldErrors.resolutionNotes) setStatusFieldErrors({ ...statusFieldErrors, resolutionNotes: "" });
            }}
            placeholder="What was done to resolve this?"
          />
        </form>
      </Modal>

      {/* Full Detail Modal */}
      <Modal
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        title={detailTarget ? `${detailTarget.ticketNumber} — ${detailTarget.title}` : ""}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setDetailTarget(null)}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              {role === "Admin" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const t = detailTarget;
                    setDetailTarget(null);
                    openAssign(t);
                  }}
                >
                  <IconUserPlus className="h-4 w-4" />
                  Assign Staff
                </Button>
              )}
              {(role === "Staff" || role === "Admin") && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const t = detailTarget;
                    setDetailTarget(null);
                    setStatusTarget(t);
                    setStatusForm({ status: t.status, resolutionNotes: t.resolutionNotes || "" });
                    setStatusError("");
                  }}
                >
                  <IconAlertCircle className="h-4 w-4" />
                  Update Status
                </Button>
              )}
            </div>
          </div>
        }
      >
        {detailTarget && (
          <div className="space-y-5 text-sm">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
              <Badge variant={PRIORITY_VARIANT[detailTarget.priority]}>{detailTarget.priority} Priority</Badge>
              <StatusBadge status={detailTarget.status}>{STATUS_LABEL[detailTarget.status]}</StatusBadge>
              <span className="text-xs text-ink-faint">Category: <b className="text-ink">{detailTarget.category}</b></span>
              <span className="text-xs text-ink-faint ml-auto">Created: <b>{formatDate(detailTarget.createdAt)}</b></span>
            </div>

            {/* Resident & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-line bg-surface-faint p-3.5">
              <div>
                <p className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Resident Details</p>
                <p className="font-semibold text-ink mt-1">{detailTarget.residentId?.name || "N/A"}</p>
                {detailTarget.residentId?.phone && (
                  <a href={`tel:${detailTarget.residentId.phone}`} className="text-xs text-primary hover:underline block mt-0.5 font-medium">
                    📞 {detailTarget.residentId.phone}
                  </a>
                )}
                {detailTarget.residentId?.email && (
                  <p className="text-xs text-ink-faint mt-0.5">{detailTarget.residentId.email}</p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Flat & Staff Routing</p>
                <p className="font-semibold text-ink mt-1">Flat: {flatLabel(detailTarget.flatId)}</p>
                <p className="text-xs text-ink-faint mt-1">
                  Assigned Staff: <b className="text-ink">{detailTarget.assignedStaffId?.name || "Unassigned"}</b>
                  {detailTarget.assignedStaffId?.phone && <span className="ml-1 text-primary">({detailTarget.assignedStaffId.phone})</span>}
                </p>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Complaint Description</h4>
              <p className="text-ink whitespace-pre-wrap rounded-xl border border-line bg-surface p-3.5 leading-relaxed text-sm">
                {detailTarget.description}
              </p>
            </div>

            {/* Photo Attachments */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Attached Photos ({detailTarget.attachments?.length || 0})
              </h4>
              {detailTarget.attachments && detailTarget.attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailTarget.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video overflow-hidden rounded-xl border border-line bg-surface-faint transition hover:shadow-md"
                    >
                      <img
                        src={att.url}
                        alt={`Attachment ${idx + 1}`}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                        View Photo 🔍
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-faint italic bg-surface-faint p-3 rounded-xl border border-line">
                  No photos were attached with this complaint ticket.
                </p>
              )}
            </div>

            {/* Resolution Notes */}
            {detailTarget.resolutionNotes && (
              <div className="space-y-1.5 border-t border-line pt-3.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                  Resolution Notes
                </h4>
                <p className="text-ink rounded-xl border border-green-500/20 bg-green-500/5 p-3.5 text-sm">
                  {detailTarget.resolutionNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
