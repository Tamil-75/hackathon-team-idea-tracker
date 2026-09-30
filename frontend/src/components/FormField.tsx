import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[11px] font-medium uppercase tracking-wider text-text-secondary">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-status-rejected">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-tertiary">{hint}</p>
      )}
    </div>
  );
}
