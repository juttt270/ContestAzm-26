import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as emergencyService from "@/services/emergencyService";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import TextField from "@/components/ui/TextField";
import Loader from "@/components/ui/Loader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/date";
import {
  validateName,
  validatePhone,
  validateRequired,
} from "@/utils/validators";
import { IconSiren, IconShield, IconCheck, IconPhone, IconPlus, IconTrash } from "@/components/ui/icons";

const ALERT_TYPES = ["Fire", "Medical", "Security", "LiftStuck", "General"];
const CONTACT_TYPES = ["Society Office", "Security", "Ambulance", "Fire", "Police", "Maintenance", "Other"];
const emptyContactForm = { name: "", designation: "", phone: "", type: "Society Office" };

export default function Emergency() {
  const { role } = useAuth();
  const isAdmin = role === "Admin";
  const [tab, setTab] = useState("alerts");

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [triggerOpen, setTriggerOpen] = useState(false);
  const [form, setForm] = useState({ alertType: "Security", locationDetails: "" });
  const [formFieldErrors, setFormFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState(emptyContactForm);
  const [contactFieldErrors, setContactFieldErrors] = useState({});
  const [contactError, setContactError] = useState("");
  const [deleteContactTarget, setDeleteContactTarget] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      setAlerts(await emergencyService.getActiveAlerts());
    } catch (err) {
      setError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      setContacts(await emergencyService.getEmergencyContacts());
    } catch {
      // silent — contacts are secondary to alerts
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchContacts();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setContactError("");
    const nameErr = validateName(contactForm.name, "Contact name");
    const phoneErr = validatePhone(contactForm.phone, "Phone number");
    const desigErr = validateRequired(contactForm.designation, "Designation", 2, 50);

    if (nameErr || phoneErr || desigErr) {
      setContactFieldErrors({
        name: nameErr,
        phone: phoneErr,
        designation: desigErr,
      });
      return;
    }
    setContactFieldErrors({});
    setSubmitting(true);
    try {
      await emergencyService.createEmergencyContact({
        ...contactForm,
        name: contactForm.name.trim(),
        phone: contactForm.phone.trim(),
        designation: contactForm.designation.trim(),
      });
      setContactOpen(false);
      setContactForm(emptyContactForm);
      fetchContacts();
    } catch (err) {
      setContactError(err.message || "Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async () => {
    await emergencyService.deleteEmergencyContact(deleteContactTarget._id);
    fetchContacts();
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    setFormError("");
    const locErr = validateRequired(form.locationDetails, "Location details", 3, 150);
    if (locErr) {
      setFormFieldErrors({ locationDetails: locErr });
      return;
    }
    setFormFieldErrors({});
    setSubmitting(true);
    try {
      await emergencyService.triggerAlert({
        ...form,
        locationDetails: form.locationDetails.trim(),
      });
      setTriggerOpen(false);
      setForm({ alertType: "Security", locationDetails: "" });
      fetchAlerts();
    } catch (err) {
      setFormError(err.message || "Failed to trigger alert");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    await emergencyService.resolveAlert(id);
    fetchAlerts();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading emergency alerts..." />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Safety</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Emergency</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">SOS alerts and the society's emergency contact directory</p>
        </div>
        {tab === "alerts" ? (
          <Button
            variant="danger"
            size="md"
            onClick={() => {
              setForm({ alertType: "Security", locationDetails: "" });
              setFormError("");
              setTriggerOpen(true);
            }}
          >
            <IconSiren className="h-4 w-4" />
            Trigger SOS Alert
          </Button>
        ) : (
          isAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setContactForm(emptyContactForm);
                setContactError("");
                setContactOpen(true);
              }}
            >
              <IconPlus className="h-4 w-4" />
              Add Contact
            </Button>
          )
        )}
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab("alerts")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
            tab === "alerts" ? "bg-ink text-canvas shadow-sm" : "text-ink-faint hover:text-ink"
          }`}
        >
          <IconSiren className="h-4 w-4" />
          Active Alerts
        </button>
        <button
          type="button"
          onClick={() => setTab("directory")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
            tab === "directory" ? "bg-ink text-canvas shadow-sm" : "text-ink-faint hover:text-ink"
          }`}
        >
          <IconPhone className="h-4 w-4" />
          Contact Directory
        </button>
      </div>

      {tab === "alerts" ? (
        <>
          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>}

          {alerts.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface">
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <IconShield className="h-5 w-5" />
                </span>
                <p className="text-base font-semibold text-ink">All clear</p>
                <p className="text-sm text-ink-ghost">No active emergency alerts right now</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {alerts.map((a) => (
                <div key={a._id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                      <IconSiren className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-ink">{a.alertType} Emergency</p>
                      <p className="text-sm text-ink-faint">{a.locationDetails}</p>
                    </div>
                  </div>
                  <p className="mt-3.5 text-xs text-ink-ghost">
                    Raised by {a.senderId?.name || "Unknown"} · {formatDate(a.triggeredAt)}
                  </p>
                  {(role === "Guard" || role === "Admin") && (
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleResolve(a._id)}>
                      <IconCheck className="h-4 w-4" /> Mark resolved
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : contactsLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading directory..." />
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface">
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover text-ink-ghost">
              <IconPhone className="h-5 w-5" />
            </span>
            <p className="text-base font-semibold text-ink">No contacts yet</p>
            <p className="text-sm text-ink-ghost">Emergency contacts published by admin will appear here</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <div key={c._id} className="flex items-start gap-3.5 rounded-xl border border-line bg-surface p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink/[0.06] text-ink-dim">
                <IconPhone className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-ghost">{c.type}</p>
                <p className="mt-1 text-base font-semibold text-ink">{c.name}</p>
                {c.designation && <p className="text-sm text-ink-faint">{c.designation}</p>}
                <a href={`tel:${c.phone}`} className="mt-1.5 block text-sm font-medium text-ink-dim hover:text-ink">
                  {c.phone}
                </a>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  title="Delete"
                  onClick={() => setDeleteContactTarget(c)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-ghost transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                >
                  <IconTrash className="h-[17px] w-[17px]" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={triggerOpen}
        onClose={() => setTriggerOpen(false)}
        title="Trigger emergency SOS alert"
        description="This will immediately notify all guards and administrators."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setTriggerOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" disabled={submitting} onClick={handleTrigger}>
              {submitting ? "Sending..." : "Send alert"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleTrigger} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}
          <SelectField
            label="Alert type"
            value={form.alertType}
            onChange={(e) => setForm({ ...form, alertType: e.target.value })}
            options={ALERT_TYPES.map((t) => ({ label: t, value: t }))}
          />
          <TextField
            label="Location details"
            required
            error={formFieldErrors.locationDetails}
            value={form.locationDetails}
            onChange={(e) => {
              setForm({ ...form, locationDetails: e.target.value });
              if (formFieldErrors.locationDetails) setFormFieldErrors({ ...formFieldErrors, locationDetails: "" });
            }}
            placeholder="e.g. Block B - 3rd Floor Corridor"
          />
        </form>
      </Modal>

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Add emergency contact"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setContactOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleAddContact}>
              {submitting ? "Saving..." : "Add contact"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          {contactError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {contactError}
            </div>
          )}
          <TextField
            label="Name"
            required
            error={contactFieldErrors.name}
            value={contactForm.name}
            onChange={(e) => {
              setContactForm({ ...contactForm, name: e.target.value });
              if (contactFieldErrors.name) setContactFieldErrors({ ...contactFieldErrors, name: "" });
            }}
          />
          <TextField
            label="Designation"
            required
            error={contactFieldErrors.designation}
            placeholder="e.g. Society Secretary"
            value={contactForm.designation}
            onChange={(e) => {
              setContactForm({ ...contactForm, designation: e.target.value });
              if (contactFieldErrors.designation) setContactFieldErrors({ ...contactFieldErrors, designation: "" });
            }}
          />
          <TextField
            label="Phone"
            required
            error={contactFieldErrors.phone}
            value={contactForm.phone}
            onChange={(e) => {
              setContactForm({ ...contactForm, phone: e.target.value });
              if (contactFieldErrors.phone) setContactFieldErrors({ ...contactFieldErrors, phone: "" });
            }}
          />
          <SelectField
            label="Type"
            value={contactForm.type}
            onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
            options={CONTACT_TYPES.map((t) => ({ label: t, value: t }))}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteContactTarget)}
        onClose={() => setDeleteContactTarget(null)}
        onConfirm={handleDeleteContact}
        title="Remove this contact?"
        description={deleteContactTarget ? `"${deleteContactTarget.name}" will be removed from the directory.` : ""}
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
