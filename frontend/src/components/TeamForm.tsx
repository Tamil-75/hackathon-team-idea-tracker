import { useState } from "react";

interface TeamFormProps {
  initialData?: {
    name: string;
    description: string;
    max_members: number;
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    max_members: number;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
  loading?: boolean;
}

export default function TeamForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
}: TeamFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [maxMembers, setMaxMembers] = useState(
    initialData?.max_members || 5
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    if (name.length > 100) {
      setError("Team name must be 100 characters or less.");
      return;
    }
    if (description.length > 500) {
      setError("Description must be 500 characters or less.");
      return;
    }
    if (maxMembers < 2 || maxMembers > 10) {
      setError("Maximum members must be between 2 and 10.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      max_members: maxMembers,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-status-rejected/20 bg-status-rejected/5 px-4 py-3 text-sm text-status-rejected">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block font-mono text-[11px] font-medium uppercase tracking-wider text-text-secondary">
          Team Name <span className="ml-1 text-accent">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          className={inputClass}
          placeholder="Enter team name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block font-mono text-[11px] font-medium uppercase tracking-wider text-text-secondary">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          className={inputClass}
          placeholder="Describe your team (optional)"
        />
        <p className="font-mono text-[10px] text-text-tertiary">
          {description.length}/500
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block font-mono text-[11px] font-medium uppercase tracking-wider text-text-secondary">
          Maximum Members <span className="ml-1 text-accent">*</span>
        </label>
        <input
          type="number"
          value={maxMembers}
          onChange={(e) => setMaxMembers(parseInt(e.target.value, 10))}
          min={2}
          max={10}
          required
          className={inputClass}
        />
        <p className="font-mono text-[10px] text-text-tertiary">
          Between 2 and 10 members
        </p>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-accent py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
