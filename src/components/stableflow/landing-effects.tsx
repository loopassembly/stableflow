"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function LandingReveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.36,
        delay: immediate ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function LandingTiltPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        setRotateX((0.5 - y) * 7.5);
        setRotateY((x - 0.5) * 9);
      }}
      onMouseLeave={() => {
        setRotateX(0);
        setRotateY(0);
      }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.65 }}
      style={{ transformStyle: "preserve-3d", perspective: 1800 }}
    >
      {children}
    </motion.div>
  );
}

export function LandingSignalBars() {
  return (
    <div aria-hidden className="sf-signal-bars">
      {Array.from({ length: 14 }).map((_, index) => (
        <span
          key={index}
          className="sf-signal-bar"
          style={
            {
              animationDelay: `${index * 0.08}s`,
              height: `${18 + ((index % 5) + 1) * 10}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
