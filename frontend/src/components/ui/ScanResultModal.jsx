import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { IconAlertCircle, IconCheck, IconLogOut, IconShield } from "@/components/ui/icons";
import { playScanFeedback } from "@/lib/beep";

/** Premium glassmorphic pass/fail feedback overlay shown after a gate-pass scan or manual verify. */
export default function ScanResultModal({ result, open, onClose, autoDismissTime = 4500 }) {
  useEffect(() => {
    if (open && result) playScanFeedback(Boolean(result.ok));
  }, [open, result]);

  useEffect(() => {
    if (!open || !result?.ok || !autoDismissTime) return;
    const timer = setTimeout(onClose, autoDismissTime);
    return () => clearTimeout(timer);
  }, [open, result, autoDismissTime, onClose]);

  if (!result) return null;

  const isSuccess = Boolean(result.ok);
  const isCheckout = result.action === "CHECK_OUT";
  const visitor = result.visitor;

  const heading = isSuccess ? (isCheckout ? "Exit logged" : "Access granted") : "Access denied";
  const HeadIcon = isSuccess ? (isCheckout ? IconLogOut : IconShield) : IconAlertCircle;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={
              isSuccess
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 1, scale: 1, y: 0, x: [-10, 10, -8, 8, -4, 4, 0] }
            }
            transition={
              isSuccess
                ? { type: "spring", stiffness: 350, damping: 25 }
                : { x: { duration: 0.45, ease: "easeInOut" }, opacity: { duration: 0.2 } }
            }
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl border p-6 text-white shadow-2xl backdrop-blur-2xl ${
              isSuccess
                ? isCheckout
                  ? "border-sky-500/40 bg-slate-900/90 shadow-sky-950/40"
                  : "border-emerald-500/40 bg-slate-900/90 shadow-emerald-950/40"
                : "border-red-500/40 bg-slate-900/90 shadow-red-950/40"
            }`}
          >
            {/* Ambient glow pulse behind the icon, color-coded per outcome */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.5, 0.25], scale: [0.6, 1.4, 1.2] }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className={`pointer-events-none absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${
                isSuccess ? (isCheckout ? "bg-sky-500/40" : "bg-emerald-500/40") : "bg-red-500/40"
              }`}
            />

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.08 }}
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-lg ${
                  isSuccess
                    ? isCheckout
                      ? "border-sky-400 bg-sky-500/20 text-sky-300 shadow-sky-500/20"
                      : "border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20"
                    : "border-red-400 bg-red-500/20 text-red-400 shadow-red-500/20"
                }`}
              >
                {isSuccess ? (
                  <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={isCheckout ? "M9 5l7 7-7 7M4 12h12" : "M5 13l4 4L19 7"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                    />
                  </svg>
                ) : (
                  <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                    />
                  </svg>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-4 flex items-center gap-2"
              >
                <HeadIcon className="h-5 w-5 opacity-70" />
                <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-1 text-sm font-medium text-slate-300">
                {result.message}
              </motion.p>
            </div>

            {isSuccess && visitor && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-5 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Visitor</span>
                  <span className="font-semibold text-white">{visitor.visitorName}</span>
                </div>
                {visitor.targetFlat && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Flat</span>
                    <span className="font-medium text-emerald-300">
                      {visitor.targetFlat.blockName}-{visitor.targetFlat.flatNumber}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      isCheckout
                        ? "border-sky-500/30 bg-sky-500/20 text-sky-300"
                        : "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    <IconCheck className="h-3 w-3" /> {isCheckout ? "Checked out" : "Checked in"}
                  </span>
                </div>
              </motion.div>
            )}

            {!isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-xs text-red-300"
              >
                <div className="flex items-center justify-center gap-1.5 font-semibold text-red-200">
                  <IconAlertCircle className="h-4 w-4" /> Unauthorized — not permitted at the gate
                </div>
              </motion.div>
            )}

            <div className="mt-6 space-y-3">
              <Button variant={isSuccess ? "primary" : "outline"} size="md" className="w-full justify-center font-semibold" onClick={onClose}>
                {isSuccess ? "Scan next pass" : "Try again"}
              </Button>

              {isSuccess && autoDismissTime > 0 && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: autoDismissTime / 1000, ease: "linear" }}
                    className={`h-full ${isCheckout ? "bg-sky-400" : "bg-emerald-400"}`}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
