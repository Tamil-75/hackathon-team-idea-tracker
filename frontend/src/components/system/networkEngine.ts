/**
 * Living-network canvas engine.
 *
 * - Time-based simulation driven by requestAnimationFrame
 * - Spatial hash grid so link detection is ~O(n) instead of O(n²)
 * - Glow drawn from pre-rendered sprites (no shadowBlur)
 * - Edges batched into a few alpha buckets to minimise canvas state changes
 * - Adaptive quality: sheds nodes if the device can't keep up
 * - Pauses when the tab is hidden; static single frame for reduced motion
 */

export type NetworkVariant = "hero" | "app";

type Tier = "desktop" | "tablet" | "mobile";

interface TierConfig {
  min: number;
  max: number;
  divisor: number;
  link: number;
  dprCap: number;
  maxPackets: number;
  fps: number;
  speedMin: number;
  speedMax: number;
}

const TIERS: Record<Tier, TierConfig> = {
  desktop: { min: 50, max: 90, divisor: 20000, link: 150, dprCap: 1.5, maxPackets: 6, fps: 60, speedMin: 4, speedMax: 11 },
  tablet: { min: 30, max: 60, divisor: 22000, link: 130, dprCap: 1.5, maxPackets: 4, fps: 45, speedMin: 3, speedMax: 9 },
  mobile: { min: 15, max: 35, divisor: 20000, link: 105, dprCap: 1, maxPackets: 2, fps: 30, speedMin: 2, speedMax: 6 },
};

const MARGIN = 40;
const LINE_MAX = 0.3;
const BUCKETS = 4;
const MAX_NODES = 160;
const MAX_EDGES = 900;
const MOUSE_RADIUS = 190;
const PACKET_KINDS = ["DATA", "SYNC", "IDEAS", "COLLAB"] as const;

interface NetNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  r: number;
  phase: number;
  tw: number;
  base: number;
  fade: number;
  target: 0 | 1;
  cyan: boolean;
}

interface Packet {
  a: NetNode;
  b: NetNode;
  t: number;
  speed: number;
  hopsLeft: number;
  cont: boolean;
  first: boolean;
  cyan: boolean;
  label: string | null;
}

export interface NetworkEngine {
  /** Re-evaluate variant / reduced-motion state. */
  refresh: () => void;
  destroy: () => void;
}

interface EngineOptions {
  getVariant: () => NetworkVariant;
  getReduced: () => boolean;
}

function makeGlow(rgb: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${rgb},0.55)`);
    grad.addColorStop(0.35, `rgba(${rgb},0.16)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }
  return c;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function createNetworkEngine(
  canvas: HTMLCanvasElement,
  ambient: HTMLCanvasElement,
  opts: EngineOptions
): NetworkEngine {
  const ctx = canvas.getContext("2d");
  const actx = ambient.getContext("2d");
  if (!ctx || !actx) return { refresh: () => undefined, destroy: () => undefined };

  const glowBlue = makeGlow("96,165,250");
  const glowCyan = makeGlow("34,211,238");

  let w = 0;
  let h = 0;
  let dpr = 1;
  let tier: Tier = "desktop";
  let cfg: TierConfig = TIERS.desktop;
  let interactive = false;

  const nodes: NetNode[] = [];
  let packets: Packet[] = [];
  let quality = 1;
  let fxLow = false;
  let lastAmbient = -1000;
  let heroMix = opts.getVariant() === "hero" ? 1 : 0;

  // spatial hash
  let cols = 1;
  let rows = 1;
  let cellHead = new Int32Array(1);
  const cellNext = new Int32Array(MAX_NODES);
  const nodeCx = new Int32Array(MAX_NODES);
  const nodeCy = new Int32Array(MAX_NODES);

  // edges (rebuilt every frame)
  const edgeA = new Int32Array(MAX_EDGES);
  const edgeB = new Int32Array(MAX_EDGES);
  const edgeBucket = new Uint8Array(MAX_EDGES);
  let edgeCount = 0;

  // mouse
  let mouseTX = -9999;
  let mouseTY = -9999;
  let mx = -9999;
  let my = -9999;
  let mouseStrength = 0;
  let mouseOn = false;

  let raf = 0;
  let last = 0;
  let running = false;
  let resizeTimer = 0;
  let countTimer = 0;
  let spawnTimer = 1.2;
  let packetSeq = 1;
  let emaDt = 1 / 60;
  let slowFrames = 0;
  let destroyed = false;

  const isReduced = () => opts.getReduced();

  function pickTier(): Tier {
    const iw = window.innerWidth;
    if (iw < 640) return "mobile";
    if (iw < 1024) return "tablet";
    return "desktop";
  }

  function desiredCount(): number {
    const base = clamp(Math.round((w * h) / cfg.divisor), cfg.min, cfg.max);
    const variantCount = opts.getVariant() === "hero" ? base : Math.max(cfg.min, Math.round(base * 0.75));
    return Math.max(8, Math.round(variantCount * quality));
  }

  function spawnPos(): { x: number; y: number } {
    const hero = opts.getVariant() === "hero";
    let x = rand(0, w);
    let y = rand(0, h);
    if (hero) {
      // keep the middle (behind the title) relatively clean
      for (let i = 0; i < 8; i++) {
        const q = ((x - w / 2) / (w * 0.3)) ** 2 + ((y - h / 2) / (h * 0.3)) ** 2;
        if (q >= 1 || Math.random() > 0.85) break;
        x = rand(0, w);
        y = rand(0, h);
      }
    }
    return { x, y };
  }

  function makeNode(fade: number): NetNode {
    const { x, y } = spawnPos();
    const ang = rand(0, Math.PI * 2);
    const sp = rand(cfg.speedMin, cfg.speedMax);
    return {
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      ox: 0,
      oy: 0,
      r: rand(1.1, 2.2) * (tier === "mobile" ? 0.9 : 1),
      phase: rand(0, Math.PI * 2),
      tw: rand(0.4, 1.1),
      base: rand(0.35, 0.85),
      fade,
      target: 1,
      cyan: Math.random() < 0.2,
    };
  }

  function liveCount(): number {
    let c = 0;
    for (const n of nodes) if (n.target === 1) c++;
    return c;
  }

  /** Immediately match the node count to the target (no easing). */
  function snapCount() {
    const want = Math.min(desiredCount(), MAX_NODES - 4);
    for (let i = nodes.length - 1; i >= 0; i--) if (nodes[i].target === 0) nodes.splice(i, 1);
    while (nodes.length < want) nodes.push(makeNode(1));
    while (nodes.length > want) nodes.pop();
  }

  /** Ease the node count towards the target (one node at a time). */
  function stepCount() {
    const want = Math.min(desiredCount(), MAX_NODES - 4);
    const live = liveCount();
    if (live < want && nodes.length < MAX_NODES - 2) {
      nodes.push(makeNode(0));
    } else if (live > want) {
      const candidates = nodes.filter((n) => n.target === 1);
      const victim = candidates[Math.floor(Math.random() * candidates.length)];
      if (victim) victim.target = 0;
    }
  }

  function resize(initial = false) {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    const prevW = w;
    const prevH = h;
    tier = pickTier();
    cfg = TIERS[tier];
    dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
    w = nw;
    h = nh;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    // ambient light is a tiny canvas that the compositor scales up (smooth gradients)
    ambient.width = Math.max(48, Math.ceil(w / 8));
    ambient.height = Math.max(32, Math.ceil(h / 8));

    interactive =
      tier !== "mobile" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!interactive) {
      mouseOn = false;
      mouseTX = mouseTY = mx = my = -9999;
    }

    cols = Math.ceil((w + MARGIN * 2) / cfg.link) + 1;
    rows = Math.ceil((h + MARGIN * 2) / cfg.link) + 1;
    cellHead = new Int32Array(cols * rows);

    if (initial) {
      snapCount();
    } else if (prevW > 0 && prevH > 0) {
      const sx = w / prevW;
      const sy = h / prevH;
      for (const n of nodes) {
        n.x *= sx;
        n.y *= sy;
      }
      if (isReduced()) snapCount();
    }
    if (isReduced()) renderStatic();
  }

  function scheduleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!destroyed) resize(false);
    }, 120);
  }

  function onPointerMove(e: PointerEvent) {
    if (!interactive || e.pointerType === "touch") return;
    mouseTX = e.clientX;
    mouseTY = e.clientY;
    if (!mouseOn) {
      mx = mouseTX;
      my = mouseTY;
    }
    mouseOn = true;
  }

  function onPointerOut() {
    mouseOn = false;
  }

  function onVisibility() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  // ---------------------------------------------------------------- simulate
  function simulate(dt: number) {
    const hero = opts.getVariant() === "hero";
    heroMix += ((hero ? 1 : 0) - heroMix) * Math.min(1, dt * 2.5);

    // mouse smoothing
    const strengthTarget = mouseOn && interactive ? 1 : 0;
    mouseStrength += (strengthTarget - mouseStrength) * Math.min(1, dt * 4);
    if (mouseOn) {
      mx += (mouseTX - mx) * Math.min(1, dt * 8);
      my += (mouseTY - my) * Math.min(1, dt * 8);
    }

    const cx = w / 2;
    const cy = h / 2;
    const damp = Math.exp(-1.6 * dt);
    const span = w + MARGIN * 2;
    const spanY = h + MARGIN * 2;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      // fade towards target
      if (n.fade < n.target) n.fade = Math.min(n.target, n.fade + dt * 0.8);
      else if (n.fade > n.target) n.fade = Math.max(n.target, n.fade - dt * 0.8);
      if (n.target === 0 && n.fade <= 0.01) {
        nodes.splice(i, 1);
        continue;
      }

      // keep the hero centre gently clear
      if (heroMix > 0.02) {
        const nx = (n.x - cx) / (w * 0.3);
        const ny = (n.y - cy) / (h * 0.3);
        const q = nx * nx + ny * ny;
        if (q < 1) {
          const inv = 1 / Math.max(0.15, Math.sqrt(q));
          const push = (1 - q) * 22 * heroMix * dt;
          n.ox += nx * inv * push;
          n.oy += ny * inv * push;
        }
      }

      // subtle pull toward cursor
      if (mouseStrength > 0.02) {
        const dx = mx - n.x;
        const dy = my - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / MOUSE_RADIUS) * 16 * mouseStrength * dt;
          n.ox += (dx / d) * f;
          n.oy += (dy / d) * f;
        }
      }

      n.ox *= damp;
      n.oy *= damp;
      const om = Math.hypot(n.ox, n.oy);
      if (om > 12) {
        n.ox = (n.ox / om) * 12;
        n.oy = (n.oy / om) * 12;
      }

      n.x += (n.vx + n.ox) * dt;
      n.y += (n.vy + n.oy) * dt;

      if (n.x < -MARGIN) n.x += span;
      else if (n.x > w + MARGIN) n.x -= span;
      if (n.y < -MARGIN) n.y += spanY;
      else if (n.y > h + MARGIN) n.y -= spanY;
    }

    // packets
    updatePackets(dt);
  }

  function updatePackets(dt: number) {
    if (edgeCount === 0) return;
    const R = cfg.link;

    spawnTimer -= dt;
    if (spawnTimer <= 0 && packets.length < cfg.maxPackets) {
      spawnTimer = rand(1.4, 3.2);
      const e = Math.floor(Math.random() * edgeCount);
      const a = nodes[edgeA[e]];
      const b = nodes[edgeB[e]];
      if (a && b) {
        const flip = Math.random() < 0.5;
        const cyan = Math.random() < 0.4;
        const kind = PACKET_KINDS[Math.floor(Math.random() * PACKET_KINDS.length)];
        const hops = Math.random() < 0.5 ? 2 : 0;
        packets.push({
          a: flip ? b : a,
          b: flip ? a : b,
          t: 0,
          speed: rand(38, 62),
          hopsLeft: hops,
          cont: hops > 0,
          first: true,
          cyan,
          label:
            tier === "desktop" && Math.random() < 0.3
              ? `${kind}_${String(packetSeq++).padStart(3, "0")}`
              : null,
        });
      }
    }

    const next: Packet[] = [];
    for (const p of packets) {
      const dx = p.b.x - p.a.x;
      const dy = p.b.y - p.a.y;
      const len = Math.hypot(dx, dy);
      if (len < 1 || len > R * 1.25 || p.a.fade < 0.3 || p.b.fade < 0.3) continue;
      p.t += (p.speed * dt) / len;
      if (p.t >= 1) {
        if (p.cont && p.hopsLeft > 0) {
          // hop onto another connection leaving node b
          const from = p.b;
          const options: NetNode[] = [];
          for (let e = 0; e < edgeCount; e++) {
            const na = nodes[edgeA[e]];
            const nb = nodes[edgeB[e]];
            if (!na || !nb) continue;
            if (na === from && nb !== p.a) options.push(nb);
            else if (nb === from && na !== p.a) options.push(na);
          }
          if (options.length > 0) {
            const to = options[Math.floor(Math.random() * options.length)];
            const hopsLeft = p.hopsLeft - 1;
            next.push({
              a: from,
              b: to,
              t: 0,
              speed: p.speed,
              hopsLeft,
              cont: hopsLeft > 0 && Math.random() < 0.6,
              first: false,
              cyan: p.cyan,
              label: p.label,
            });
          }
        }
        continue;
      }
      next.push(p);
    }
    packets = next;
  }

  // ------------------------------------------------------------------ render
  function buildEdges() {
    const R = cfg.link;
    const R2 = R * R;
    const n = nodes.length;
    cellHead.fill(-1);
    for (let i = 0; i < n; i++) {
      const nd = nodes[i];
      const cx = clamp(Math.floor((nd.x + MARGIN) / R), 0, cols - 1);
      const cy = clamp(Math.floor((nd.y + MARGIN) / R), 0, rows - 1);
      nodeCx[i] = cx;
      nodeCy[i] = cy;
      const c = cy * cols + cx;
      cellNext[i] = cellHead[c];
      cellHead[c] = i;
    }

    edgeCount = 0;
    const hero = heroMix;
    const appMul = 0.8 + 0.2 * hero;
    const mxOn = mouseStrength > 0.02;

    const test = (i: number, j: number) => {
      if (edgeCount >= MAX_EDGES) return;
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= R2) return;
      const d = Math.sqrt(d2);
      let alpha = Math.pow(1 - d / R, 1.5) * LINE_MAX * Math.min(a.fade, b.fade) * appMul;
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      if (hero > 0.02) {
        const q = ((midX - w / 2) / (w * 0.34)) ** 2 + ((midY - h / 2) / (h * 0.3)) ** 2;
        const keep = 0.2 + 0.8 * Math.min(1, q);
        alpha *= 1 - hero * (1 - keep);
      }
      if (mxOn) {
        const md = Math.hypot(midX - mx, midY - my);
        if (md < MOUSE_RADIUS + 30) {
          alpha *= 1 + 1.1 * (1 - md / (MOUSE_RADIUS + 30)) * mouseStrength;
        }
      }
      if (alpha < 0.004) return;
      const bucket = Math.min(BUCKETS - 1, Math.floor((alpha / (LINE_MAX * 1.6)) * BUCKETS));
      edgeA[edgeCount] = i;
      edgeB[edgeCount] = j;
      edgeBucket[edgeCount] = bucket;
      edgeCount++;
    };

    for (let i = 0; i < n; i++) {
      const cx = nodeCx[i];
      const cy = nodeCy[i];
      // remaining nodes in own cell
      for (let j = cellNext[i]; j !== -1; j = cellNext[j]) test(i, j);
      // half neighbourhood so each pair is tested once
      if (cx + 1 < cols) for (let j = cellHead[cy * cols + cx + 1]; j !== -1; j = cellNext[j]) test(i, j);
      if (cy + 1 < rows) {
        if (cx - 1 >= 0) for (let j = cellHead[(cy + 1) * cols + cx - 1]; j !== -1; j = cellNext[j]) test(i, j);
        for (let j = cellHead[(cy + 1) * cols + cx]; j !== -1; j = cellNext[j]) test(i, j);
        if (cx + 1 < cols) for (let j = cellHead[(cy + 1) * cols + cx + 1]; j !== -1; j = cellNext[j]) test(i, j);
      }
    }
  }

  // ------------------------------------------------------------ scene layers
  /** Slow-moving blue / cyan light on a low-res canvas (one cheap layer). */
  function drawAmbient(t: number) {
    const aw = ambient.width;
    const ah = ambient.height;
    const m = Math.max(aw, ah);
    actx!.clearRect(0, 0, aw, ah);
    const blobs = [
      { x: aw * (0.08 + 0.1 * Math.sin(t * 0.05)), y: ah * (0.05 + 0.08 * Math.cos(t * 0.043)), r: m * 0.62, c: "59,130,246", a: 0.16 },
      { x: aw * (0.95 + 0.06 * Math.sin(t * 0.037 + 2)), y: ah * (0.98 + 0.06 * Math.cos(t * 0.05 + 1)), r: m * 0.55, c: "34,211,238", a: 0.075 },
      { x: aw * (0.5 + 0.12 * Math.sin(t * 0.03 + 4)), y: ah * (0.45 + 0.1 * Math.cos(t * 0.033 + 3)), r: m * 0.5, c: "59,130,246", a: 0.07 },
    ];
    for (const b of blobs) {
      const g = actx!.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(${b.c},${b.a})`);
      g.addColorStop(1, `rgba(${b.c},0)`);
      actx!.fillStyle = g;
      actx!.fillRect(0, 0, aw, ah);
    }
  }

  /** Extremely faint engineering grid that drifts diagonally. */
  function drawGrid(t: number) {
    const cell = tier === "mobile" ? 48 : 64;
    const off = (t * 4) % cell;
    const cx = w / 2;
    const cy = h * 0.45;
    const dim = heroMix * 0.55;
    ctx!.lineWidth = 1;
    for (let x = -cell + off; x <= w + cell; x += cell) {
      const dx = Math.abs(x - cx);
      let a = 0.05 * Math.max(0, 1 - (dx / (w * 0.62)) ** 2);
      if (dim > 0) a *= 1 - dim * Math.max(0, 1 - dx / (w * 0.28));
      if (a < 0.004) continue;
      const px = Math.round(x) + 0.5;
      ctx!.strokeStyle = `rgba(96,165,250,${a.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(px, 0);
      ctx!.lineTo(px, h);
      ctx!.stroke();
    }
    for (let y = -cell + off; y <= h + cell; y += cell) {
      const dy = Math.abs(y - cy);
      let a = 0.05 * Math.max(0, 1 - (dy / (h * 0.7)) ** 2);
      if (dim > 0) a *= 1 - dim * Math.max(0, 1 - dy / (h * 0.25));
      if (a < 0.004) continue;
      const py = Math.round(y) + 0.5;
      ctx!.strokeStyle = `rgba(96,165,250,${a.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(0, py);
      ctx!.lineTo(w, py);
      ctx!.stroke();
    }
  }

  /** Perspective floor: rays to a vanishing point + rows gliding toward the viewer. */
  function drawFloor(t: number) {
    if (tier === "mobile" || fxLow) return;
    const horizon = h * 0.52;
    const depth = h - horizon;
    const strength = 0.5 + 0.5 * heroMix;
    const cx = w / 2;

    const grad = ctx!.createLinearGradient(0, horizon, 0, h);
    grad.addColorStop(0, "rgba(34,211,238,0)");
    grad.addColorStop(1, `rgba(96,165,250,${(0.075 * strength).toFixed(3)})`);
    ctx!.strokeStyle = grad;
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    const rays = 18;
    const spread = w * 1.6;
    for (let k = -rays / 2; k <= rays / 2; k++) {
      const bx = cx + (k / rays) * spread;
      ctx!.moveTo(cx + (bx - cx) * 0.02, horizon);
      ctx!.lineTo(bx, h);
    }
    ctx!.stroke();

    const rows = 12;
    const phase = (t * 0.07) % 1;
    for (let i = 0; i < rows; i++) {
      const d = (i + phase) / rows;
      const y = horizon + depth * Math.pow(d, 2.2);
      const a = 0.075 * strength * d;
      ctx!.strokeStyle = `rgba(96,165,250,${a.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(0, y);
      ctx!.lineTo(w, y);
      ctx!.stroke();
    }
  }

  function setFxLow(low: boolean) {
    if (fxLow === low) return;
    fxLow = low;
    if (low) document.documentElement.setAttribute("data-fx", "low");
    else document.documentElement.removeAttribute("data-fx");
  }

  function render(t: number, withPackets: boolean) {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);

    drawGrid(t);
    drawFloor(t);

    buildEdges();

    // edges (batched by alpha bucket)
    ctx!.lineWidth = 0.8;
    for (let b = 0; b < BUCKETS; b++) {
      let any = false;
      ctx!.beginPath();
      for (let e = 0; e < edgeCount; e++) {
        if (edgeBucket[e] !== b) continue;
        const na = nodes[edgeA[e]];
        const nb = nodes[edgeB[e]];
        ctx!.moveTo(na.x, na.y);
        ctx!.lineTo(nb.x, nb.y);
        any = true;
      }
      if (any) {
        const a = (LINE_MAX * 1.6 * (b + 0.5)) / BUCKETS;
        ctx!.strokeStyle = `rgba(96,165,250,${a.toFixed(3)})`;
        ctx!.stroke();
      }
    }

    // nodes
    const mxOn = mouseStrength > 0.02;
    for (const n of nodes) {
      const tw = 0.5 + 0.5 * Math.sin(t * n.tw + n.phase);
      let alpha = n.base * (0.55 + 0.45 * tw) * n.fade;
      if (mxOn) {
        const d = Math.hypot(n.x - mx, n.y - my);
        if (d < MOUSE_RADIUS) alpha = Math.min(1, alpha * (1 + 0.8 * (1 - d / MOUSE_RADIUS) * mouseStrength));
      }
      const size = n.r * 9;
      ctx!.globalAlpha = alpha * 0.85;
      ctx!.drawImage(n.cyan ? glowCyan : glowBlue, n.x - size / 2, n.y - size / 2, size, size);
      ctx!.globalAlpha = Math.min(1, alpha * 1.4 + 0.1);
      ctx!.fillStyle = n.cyan ? "#67e8f9" : "#bfdbfe";
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, n.r * 0.7, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.globalAlpha = 1;

    if (withPackets && packets.length > 0) drawPackets();
  }

  function drawPackets() {
    for (const p of packets) {
      const dx = p.b.x - p.a.x;
      const dy = p.b.y - p.a.y;
      const len = Math.hypot(dx, dy) || 1;
      const startEnv = p.first ? Math.min(1, p.t * 5) : 1;
      const endEnv = p.cont ? 1 : Math.min(1, (1 - p.t) * 5);
      const env = Math.min(startEnv, endEnv) * Math.min(p.a.fade, p.b.fade);
      const hx = p.a.x + dx * p.t;
      const hy = p.a.y + dy * p.t;
      const tailT = Math.max(0, p.t - 16 / len);
      const tx = p.a.x + dx * tailT;
      const ty = p.a.y + dy * tailT;

      const rgb = p.cyan ? "34,211,238" : "147,197,253";
      ctx!.lineWidth = 1.2;
      ctx!.strokeStyle = `rgba(${rgb},${(0.45 * env).toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(tx, ty);
      ctx!.lineTo(hx, hy);
      ctx!.stroke();

      ctx!.globalAlpha = 0.9 * env;
      ctx!.drawImage(p.cyan ? glowCyan : glowBlue, hx - 9, hy - 9, 18, 18);
      ctx!.globalAlpha = env;
      ctx!.fillStyle = "#eff6ff";
      ctx!.beginPath();
      ctx!.arc(hx, hy, 1.2, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.globalAlpha = 1;

      if (p.label) {
        ctx!.font = "9px 'JetBrains Mono', ui-monospace, monospace";
        ctx!.fillStyle = `rgba(${rgb},${(0.4 * env).toFixed(3)})`;
        ctx!.fillText(p.label, hx + 7, hy - 7);
      }
    }
  }

  function renderStatic() {
    packets = [];
    for (const n of nodes) n.fade = n.target;
    heroMix = opts.getVariant() === "hero" ? 1 : 0;
    mouseStrength = 0;
    drawAmbient(0);
    render(0, false);
  }

  // -------------------------------------------------------------------- loop
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const minInterval = 1000 / cfg.fps - 4;
    if (now - last < minInterval) return;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;

    // adaptive quality
    emaDt = emaDt * 0.95 + dt * 0.05;
    if (emaDt > (1 / cfg.fps) * 1.9) {
      slowFrames++;
      if (slowFrames > 120 && quality > 0.5) {
        quality = Math.max(0.5, quality - 0.2);
        // second downgrade also sheds the purely decorative CSS/DOM layers
        if (quality <= 0.7) setFxLow(true);
        slowFrames = 0;
        emaDt = 1 / cfg.fps;
      }
    } else {
      slowFrames = Math.max(0, slowFrames - 2);
    }

    simulate(dt);
    if (now - lastAmbient > 90) {
      lastAmbient = now;
      drawAmbient(now / 1000);
    }
    render(now / 1000, true);
  }

  function start() {
    if (running || destroyed || isReduced() || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
    window.clearInterval(countTimer);
    countTimer = window.setInterval(stepCount, 220);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.clearInterval(countTimer);
  }

  function refresh() {
    if (destroyed) return;
    if (isReduced()) {
      stop();
      snapCount();
      renderStatic();
    } else {
      start();
    }
  }

  // -------------------------------------------------------------------- init
  resize(true);
  window.addEventListener("resize", scheduleResize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerOut);
  window.addEventListener("blur", onPointerOut);
  document.addEventListener("visibilitychange", onVisibility);
  refresh();

  return {
    refresh,
    destroy() {
      destroyed = true;
      stop();
      setFxLow(false);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerOut);
      window.removeEventListener("blur", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
