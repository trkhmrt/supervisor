"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ReactNode, useRef } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  className?: string;
  once?: boolean;
  duration?: number;
}

export function Reveal({
  children,
  delay = 0,
  y = 30,
  x = 0,
  scale = 1,
  className,
  once = true,
  duration = 0.8,
}: RevealProps) {
  const reduced = useReducedMotion();
  
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y, x, scale }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, margin: "-100px" }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Parallax({
  children,
  offset = 50,
  className,
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const reduced = useReducedMotion();

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: reduced ? 0 : y }}>
        {children}
      </motion.div>
    </div>
  );
}

export function StaggerContainer({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
