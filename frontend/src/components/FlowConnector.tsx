interface FlowConnectorProps {
  direction?: "h" | "v";
  /** Line is part of an already-travelled path. */
  lit?: boolean;
  /** Animate a light pulse travelling along the line. */
  flow?: boolean;
  tone?: "accent" | "danger";
  className?: string;
}

/** Thin connector with an optional travelling data pulse. */
export default function FlowConnector({
  direction = "h",
  lit = false,
  flow = false,
  tone = "accent",
  className = "",
}: FlowConnectorProps) {
  return (
    <div
      aria-hidden="true"
      className={`flow-line ${className}`}
      data-dir={direction}
      data-lit={lit}
      data-flow={flow}
      data-tone={tone}
    />
  );
}
