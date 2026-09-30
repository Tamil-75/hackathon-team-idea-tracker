export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
        Loading...
      </p>
    </div>
  );
}
