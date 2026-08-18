import { useEffect, useState } from "react";
import * as userService from "@/services/userService";
import * as authService from "@/services/authService";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Loader from "@/components/ui/Loader";
import { formatDate } from "@/lib/date";
import { ROLE_LABELS } from "@/constants";
import { IconPlus, IconPencil, IconTrash, IconUsers, IconCar, IconLock, IconWrench, IconShield, IconUser } from "@/components/ui/icons";
import { validateEmail, validatePhone, validatePassword, validateName, sanitizeInput } from "@/utils/validation";

const ROLES = ["Resident", "Guard", "Staff", "Admin"];
const ROLE_ICON = { Resident: IconUsers, Guard: IconShield, Staff: IconWrench, Admin: IconUser };
const PROFESSIONS = ["Plumber", "Electrician", "Carpenter", "Painter", "AC Technician", "Cleaner", "General Maintenance", "Other"];
const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");

const emptyCreateForm = { name: "", email: "", phone: "", password: "", role: "Resident", profession: "" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("Resident");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createError, setCreateError] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ role: "Resident", status: "ACTIVE" });
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [vehiclesTarget, setVehiclesTarget] = useState(null);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetForm, setResetForm] = useState({ newPassword: "", confirmPassword: "" });
  const [resetError, setResetError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await userService.getUsers());
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");

    const nameErr = validateName(createForm.name, "User Name");
    if (nameErr) return setCreateError(nameErr);

    const emailErr = validateEmail(createForm.email);
    if (emailErr) return setCreateError(emailErr);

    const phoneErr = validatePhone(createForm.phone);
    if (phoneErr) return setCreateError(phoneErr);

    const passErr = validatePassword(createForm.password);
    if (passErr) return setCreateError(passErr);

    setSubmitting(true);
    try {
      await authService.register({
        ...createForm,
        name: sanitizeInput(createForm.name),
        email: sanitizeInput(createForm.email),
        phone: sanitizeInput(createForm.phone),
      });
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      fetchUsers();
    } catch (err) {
      setCreateError(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError("");
    setSubmitting(true);
    try {
      await userService.updateUserStatus(editTarget._id, editForm);
      setEditTarget(null);
      fetchUsers();
    } catch (err) {
      setEditError(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await userService.deleteUser(deleteTarget._id);
    fetchUsers();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    const passErr = validatePassword(resetForm.newPassword);
    if (passErr) {
      setResetError(passErr);
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await userService.resetPassword(resetTarget._id, resetForm.newPassword);
      setResetTarget(null);
    } catch (err) {
      setResetError(err.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleUsers = users.filter((u) => u.role === activeTab);

  const TABS = ROLES.map((r) => ({
    key: r,
    label: ROLE_LABELS[r] || r,
    icon: ROLE_ICON[r],
    count: users.filter((u) => u.role === r).length,
  }));

  const columns = [
    { key: "name", header: "Name", className: "font-medium text-ink" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    ...(activeTab === "Staff" ? [{ key: "profession", header: "Profession", render: (r) => r.profession || "—" }] : []),
    ...(activeTab === "Resident"
      ? [
          { key: "flatId", header: "Flat", render: (r) => flatLabel(r.flatId), searchValue: (r) => flatLabel(r.flatId) },
          {
            key: "vehicles",
            header: "Vehicles",
            render: (r) => r.vehicles?.length || "—",
            exportValue: (r) => r.vehicles?.length || 0,
          },
        ]
      : []),
    {
      key: "isActive",
      header: "Status",
      render: (r) => <Badge variant={r.isActive ? "success" : "danger"}>{r.isActive ? "Active" : "Inactive"}</Badge>,
      exportValue: (r) => (r.isActive ? "Active" : "Inactive"),
    },
    { key: "createdAt", header: "Joined", align: "right", render: (r) => formatDate(r.createdAt) },
  ];

  const rowActions = (row) => [
    ...(row.vehicles?.length ? [{ label: "View vehicles", icon: IconCar, onClick: () => setVehiclesTarget(row) }] : []),
    {
      label: "Edit role / status",
      icon: IconPencil,
      onClick: () => {
        setEditTarget(row);
        setEditForm({ role: row.role, isActive: row.isActive, profession: row.profession || "" });
        setEditError("");
      },
    },
    {
      label: "Reset password",
      icon: IconLock,
      onClick: () => {
        setResetTarget(row);
        setResetForm({ newPassword: "", confirmPassword: "" });
        setResetError("");
      },
    },
    { label: "Delete user", icon: IconTrash, danger: true, onClick: () => setDeleteTarget(row) },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Administration</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Users</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">Manage residents, guards, and maintenance staff</p>
        </div>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
              activeTab === tab.key ? "bg-ink text-canvas shadow-sm" : "text-ink-faint hover:text-ink"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                activeTab === tab.key ? "bg-canvas/20 text-canvas" : "bg-surface-hover text-ink-dim"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading users..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <Table
          title={ROLE_LABELS[activeTab] || activeTab}
          columns={columns}
          data={visibleUsers}
          pageSize={10}
          searchPlaceholder={`Search ${(ROLE_LABELS[activeTab] || activeTab).toLowerCase()}...`}
          exportFileName={`users-${activeTab.toLowerCase()}`}
          emptyIcon={IconUsers}
          emptyTitle={`No ${(ROLE_LABELS[activeTab] || activeTab).toLowerCase()} found`}
          rowActions={rowActions}
          headerAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCreateForm({ ...emptyCreateForm, role: activeTab });
                setCreateError("");
                setCreateOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" />
              Add {ROLE_LABELS[activeTab] || activeTab}
            </Button>
          }
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add new user"
        description="Create an account for a resident, guard, or staff member."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleCreate}>
              {submitting ? "Creating..." : "Create user"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {createError}
            </div>
          )}
          <TextField label="Full name" required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <TextField label="Email" type="email" required value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Phone" required value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
            <TextField
              label="Password"
              type="password"
              required
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
          </div>
          <SelectField
            label="Role"
            value={createForm.role}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value, profession: e.target.value === "Staff" ? createForm.profession : "" })}
            options={ROLES.map((r) => ({ label: ROLE_LABELS[r] || r, value: r }))}
          />
          {createForm.role === "Staff" && (
            <SelectField
              label="Profession / Specialty"
              required
              value={createForm.profession}
              onChange={(e) => setCreateForm({ ...createForm, profession: e.target.value })}
              options={[{ label: "Select profession", value: "" }, ...PROFESSIONS.map((p) => ({ label: p, value: p }))]}
            />
          )}
        </form>
      </Modal>

      <Modal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `Edit ${editTarget.name}` : ""}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleEdit}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {editError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {editError}
            </div>
          )}
          <SelectField
            label="Role"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            options={ROLES.map((r) => ({ label: ROLE_LABELS[r] || r, value: r }))}
          />
          {editForm.role === "Staff" && (
            <SelectField
              label="Profession / Specialty"
              value={editForm.profession}
              onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
              options={[{ label: "Select profession", value: "" }, ...PROFESSIONS.map((p) => ({ label: p, value: p }))]}
            />
          )}
          <SelectField
            label="Status"
            value={editForm.isActive ? "true" : "false"}
            onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(vehiclesTarget)}
        onClose={() => setVehiclesTarget(null)}
        title={vehiclesTarget ? `${vehiclesTarget.name}'s vehicles` : ""}
        description="Registered vehicles are checked at the gate for entry."
        size="sm"
      >
        <ul className="space-y-2">
          {vehiclesTarget?.vehicles?.map((v, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-canvas px-3.5 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink/[0.06] text-ink-dim">
                <IconCar className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{v.vehicleNumber}</p>
                <p className="text-xs text-ink-ghost">{v.type}</p>
              </div>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        title={resetTarget ? `Reset password for ${resetTarget.name}` : ""}
        description="They will need to sign in with this new password — no email is sent."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setResetTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleResetPassword}>
              {submitting ? "Resetting..." : "Reset password"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {resetError}
            </div>
          )}
          <TextField
            label="New password"
            type="password"
            required
            value={resetForm.newPassword}
            onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
          />
          <TextField
            label="Confirm new password"
            type="password"
            required
            value={resetForm.confirmPassword}
            onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this user?"
        description={deleteTarget ? `${deleteTarget.name} will permanently lose access to SmartSociety.` : ""}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
