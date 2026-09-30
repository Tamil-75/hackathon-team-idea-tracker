import { useEffect, useState } from "react";

/** Small live HUD readout: connectivity (real `navigator.onLine`) + local time. */
export default function SystemClock() {
  const [now, setNow] = useState(() => new Date());
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
      <span className={`hidden items-center gap-1.5 sm:inline-flex ${online ? "text-status-approved" : "text-status-rejected"}`}>
        <span className={`status-dot h-1.5 w-1.5 rounded-full ${online ? "bg-status-approved is-pulsing" : "bg-status-rejected"}`} />
        {online ? "NETWORK//ONLINE" : "NETWORK//OFFLINE"}
      </span>
      <span className="tabular-nums text-text-secondary">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
      </span>
    </div>
  );
}
