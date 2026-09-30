import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  /** Stay `true` after the first intersection (default). */
  once?: boolean;
}

/**
 * Lightweight IntersectionObserver hook. Falls back to "visible" when the
 * API is unavailable so content is never left hidden.
 */
export function useInView<T extends Element>(
  options: UseInViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, rootMargin = "0px 0px -8% 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
