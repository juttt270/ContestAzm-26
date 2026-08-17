import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { IconAlertTriangle } from "@/components/ui/icons";

const ICON_TINT = {
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  primary: "bg-ink/10 text-ink",
  outline: "bg-ink/10 text-ink",
  ghost: "bg-ink/10 text-ink",
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center px-1 py-2 text-center">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full ${ICON_TINT[variant] || ICON_TINT.danger}`}>
          <IconAlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-ink-faint">{description}</p>}
      </div>

      <div className="mt-6 flex gap-2.5">
        <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          size="sm"
          className="flex-1"
          onClick={() => {
            onConfirm?.();
            onClose?.();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
