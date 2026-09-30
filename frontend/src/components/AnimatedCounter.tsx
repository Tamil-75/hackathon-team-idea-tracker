import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  /** Zero-pad to this many digits (e.g. 2 → "07"). */
  pad?: number;
}

/**
 * Counts up when scrolled into view and re-tweens when `value` changes.
 * Renders the final value immediately under reduced motion.
 */
export default function AnimatedCounter({
  value,
  duration = 1400,
  className = "",
  pad = 0,
}: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.3, rootMargin: "0px" });
  const [display, setDisplay] = useState<number>(reduced ? value : 0);
  const shown = useRef<number>(reduced ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      shown.current = value;
      setDisplay(value);
      return;
    }
    const from = shown.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (value - from) * eased);
      shown.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduced]);

  const text = pad > 0 ? String(display).padStart(pad, "0") : String(display);
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
