import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as noticeService from "@/services/noticeService";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextareaField from "@/components/ui/TextareaField";
import SelectField from "@/components/ui/SelectField";
import Badge from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/date";
import { validateRequired } from "@/utils/validators";
import { IconPlus, IconMegaphone, IconCheck, IconTrash, IconPoll } from "@/components/ui/icons";

const CATEGORIES = ["Announcement", "Event", "Rule", "MaintenanceNotice"];
const CATEGORY_VARIANT = { Announcement: "info", Event: "success", Rule: "warning", MaintenanceNotice: "neutral" };

const emptyForm = { title: "", content: "", category: "Announcement", isPoll: false, pollOptions: ["", ""] };

export default function Notices() {
  const { role, user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("announcements");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchNotices = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      setNotices(await noticeService.getNotices());
    } catch (err) {
      setError(err.message || "Failed to load notices");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    const titleErr = validateRequired(form.title, "Title", 3, 120);
    const contentErr = validateRequired(form.content, "Content", 5, 2000);
    let pollErr = "";

    if (form.isPoll) {
      const validOptions = form.pollOptions.map((o) => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        pollErr = "A poll requires at least 2 non-empty options.";
      }
    }

    if (titleErr || contentErr || pollErr) {
      setFieldErrors({
        title: titleErr,
        content: contentErr,
        pollOptions: pollErr,
      });
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await noticeService.createNotice({
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        pollOptions: form.isPoll ? form.pollOptions.map((o) => o.trim()).filter(Boolean) : [],
      });
      setCreateOpen(false);
      setForm(emptyForm);
      fetchNotices(true);
    } catch (err) {
      setFormError(err.message || "Failed to publish notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (noticeId, optionId) => {
    try {
      await noticeService.voteOnPoll(noticeId, optionId);
      fetchNotices(true);
    } catch (err) {
      window.alert(err.message || "Failed to cast vote");
    }
  };

  const updatePollOption = (i, value) => setForm({ ...form, pollOptions: form.pollOptions.map((o, idx) => (idx === i ? value : o)) });
  const addPollOption = () => setForm({ ...form, pollOptions: [...form.pollOptions, ""] });

  const handleDelete = async () => {
    await noticeService.deleteNotice(deleteTarget._id);
    fetchNotices(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading notices..." />
      </div>
    );
  }

  const announcements = notices.filter((n) => !n.isPoll);
  const polls = notices.filter((n) => n.isPoll);
  const visibleNotices = activeTab === "polls" ? polls : announcements;

  const TABS = [
    { key: "announcements", label: "Announcements", icon: IconMegaphone, count: announcements.length },
    { key: "polls", label: "Polls", icon: IconPoll, count: polls.length },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Community</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Notices / Polls</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">Announcements, events, and community polls</p>
        </div>
        {role === "Admin" && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setForm({ ...emptyForm, isPoll: activeTab === "polls" });
              setFormError("");
              setCreateOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" />
            {activeTab === "polls" ? "New Poll" : "New Announcement"}
          </Button>
        )}
      </div>

      <div className="inline-flex rounded-xl border border-line bg-surface p-1">
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

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>}

      {visibleNotices.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState
            icon={activeTab === "polls" ? IconPoll : IconMegaphone}
            title={activeTab === "polls" ? "No polls yet" : "No announcements published yet"}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleNotices.map((n) => {
            const totalVotes = n.pollOptions?.reduce((sum, o) => sum + o.votesCount, 0) || 0;
            const votedOption = n.pollOptions?.find((o) => o.votedUserIds?.includes(user?._id));
            const hasVoted = Boolean(votedOption);
            return (
              <div key={n._id} className="relative rounded-xl border border-line bg-surface p-5">
                {role === "Admin" && (
                  <button
                    type="button"
                    aria-label="Delete notice"
                    title="Delete notice"
                    onClick={() => setDeleteTarget(n)}
                    className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-ink-ghost transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                )}
                <div className="flex items-start justify-between gap-3 pr-8">
                  <Badge variant={CATEGORY_VARIANT[n.category]}>{n.category}</Badge>
                  <p className="shrink-0 text-xs text-ink-ghost">{formatDate(n.createdAt)}</p>
                </div>
                <h3 className="mt-3 text-base font-semibold text-ink">{n.title}</h3>
                <p className="mt-1.5 text-sm text-ink-faint">{n.content}</p>
                <p className="mt-3 text-xs text-ink-ghost">By {n.authorId?.name || "Admin"}</p>

                {n.isPoll && (
                  <div className="mt-4 space-y-2 border-t border-line-soft pt-4">
                    {n.pollOptions.map((opt) => {
                      const pct = totalVotes ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                      const isMyVote = votedOption?._id === opt._id;
                      return (
                        <button
                          key={opt._id}
                          type="button"
                          disabled={hasVoted || role !== "Resident"}
                          onClick={() => handleVote(n._id, opt._id)}
                          className={`relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm transition disabled:cursor-default ${
                            isMyVote
                              ? "border-emerald-500/40 bg-emerald-500/[0.06] text-ink"
                              : "border-line bg-canvas text-ink-dim hover:border-ink-ghost disabled:hover:border-line"
                          }`}
                        >
                          <span
                            className={`absolute inset-y-0 left-0 ${isMyVote ? "bg-emerald-500/10" : "bg-ink/[0.06]"}`}
                            style={{ width: `${pct}%` }}
                          />
                          <span className="relative flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5">
                              {isMyVote && <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                              <span className={isMyVote ? "font-medium" : ""}>{opt.optionText}</span>
                            </span>
                            <span className="text-xs text-ink-ghost">
                              {pct}% ({opt.votesCount})
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {hasVoted && (
                      <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <IconCheck className="h-3.5 w-3.5" /> You voted for "{votedOption.optionText}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={form.isPoll ? "Publish a poll" : "Publish an announcement"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleCreate}>
              {submitting ? "Publishing..." : "Publish"}
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
          />
          <TextareaField
            label="Content"
            required
            error={fieldErrors.content}
            value={form.content}
            onChange={(e) => {
              setForm({ ...form, content: e.target.value });
              if (fieldErrors.content) setFieldErrors({ ...fieldErrors, content: "" });
            }}
          />
          <SelectField
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={CATEGORIES.map((c) => ({ label: c, value: c }))}
          />

          <label className="flex items-center gap-2.5 text-sm text-ink-dim">
            <input
              type="checkbox"
              checked={form.isPoll}
              onChange={(e) => setForm({ ...form, isPoll: e.target.checked })}
              className="h-4 w-4 rounded border-line"
            />
            Make this a community poll
          </label>

          {form.isPoll && (
            <div className="space-y-2.5">
              {fieldErrors.pollOptions && (
                <p className="text-xs text-red-500 font-medium">{fieldErrors.pollOptions}</p>
              )}
              {form.pollOptions.map((opt, i) => (
                <TextField
                  key={i}
                  label={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    updatePollOption(i, e.target.value);
                    if (fieldErrors.pollOptions) setFieldErrors({ ...fieldErrors, pollOptions: "" });
                  }}
                />
              ))}
              <button type="button" onClick={addPollOption} className="text-sm font-medium text-ink-faint hover:text-ink">
                + Add another option
              </button>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this notice?"
        description={deleteTarget ? `"${deleteTarget.title}" will be permanently removed${deleteTarget.isPoll ? " along with its poll votes" : ""}.` : ""}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
