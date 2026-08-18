import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as authService from "@/services/authService";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ImageUpload from "@/components/ui/ImageUpload";
import Loader from "@/components/ui/Loader";
import { ROLE_LABELS } from "@/constants";
import { IconPlus, IconTrash, IconLock } from "@/components/ui/icons";

const VEHICLE_TYPES = ["2-Wheeler", "4-Wheeler", "Other"];
const ROLE_VARIANT = { Admin: "info", Resident: "neutral", Guard: "warning", Staff: "success" };

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    authService
      .getMyProfile()
      .then((profile) => {
        setForm({ name: profile.name || "", phone: profile.phone || "" });
        setVehicles(profile.vehicles || []);
        setContacts(profile.emergencyContacts || []);
        setFamilyMembers(profile.familyMembers || []);
      })
      .catch((err) => setError(err.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const addVehicle = () => setVehicles([...vehicles, { type: "2-Wheeler", vehicleNumber: "" }]);
  const updateVehicle = (i, key, value) => setVehicles(vehicles.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
  const removeVehicle = (i) => setVehicles(vehicles.filter((_, idx) => idx !== i));

  const addContact = () => setContacts([...contacts, { name: "", phone: "", relation: "" }]);
  const updateContact = (i, key, value) => setContacts(contacts.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  const removeContact = (i) => setContacts(contacts.filter((_, idx) => idx !== i));

  const addFamilyMember = () => setFamilyMembers([...familyMembers, { name: "", relation: "", age: "" }]);
  const updateFamilyMember = (i, key, value) => setFamilyMembers(familyMembers.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  const removeFamilyMember = (i) => setFamilyMembers(familyMembers.filter((_, idx) => idx !== i));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        name: form.name,
        phone: form.phone,
        avatar: avatarFile || undefined,
        vehicles: vehicles.filter((v) => v.vehicleNumber.trim()),
        emergencyContacts: contacts.filter((c) => c.name.trim() && c.phone.trim()),
        familyMembers: familyMembers
          .filter((m) => m.name.trim() && m.relation.trim())
          .map((m) => ({ name: m.name, relation: m.relation, age: m.age === "" ? null : Number(m.age) })),
      });
      setUser(updated);
      setAvatarFile(null);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwSaving(true);
    try {
      await authService.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwSuccess("Password changed successfully");
    } catch (err) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Account</p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">My Profile</h1>
        <p className="mt-1.5 text-[15px] text-ink-faint">Manage your personal details, family members, vehicles, and emergency contacts</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
            {success}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-black dark:from-zinc-800 dark:via-zinc-700 dark:to-black">
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            />
            <div className="absolute -right-8 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-10 bottom-[-4rem] h-40 w-40 rounded-full bg-white/[0.06] blur-3xl" />
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <div className="-mt-12 shrink-0">
              <ImageUpload
                value={user?.avatar?.url}
                onChange={setAvatarFile}
                shape="circle"
                initials={user?.name?.charAt(0)?.toUpperCase()}
                ringClassName="ring-4 ring-surface"
              />
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3 pb-1">
              <div>
                <p className="text-lg font-semibold text-ink">{user?.name}</p>
                <p className="text-sm text-ink-faint">{user?.email}</p>
              </div>
              <Badge variant={ROLE_VARIANT[user?.role] || "neutral"}>{ROLE_LABELS[user?.role] || user?.role}</Badge>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-base font-semibold text-ink">Basic Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Family / Tenant Members</h2>
            <Button type="button" variant="outline" size="sm" onClick={addFamilyMember}>
              <IconPlus className="h-4 w-4" /> Add member
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {familyMembers.length === 0 && <p className="text-sm text-ink-ghost">No family or tenant members added yet.</p>}
            {familyMembers.map((m, i) => (
              <div key={i} className="flex items-end gap-3">
                <TextField label="Name" className="flex-1" value={m.name} onChange={(e) => updateFamilyMember(i, "name", e.target.value)} />
                <TextField label="Relation" className="w-36" value={m.relation} onChange={(e) => updateFamilyMember(i, "relation", e.target.value)} placeholder="e.g. Spouse, Tenant" />
                <TextField
                  label="Age"
                  type="number"
                  className="w-24"
                  value={m.age}
                  onChange={(e) => updateFamilyMember(i, "age", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeFamilyMember(i)}
                  className="mb-1 rounded-lg p-2.5 text-ink-ghost transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Vehicles</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVehicle}>
              <IconPlus className="h-4 w-4" /> Add vehicle
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {vehicles.length === 0 && <p className="text-sm text-ink-ghost">No vehicles added yet.</p>}
            {vehicles.map((v, i) => (
              <div key={i} className="flex items-end gap-3">
                <SelectField
                  label="Type"
                  className="w-40"
                  value={v.type}
                  onChange={(e) => updateVehicle(i, "type", e.target.value)}
                  options={VEHICLE_TYPES.map((t) => ({ label: t, value: t }))}
                />
                <TextField
                  label="Vehicle number"
                  className="flex-1"
                  value={v.vehicleNumber}
                  onChange={(e) => updateVehicle(i, "vehicleNumber", e.target.value)}
                  placeholder="e.g. LEC-1234"
                />
                <button
                  type="button"
                  onClick={() => removeVehicle(i)}
                  className="mb-1 rounded-lg p-2.5 text-ink-ghost transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Emergency Contacts</h2>
            <Button type="button" variant="outline" size="sm" onClick={addContact}>
              <IconPlus className="h-4 w-4" /> Add contact
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {contacts.length === 0 && <p className="text-sm text-ink-ghost">No emergency contacts added yet.</p>}
            {contacts.map((c, i) => (
              <div key={i} className="flex items-end gap-3">
                <TextField label="Name" className="flex-1" value={c.name} onChange={(e) => updateContact(i, "name", e.target.value)} />
                <TextField label="Phone" className="flex-1" value={c.phone} onChange={(e) => updateContact(i, "phone", e.target.value)} />
                <TextField label="Relation" className="w-32" value={c.relation} onChange={(e) => updateContact(i, "relation", e.target.value)} />
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="mb-1 rounded-lg p-2.5 text-ink-ghost transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/[0.06] text-ink-dim">
            <IconLock className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-ink">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          {pwError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
              {pwSuccess}
            </div>
          )}
          <TextField
            label="Current password"
            type="password"
            required
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="New password"
              type="password"
              required
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
            <TextField
              label="Confirm new password"
              type="password"
              required
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" disabled={pwSaving}>
              {pwSaving ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
