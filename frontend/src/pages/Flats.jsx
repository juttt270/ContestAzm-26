import { useEffect, useState } from "react";
import * as flatService from "@/services/flatService";
import * as userService from "@/services/userService";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import StatCard from "@/components/ui/StatCard";
import Loader from "@/components/ui/Loader";
import {
  validateRequired,
  validateFlatNumber,
  validatePositiveNumber,
} from "@/utils/validators";
import { IconPlus, IconUserPlus, IconBuilding } from "@/components/ui/icons";

const OCCUPANCY_VARIANT = { Owner: "success", Tenant: "info", Vacant: "neutral" };
const emptyCreateForm = { blockName: "", flatNumber: "", floor: "", maintenanceRate: "3000" };

export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [createError, setCreateError] = useState("");

  const [assignTarget, setAssignTarget] = useState(null);
  const [residents, setResidents] = useState([]);
  const [assignForm, setAssignForm] = useState({ userId: "", occupancyType: "Owner" });
  const [assignFieldErrors, setAssignFieldErrors] = useState({});
  const [assignError, setAssignError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [flatsData, occupancyData] = await Promise.all([flatService.getFlats(), flatService.getOccupancyMap()]);
      setFlats(flatsData);
      setOccupancy(occupancyData);
    } catch (err) {
      setError(err.message || "Failed to load flats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAssign = async (row) => {
    setAssignTarget(row);
    setAssignForm({ userId: "", occupancyType: "Owner" });
    setAssignFieldErrors({});
    setAssignError("");
    try {
      setResidents(await userService.getUsers({ role: "Resident", isActive: "true" }));
    } catch {
      setResidents([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    const blockErr = validateRequired(createForm.blockName, "Block name", 1, 15);
    const flatErr = validateFlatNumber(createForm.flatNumber);
    const floorErr = validatePositiveNumber(createForm.floor, "Floor", 0, 150);
    const rateErr = validatePositiveNumber(createForm.maintenanceRate, "Maintenance rate", 1);

    if (blockErr || flatErr || floorErr || rateErr) {
      setCreateFieldErrors({
        blockName: blockErr,
        flatNumber: flatErr,
        floor: floorErr,
        maintenanceRate: rateErr,
      });
      return;
    }
    setCreateFieldErrors({});
    setSubmitting(true);
    try {
      await flatService.createFlat({
        ...createForm,
        blockName: createForm.blockName.trim().toUpperCase(),
        flatNumber: createForm.flatNumber.trim(),
        floor: Number(createForm.floor),
        maintenanceRate: Number(createForm.maintenanceRate),
      });
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      fetchAll();
    } catch (err) {
      setCreateError(err.message || "Failed to create flat");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const userErr = validateRequired(assignForm.userId, "Resident selection");
    if (userErr) {
      setAssignFieldErrors({ userId: userErr });
      return;
    }
    setAssignFieldErrors({});
    setAssignError("");
    setSubmitting(true);
    try {
      await flatService.assignFlat(assignTarget._id, assignForm);
      setAssignTarget(null);
      fetchAll();
    } catch (err) {
      setAssignError(err.message || "Failed to assign flat");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "flatNumber", header: "Unit", className: "font-medium text-ink", render: (r) => `${r.blockName}-${r.flatNumber}` },
    { key: "floor", header: "Floor" },
    { key: "occupancyType", header: "Occupancy", render: (r) => <Badge variant={OCCUPANCY_VARIANT[r.occupancyType]}>{r.occupancyType}</Badge> },
    { key: "ownerId", header: "Owner", render: (r) => r.ownerId?.name || "—" },
    { key: "tenantId", header: "Tenant", render: (r) => r.tenantId?.name || "—" },
    { key: "maintenanceRate", header: "Rate", align: "right", render: (r) => `Rs ${r.maintenanceRate.toLocaleString()}` },
  ];

  const rowActions = (row) => [{ label: "Assign resident", icon: IconUserPlus, onClick: () => openAssign(row) }];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Administration</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Flats & Occupancy</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">Manage units and resident assignments</p>
        </div>
      </div>

      {occupancy && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={IconBuilding} label="Total Flats" value={occupancy.totalFlats} tint="neutral" />
          <StatCard
            icon={IconUserPlus}
            label="Occupied"
            value={occupancy.ownerOccupied + occupancy.tenantOccupied}
            sub={`${occupancy.ownerOccupied} owner · ${occupancy.tenantOccupied} tenant`}
            tint="success"
          />
          <StatCard icon={IconBuilding} label="Vacant" value={occupancy.vacant} tint="warning" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading flats..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <Table
          title="All Units"
          columns={columns}
          data={flats}
          pageSize={10}
          searchPlaceholder="Search flats..."
          exportFileName="flats"
          emptyIcon={IconBuilding}
          emptyTitle="No flats found"
          rowActions={rowActions}
          headerAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCreateForm(emptyCreateForm);
                setCreateError("");
                setCreateOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" />
              Add Flat
            </Button>
          }
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add new flat"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleCreate}>
              {submitting ? "Creating..." : "Create flat"}
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
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Block name"
              required
              error={createFieldErrors.blockName}
              value={createForm.blockName}
              onChange={(e) => {
                setCreateForm({ ...createForm, blockName: e.target.value });
                if (createFieldErrors.blockName) setCreateFieldErrors({ ...createFieldErrors, blockName: "" });
              }}
              placeholder="e.g. A"
            />
            <TextField
              label="Flat number"
              required
              error={createFieldErrors.flatNumber}
              value={createForm.flatNumber}
              onChange={(e) => {
                setCreateForm({ ...createForm, flatNumber: e.target.value });
                if (createFieldErrors.flatNumber) setCreateFieldErrors({ ...createFieldErrors, flatNumber: "" });
              }}
              placeholder="e.g. 101"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Floor"
              type="number"
              required
              error={createFieldErrors.floor}
              value={createForm.floor}
              onChange={(e) => {
                setCreateForm({ ...createForm, floor: e.target.value });
                if (createFieldErrors.floor) setCreateFieldErrors({ ...createFieldErrors, floor: "" });
              }}
            />
            <TextField
              label="Maintenance rate (Rs)"
              type="number"
              required
              error={createFieldErrors.maintenanceRate}
              value={createForm.maintenanceRate}
              onChange={(e) => {
                setCreateForm({ ...createForm, maintenanceRate: e.target.value });
                if (createFieldErrors.maintenanceRate) setCreateFieldErrors({ ...createFieldErrors, maintenanceRate: "" });
              }}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title={assignTarget ? `Assign ${assignTarget.blockName}-${assignTarget.flatNumber}` : ""}
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
            label="Resident"
            required
            error={assignFieldErrors.userId}
            value={assignForm.userId}
            onChange={(e) => {
              setAssignForm({ ...assignForm, userId: e.target.value });
              if (assignFieldErrors.userId) setAssignFieldErrors({ ...assignFieldErrors, userId: "" });
            }}
            options={[
              { label: residents.length ? "Select resident" : "No residents found", value: "" },
              ...residents.map((r) => ({ label: `${r.name} (${r.email})`, value: r._id })),
            ]}
          />
          <SelectField
            label="Occupancy type"
            value={assignForm.occupancyType}
            onChange={(e) => setAssignForm({ ...assignForm, occupancyType: e.target.value })}
            options={[
              { label: "Owner", value: "Owner" },
              { label: "Tenant", value: "Tenant" },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
