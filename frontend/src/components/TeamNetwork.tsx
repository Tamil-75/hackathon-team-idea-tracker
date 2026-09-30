interface NetworkMember {
  user_id: number;
  name: string;
}

interface TeamNetworkProps {
  teamName: string;
  leaderId: number;
  members: NetworkMember[];
  maxMembers: number;
  currentUserId?: number;
}

const W = 420;
const shortName = (name: string) => {
  const first = name.trim().split(/\s+/)[0] ?? name;
  return (first.length > 10 ? `${first.slice(0, 9)}…` : first).toUpperCase();
};

/**
 * Decorative team graph: leader at the top, members below, dashed ghost nodes
 * for open slots. Members come from the team API; nothing is invented.
 */
export default function TeamNetwork({
  teamName,
  leaderId,
  members,
  maxMembers,
  currentUserId,
}: TeamNetworkProps) {
  const leader = members.find((m) => m.user_id === leaderId);
  const others = members.filter((m) => m.user_id !== leaderId);
  const openSlots = Math.max(0, maxMembers - members.length);

  type Slot = { key: string; label: string; ghost: boolean; you: boolean };
  const slots: Slot[] = [
    ...others.map((m) => ({
      key: `m-${m.user_id}`,
      label: shortName(m.name),
      ghost: false,
      you: m.user_id === currentUserId,
    })),
    ...Array.from({ length: openSlots }, (_, i) => ({
      key: `o-${i}`,
      label: "OPEN",
      ghost: true,
      you: false,
    })),
  ];

  const perRow = slots.length <= 5 ? Math.max(1, slots.length) : Math.ceil(slots.length / 2);
  const rowCount = Math.max(1, Math.ceil(slots.length / perRow));
  const spacing = Math.min(84, 360 / perRow);
  const leaderX = W / 2;
  const leaderY = 46;
  const rowY = (r: number) => 134 + r * 72;
  const height = slots.length === 0 ? 100 : rowY(rowCount - 1) + 44;

  const positioned = slots.map((s, i) => {
    const r = Math.floor(i / perRow);
    const inRow = r === rowCount - 1 ? slots.length - r * perRow : perRow;
    const col = i - r * perRow;
    const x = W / 2 + (col - (inRow - 1) / 2) * spacing;
    return { ...s, x, y: rowY(r) };
  });

  const leaderIsYou = leader?.user_id === currentUserId && currentUserId !== undefined;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      className="mx-auto block w-full max-w-lg"
      role="img"
      aria-label={`Network of team ${teamName}: leader ${leader?.name ?? ""} and ${others.length} other member${others.length === 1 ? "" : "s"}, ${openSlots} open slot${openSlots === 1 ? "" : "s"}`}
    >
      <title>{`Team ${teamName} network`}</title>
      <defs>
        <radialGradient id="tn-glow">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* edges */}
      {positioned.map((p) => (
        <path
          key={`e-${p.key}`}
          d={`M ${leaderX} ${leaderY} C ${leaderX} ${(leaderY + p.y) / 2 + 10}, ${p.x} ${(leaderY + p.y) / 2 - 10}, ${p.x} ${p.y}`}
          fill="none"
          stroke={p.ghost ? "rgba(255,255,255,0.14)" : "rgba(96,165,250,0.55)"}
          strokeWidth={1}
          strokeDasharray={p.ghost ? "2 5" : undefined}
          className={p.ghost ? undefined : "team-edge"}
        />
      ))}

      {/* leader */}
      <circle cx={leaderX} cy={leaderY} r={26} fill="url(#tn-glow)" />
      <circle cx={leaderX} cy={leaderY} r={9} fill="none" stroke="#60a5fa" strokeOpacity="0.6" className="team-ring" />
      <circle cx={leaderX} cy={leaderY} r={8} fill="#0a0a0b" stroke="#60a5fa" strokeWidth={1.5} />
      <circle cx={leaderX} cy={leaderY} r={3} fill="#bfdbfe" />
      <text x={leaderX + 16} y={leaderY - 3} fontSize="9" fill="#93c5fd" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5">
        LEADER{leaderIsYou ? " · YOU" : ""}
      </text>
      {leader && (
        <text x={leaderX + 16} y={leaderY + 9} fontSize="9" fill="#a1a1aa" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
          {shortName(leader.name)}
        </text>
      )}

      {/* members + open slots */}
      {positioned.map((p) => (
        <g key={p.key}>
          {!p.ghost && <circle cx={p.x} cy={p.y} r={18} fill="url(#tn-glow)" opacity={0.7} />}
          <circle
            cx={p.x}
            cy={p.y}
            r={6}
            fill={p.ghost ? "none" : "#0a0a0b"}
            stroke={p.ghost ? "rgba(255,255,255,0.25)" : p.you ? "#22d3ee" : "#60a5fa"}
            strokeWidth={1.2}
            strokeDasharray={p.ghost ? "2 3" : undefined}
          />
          {!p.ghost && <circle cx={p.x} cy={p.y} r={2} fill={p.you ? "#67e8f9" : "#bfdbfe"} />}
          <text
            x={p.x}
            y={p.y + 22}
            textAnchor="middle"
            fontSize="8.5"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="0.8"
            fill={p.ghost ? "#71717a" : "#a1a1aa"}
            className="team-label"
          >
            {p.label}
            {p.you ? " ·YOU" : ""}
          </text>
        </g>
      ))}
    </svg>
  );
}
