import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "../hooks/useInView";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
  /** Draw an animated top border when revealed. */
  border?: boolean;
  as?: ElementType;
}

/** Progressive scroll reveal (IntersectionObserver-based, runs once). */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  border = false,
  as: Tag = "div",
}: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;
  return (
    <Tag
      ref={ref}
      style={style}
      className={`reveal ${border ? "border-reveal" : ""} ${inView ? "is-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
