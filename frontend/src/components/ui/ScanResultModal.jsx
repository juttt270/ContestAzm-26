import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconCheck, IconX, IconShield, IconUsers, IconLogOut, IconAlertCircle } from "@/components/ui/icons";
import Button from "@/components/ui/Button";
import { playScanFeedback } from "@/lib/beep";

/**
 * ScanResultModal Component
 * Premium glassmorphic micro-animated feedback overlay for Guard Panel QR Verification.
 */
export default function ScanResultModal({ result, open, onClose, autoDismissTime = 5000 }) {
  useEffect(() => {
    if (open && result) {
      playScanFeedback(Boolean(result.ok));
    }
  }, [open, result]);

  useEffect(() => {
    if (!open || !result || !result.ok || !autoDismissTime) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoDismissTime);
    return () => clearTimeout(timer);
  }, [open, result, autoDismissTime, onClose]);

  if (!open || !result) return null;

  const isSuccess = Boolean(result.ok);
  const isCheckout = result.action === "CHECK_OUT";
  const visitor = result.visitor;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Feedback Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={
              isSuccess
                ? { opacity: 1, scale: 1, y: 0 }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: [-12, 12, -10, 10, -5, 5, 0], // Horizontal shake animation for errors
                  }
            }
            transition={
              isSuccess
                ? { type: "spring", stiffness: 350, damping: 25 }
                : { x: { duration: 0.5, ease: "easeInOut" }, opacity: { duration: 0.2 } }
            }
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl border p-6 text-white shadow-2xl backdrop-blur-2xl ${
              isSuccess
                ? "border-emerald-500/40 bg-slate-900/90 shadow-emerald-950/40"
                : "border-red-500/40 bg-slate-900/90 shadow-red-950/40"
            }`}
          >
            {/* Header Status & Animated SVG Icon */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-lg ${
                  isSuccess
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20"
                    : "border-red-400 bg-red-500/20 text-red-400 shadow-red-500/20"
                }`}
              >
                {isSuccess ? (
                  <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
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

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-4 text-2xl font-bold tracking-tight"
              >
                {isSuccess ? (isCheckout ? "Exit Logged Successfully" : "Access Authorized") : "Verification Failed"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-1 text-sm font-medium text-slate-300"
              >
                {result.message}
              </motion.p>
            </div>

            {/* Visitor / Resident Details Card (Success State) */}
            {isSuccess && visitor && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-5 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Visitor Name</span>
                  <span className="font-semibold text-white">{visitor.visitorName}</span>
                </div>
                {visitor.targetFlat && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Target Flat</span>
                    <span className="font-medium text-emerald-300">
                      {visitor.targetFlat.blockName}-{visitor.targetFlat.flatNumber}
                    </span>
                  </div>
                )}
                {visitor.visitorType && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400">Pass Type</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                      {visitor.visitorType}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400">Gate Badge</span>
                  <span className="font-mono text-xs font-semibold text-white">
                    {visitor.passCode ? `#${visitor.passCode}` : "AUTHORIZED"}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error Detail Card (Error State) */}
            {!isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-xs text-red-300"
              >
                <div className="flex items-center justify-center gap-1.5 font-semibold text-red-200">
                  <IconAlertCircle className="h-4 w-4" /> Access Denied at Gate
                </div>
                <p className="mt-1 text-slate-300">
                  Please verify pass status or contact society administration if this code should be active.
                </p>
              </motion.div>
            )}

            {/* Actions & Auto-Dismiss Timer Bar */}
            <div className="mt-6 space-y-3">
              <Button
                variant={isSuccess ? "primary" : "outline"}
                size="md"
                className="w-full justify-center font-semibold"
                onClick={onClose}
              >
                {isSuccess ? "Scan Next Pass" : "Try Again"}
              </Button>

              {isSuccess && autoDismissTime > 0 && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: autoDismissTime / 1000, ease: "linear" }}
                    className="h-full bg-emerald-400"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
