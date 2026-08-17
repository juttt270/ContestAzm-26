import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronDown, IconCheck, IconSearch } from "@/components/ui/icons";

const SEARCH_THRESHOLD = 6;

export default function SelectField({
  label,
  options = [],
  value,
  onChange,
  error,
  className = "",
  disabled = false,
  placeholder = "Select...",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const showSearch = options.length > SEARCH_THRESHOLD;
  const filtered =
    showSearch && query.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
      : options;

  const openPanel = () => {
    if (disabled) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    setQuery("");
    setOpen(true);
  };

  const select = (opt) => {
    onChange?.({ target: { value: opt.value } });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    if (showSearch) requestAnimationFrame(() => searchRef.current?.focus());

    const handleClickAway = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    const handleDismiss = () => setOpen(false);

    window.addEventListener("mousedown", handleClickAway);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      window.removeEventListener("mousedown", handleClickAway);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [open, showSearch]);

  return (
    <label className={`block text-sm font-medium text-ink-dim ${className}`}>
      {label}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`mt-1.5 flex w-full items-center justify-between gap-2 rounded-lg border bg-canvas px-3 py-2.5 text-left text-sm text-ink transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? "border-red-500/50 focus:border-red-500/70" : "border-line hover:border-ink-ghost/60 focus:border-ink-ghost"
        }`}
      >
        <span className={`truncate ${selected ? "" : "text-ink-faint"}`}>{selected ? selected.label : placeholder}</span>
        <IconChevronDown className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {error && <span className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">{error}</span>}

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ position: "fixed", top: coords.top, left: coords.left, width: coords.width }}
              className="z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:shadow-black/60 dark:ring-black/40"
            >
              {showSearch && (
                <div className="border-b border-line-soft p-2">
                  <span className="relative block">
                    <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full rounded-lg border border-line bg-canvas py-1.5 pl-8 pr-2.5 text-sm text-ink placeholder:text-ink-faint transition focus:border-ink-ghost focus:outline-none"
                    />
                  </span>
                </div>
              )}
              <div className="max-h-56 overflow-y-auto py-1.5">
                {filtered.length === 0 ? (
                  <p className="px-3.5 py-3 text-center text-sm text-ink-ghost">No matches found</p>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => select(opt)}
                      className={`flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm transition ${
                        opt.value === value ? "bg-surface-hover font-medium text-ink" : "text-ink-dim hover:bg-surface-hover hover:text-ink"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {opt.value === value && <IconCheck className="h-3.5 w-3.5 shrink-0 text-ink" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </label>
  );
}
