import type { Idea } from "../types";

interface StatusBadgeProps {
  status: Idea["status"];
}

const statusStyles: Record<Idea["status"], string> = {
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  "Under Review": "bg-yellow-50 text-yellow-700 border-yellow-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
