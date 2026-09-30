import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "danger" | "primary";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "bg-status-rejected hover:bg-status-rejected/90"
      : "bg-accent hover:bg-accent-hover";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-elevated p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              variant === "danger"
                ? "bg-status-rejected/10 text-status-rejected"
                : "bg-accent/10 text-accent"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-border py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-lg py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition-colors disabled:opacity-50 ${confirmButtonClass}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
