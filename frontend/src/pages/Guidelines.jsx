import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as guidelineService from "@/services/guidelineService";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextareaField from "@/components/ui/TextareaField";
import SelectField from "@/components/ui/SelectField";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import { IconBook, IconPlus, IconPencil, IconTrash } from "@/components/ui/icons";

const CATEGORIES = ["General", "Safety", "Parking", "Amenities", "Maintenance", "Pets"];
const emptyForm = { title: "", content: "", category: "General", order: 0 };

export default function Guidelines() {
  const { role } = useAuth();
  const isAdmin = role === "Admin";

  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeCategory, setActiveCategory] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchGuidelines = async () => {
    setLoading(true);
    setError("");
    try {
      setGuidelines(await guidelineService.getGuidelines());
    } catch (err) {
      setError(err.message || "Failed to load guidelines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const visible = useMemo(
    () => (activeCategory === "All" ? guidelines : guidelines.filter((g) => g.category === activeCategory)),
    [guidelines, activeCategory]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Title and content are required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editTarget) await guidelineService.updateGuideline(editTarget._id, form);
      else await guidelineService.createGuideline(form);
      setFormOpen(false);
      fetchGuidelines();
    } catch (err) {
      setFormError(err.message || "Failed to save guideline");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await guidelineService.deleteGuideline(deleteTarget._id);
    fetchGuidelines();
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Community</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Society Guidelines</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">Rules and best practices for residents, staff, and guards</p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditTarget(null);
              setForm(emptyForm);
              setFormError("");
              setFormOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" />
            Publish Guideline
          </Button>
        )}
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
              activeCategory === cat ? "bg-ink text-canvas shadow-sm" : "text-ink-faint hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading guidelines..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState icon={IconBook} title="No guidelines yet" description="Published guidelines will appear here." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((g) => (
            <div key={g._id} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-ghost">{g.category}</span>
                  <h3 className="mt-1 text-base font-semibold text-ink">{g.title}</h3>
                </div>
                {isAdmin && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => {
                        setEditTarget(g);
                        setForm({ title: g.title, content: g.content, category: g.category, order: g.order || 0 });
                        setFormError("");
                        setFormOpen(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-ghost transition hover:bg-ink/[0.06] hover:text-ink"
                    >
                      <IconPencil className="h-[17px] w-[17px]" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setDeleteTarget(g)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-ghost transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <IconTrash className="h-[17px] w-[17px]" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2.5 whitespace-pre-line text-sm text-ink-faint">{g.content}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editTarget ? "Edit guideline" : "Publish new guideline"}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Saving..." : editTarget ? "Save changes" : "Publish"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}
          <TextField label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <SelectField
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
          <TextareaField
            label="Content"
            required
            rows={5}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this guideline?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed for everyone.` : ""}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
