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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Team Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Enter team name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Describe your team (optional)"
        />
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/500
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Maximum Members <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={maxMembers}
          onChange={(e) => setMaxMembers(parseInt(e.target.value, 10))}
          min={2}
          max={10}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Between 2 and 10 members
        </p>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
