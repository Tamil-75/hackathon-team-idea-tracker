import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = type === "success" ? CheckCircle : XCircle;
  const borderColor =
    type === "success" ? "border-status-approved/20" : "border-status-rejected/20";
  const iconColor = type === "success" ? "text-status-approved" : "text-status-rejected";
  const textColor = type === "success" ? "text-status-approved" : "text-status-rejected";

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg border bg-surface-elevated px-4 py-3 shadow-xl ${borderColor}`}
    >
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      <button onClick={onClose} className="ml-2 text-text-tertiary hover:text-text-primary">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
