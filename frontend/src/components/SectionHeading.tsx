interface SectionHeadingProps {
  number: string;
  label: string;
  title?: string;
  description?: string;
}

export default function SectionHeading({
  number,
  label,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-medium tracking-widest text-accent">
          {number}
        </span>
        <span className="h-px w-8 bg-accent/30" />
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-text-secondary">
          {label}
        </span>
      </div>
      {title && (
        <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h2>
      )}
      {description && (
        <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
