import { useLocation } from "react-router-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import NetworkCanvas from "./NetworkCanvas";
import type { NetworkVariant } from "./networkEngine";

/**
 * Decorative micro-labels. `side` decides which edge they anchor to so they
 * never run off-screen; all sit near the edges to keep the centre clean.
 */
const LABELS: {
  text: string;
  top: string;
  x: string;
  side: "l" | "r";
  dur: number;
  delay: number;
  mobile?: boolean;
}[] = [
  { text: "NODE_07", top: "12%", x: "4%", side: "l", dur: 15, delay: -3, mobile: true },
  { text: "SYNC_98.4%", top: "24%", x: "3%", side: "r", dur: 17, delay: -9 },
  { text: "API//ACTIVE", top: "8%", x: "6%", side: "r", dur: 14, delay: -6, mobile: true },
  { text: "NETWORK//ONLINE", top: "88%", x: "4%", side: "r", dur: 18, delay: -12 },
  { text: "DATA_STREAM", top: "46%", x: "2%", side: "l", dur: 16, delay: -1 },
  { text: "AUTH//VERIFIED", top: "70%", x: "3%", side: "r", dur: 19, delay: -14, mobile: true },
  { text: "TEAM_LINK", top: "36%", x: "3%", side: "r", dur: 13, delay: -7 },
  { text: "IDEA_PIPELINE", top: "78%", x: "3%", side: "l", dur: 17, delay: -4 },
  { text: "SYSTEM//READY", top: "92%", x: "5%", side: "l", dur: 15, delay: -10 },
  { text: "PROTOCOL_26", top: "58%", x: "3%", side: "r", dur: 20, delay: -16 },
  { text: "PACKET_001", top: "18%", x: "12%", side: "l", dur: 14, delay: -8 },
  { text: "PACKET_002", top: "64%", x: "14%", side: "r", dur: 16, delay: -2 },
  { text: "NODE_12", top: "52%", x: "5%", side: "l", dur: 18, delay: -11 },
];

const STREAMS: {
  text: string | null;
  top: string;
  dur: number;
  delay: number;
  extra?: boolean;
}[] = [
  { text: "──────────────── DATA STREAM 001 ────────────────", top: "16%", dur: 75, delay: -20 },
  { text: "SYNC ────────────────────────────────►", top: "41%", dur: 95, delay: -70 },
  { text: null, top: "63%", dur: 60, delay: -15 },
  { text: "──────────────── DATA STREAM 002 ────────────────", top: "82%", dur: 85, delay: -40, extra: true },
  { text: "IDEAS ───────────────────────────────►", top: "29%", dur: 110, delay: -95, extra: true },
];

/**
 * Persistent, route-independent immersive background. Everything here is
 * decorative (aria-hidden, pointer-events none) and sits behind page content.
 */
export default function SystemBackground() {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const variant: NetworkVariant = pathname === "/" ? "hero" : "app";

  return (
    <>
      <div className="sys-bg" data-variant={variant} aria-hidden="true">
        {/* ambient light + technical grid + perspective floor + living network (canvas) */}
        <NetworkCanvas variant={variant} reducedMotion={reduced} />

        {/* data streams */}
        {STREAMS.map((s, i) => (
          <div
            key={i}
            className={`sys-stream sys-anim ${s.extra ? "hidden md:block" : ""}`}
            style={{ top: s.top, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
          >
            {s.text ?? <span className="sys-stream-line" />}
          </div>
        ))}

        {/* floating system metadata */}
        {LABELS.map((l) => (
          <span
            key={l.text}
            className={`sys-label sys-anim ${l.mobile ? "" : "hidden sm:block"}`}
            style={{
              top: l.top,
              [l.side === "l" ? "left" : "right"]: l.x,
              animationDuration: `${l.dur}s`,
              animationDelay: `${l.delay}s`,
            }}
          >
            {l.text}
          </span>
        ))}

      </div>

      {/* almost-invisible CRT texture */}
      <div className="sys-scanlines" aria-hidden="true" />
    </>
  );
}
