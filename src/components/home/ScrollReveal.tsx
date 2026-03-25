"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { ReactNode, CSSProperties } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Delay in ms for stagger effects */
  delay?: number;
  /** Direction of entrance */
  direction?: "up" | "left" | "right" | "none";
  /** Distance in px */
  distance?: number;
  /** Animation duration in ms */
  duration?: number;
  as?: "div" | "section";
}

export default function ScrollReveal({
  children,
  className = "",
  style,
  delay = 0,
  direction = "up",
  distance = 30,
  duration = 500,
  as: Tag = "div",
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal();

  const getTransform = () => {
    if (direction === "none") return "none";
    switch (direction) {
      case "left":
        return `translateX(-${distance}px)`;
      case "right":
        return `translateX(${distance}px)`;
      default:
        return `translateY(${distance}px)`;
    }
  };

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0, 0)" : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
