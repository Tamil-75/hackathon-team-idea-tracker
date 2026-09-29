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
  const bgColor = type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
  const iconColor = type === "success" ? "text-green-500" : "text-red-500";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";

  return (
    <div className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${bgColor}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
