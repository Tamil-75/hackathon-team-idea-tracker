import { useEffect, useRef } from "react";
import { createNetworkEngine } from "./networkEngine";
import type { NetworkEngine, NetworkVariant } from "./networkEngine";

interface NetworkCanvasProps {
  variant: NetworkVariant;
  reducedMotion: boolean;
}

/** Thin React wrapper around the imperative canvas engine. */
export default function NetworkCanvas({ variant, reducedMotion }: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambientRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NetworkEngine | null>(null);
  const variantRef = useRef<NetworkVariant>(variant);
  const reducedRef = useRef<boolean>(reducedMotion);

  useEffect(() => {
    variantRef.current = variant;
    engineRef.current?.refresh();
  }, [variant]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
    engineRef.current?.refresh();
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ambient = ambientRef.current;
    if (!canvas || !ambient) return;
    const engine = createNetworkEngine(canvas, ambient, {
      getVariant: () => variantRef.current,
      getReduced: () => reducedRef.current,
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <>
      <canvas ref={ambientRef} className="sys-ambient-canvas" aria-hidden="true" />
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
    </>
  );
}
