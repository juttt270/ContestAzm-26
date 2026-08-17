import { cloneElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function Menu({ trigger, items, align = "right", width = 190 }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    const left = align === "right" ? rect.right - width : rect.left;
    setCoords({ top: rect.bottom + 8, left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickAway = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
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
  }, [open]);

  const triggerEl = cloneElement(trigger, {
    onClick: (e) => {
      trigger.props.onClick?.(e);
      if (open) setOpen(false);
      else openMenu();
    },
  });

  return (
    <>
      <span ref={triggerRef} className="inline-flex">
        {triggerEl}
      </span>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ position: "fixed", top: coords.top, left: coords.left, width }}
              className="z-50 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:shadow-black/60 dark:ring-black/40"
            >
              {items.map((item, i) =>
                item.divider ? (
                  <div key={`divider-${i}`} className="my-1.5 h-px bg-line-soft" />
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition ${
                      item.danger
                        ? "text-red-600 hover:bg-red-500/10 dark:text-red-400"
                        : "text-ink-dim hover:bg-surface-hover hover:text-ink"
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                    {item.label}
                  </button>
                ),
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
