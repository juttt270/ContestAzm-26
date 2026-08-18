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
import { IconPlus, IconUserPlus, IconAlertCircle, IconClock } from "@/components/ui/icons";

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

  const rowActions =
    role === "Admin"
      ? (row) => [{ label: "Assign to staff", icon: IconUserPlus, onClick: () => openAssign(row) }]
      : role === "Staff"
        ? (row) => [
            {
              label: "Update status",
              icon: IconAlertCircle,
              onClick: () => {
                setStatusTarget(row);
                setStatusForm({ status: row.status, resolutionNotes: row.resolutionNotes || "" });
                setStatusError("");
              },
            },
          ]
        : undefined;

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
        size="sm"
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
    </div>
  );
}
