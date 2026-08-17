import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IconX } from "@/components/ui/icons";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
  hideCloseButton = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            aria-label="Close modal"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-md dark:bg-black/75"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex max-h-[90vh] w-full ${SIZES[size]} flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/25 ring-1 ring-black/5 dark:shadow-black/70 dark:ring-white/[0.06]`}
          >
            {(title || !hideCloseButton) && (
              <div className={`relative shrink-0 ${title ? "border-b border-line-soft bg-surface px-6 py-5" : ""}`}>
                {title && (
                  <div className="pr-8">
                    <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
                    {description && <p className="mt-1 text-sm text-ink-faint">{description}</p>}
                  </div>
                )}
                {!hideCloseButton && (
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className={`absolute rounded-lg p-1.5 text-ink-ghost transition hover:bg-surface-hover hover:text-ink ${
                      title ? "right-4 top-4" : "right-3.5 top-3.5"
                    }`}
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 justify-end gap-2.5 border-t border-line-soft bg-surface-hover/40 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
