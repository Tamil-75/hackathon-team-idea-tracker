import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Fade + slight rise + blur-to-sharp on every route change.
 * Uses `animation-fill-mode: backwards` (see .route-enter) so no transform or
 * filter remains after the animation — fixed-position modals inside pages keep
 * positioning against the viewport.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="route-enter">
      {children}
    </div>
  );
}
