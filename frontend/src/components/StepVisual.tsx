import { useInView } from "../hooks/useInView";

type Pt = [number, number];

interface Diagram {
  nodes: Pt[];
  edges: [number, number][];
  /** Node index drawn as the focal point. */
  focus: number;
}

const DIAGRAMS: Record<string, Diagram> = {
  // 01 FORM — a squad assembling around a founder
  "01": {
    nodes: [[80, 50], [30, 20], [130, 20], [30, 80], [130, 80]],
    edges: [[0, 1], [0, 2], [0, 3], [0, 4]],
    focus: 0,
  },
  // 02 COLLABORATE — fully meshed team
  "02": {
    nodes: [[40, 25], [120, 25], [120, 75], [40, 75]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]],
    focus: 0,
  },
  // 03 BUILD — a pipeline of stages
  "03": {
    nodes: [[20, 50], [65, 28], [105, 68], [142, 42]],
    edges: [[0, 1], [1, 2], [2, 3]],
    focus: 3,
  },
  // 04 SUBMIT — everything converging on one target
  "04": {
    nodes: [[24, 24], [24, 76], [72, 50], [138, 50]],
    edges: [[0, 2], [1, 2], [2, 3]],
    focus: 3,
  },
};

/** Small network glyph whose links draw themselves when scrolled into view. */
export default function StepVisual({ id }: { id: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const d = DIAGRAMS[id] ?? DIAGRAMS["01"];

  return (
    <div
      ref={ref}
      className="flex h-32 w-full max-w-[220px] items-center justify-center rounded-2xl border border-border bg-background/70 transition-all group-hover:border-accent/30 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]"
    >
      <svg viewBox="0 0 160 100" className="h-24 w-40" role="img" aria-label={`Step ${id} network diagram`}>
        {d.edges.map(([a, b], i) => (
          <line
            key={i}
            x1={d.nodes[a][0]}
            y1={d.nodes[a][1]}
            x2={d.nodes[b][0]}
            y2={d.nodes[b][1]}
            stroke="rgba(96,165,250,0.6)"
            strokeWidth={1}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={inView ? 0 : 1}
            style={{ transition: `stroke-dashoffset 900ms ease ${300 + i * 140}ms` }}
          />
        ))}
        {d.nodes.map(([x, y], i) => (
          <g
            key={i}
            style={{
              opacity: inView ? 1 : 0,
              transition: `opacity 500ms ease ${i * 120}ms`,
            }}
          >
            <circle cx={x} cy={y} r={i === d.focus ? 10 : 7} fill="rgba(59,130,246,0.12)" />
            <circle
              cx={x}
              cy={y}
              r={i === d.focus ? 5 : 3.5}
              fill="#0a0a0b"
              stroke={i === d.focus ? "#22d3ee" : "#60a5fa"}
              strokeWidth={1.4}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
