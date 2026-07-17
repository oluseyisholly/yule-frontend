"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MotionDirection = "up" | "down" | "left" | "right" | "none";

type MotionChildrenProps = {
  children: ReactNode;
  className?: string;
};

const smoothEase = [0.22, 1, 0.36, 1] as [
  number,
  number,
  number,
  number,
];

function getDirectionOffset(direction: MotionDirection) {
  switch (direction) {
    case "down":
      return { y: -28 };
    case "left":
      return { x: 36 };
    case "right":
      return { x: -36 };
    case "none":
      return {};
    case "up":
    default:
      return { y: 28 };
  }
}

export function LandingPageMotionShell({
  children,
  className,
}: MotionChildrenProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: smoothEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  amount = 0.2,
}: MotionChildrenProps & {
  direction?: MotionDirection;
  delay?: number;
  amount?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, ...getDirectionOffset(direction) }
      }
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: smoothEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: smoothEase },
  },
};

export function MotionStagger({ children, className }: MotionChildrenProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : staggerContainer}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({
  children,
  className,
}: MotionChildrenProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionFloat({ children, className }: MotionChildrenProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? undefined
          : {
              y: [0, -10, 0],
              rotate: [-0.5, 0.5, -0.5],
            }
      }
      transition={{
        duration: 5.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const sparkleDots = [
  { top: "8%", left: "6%", size: "size-2", color: "bg-[#FFB800]" },
  { top: "18%", left: "88%", size: "size-3", color: "bg-[#FF6B6B]" },
  { top: "62%", left: "4%", size: "size-2.5", color: "bg-[#3300C9]" },
  { top: "76%", left: "92%", size: "size-2", color: "bg-[#1FAB54]" },
  { top: "40%", left: "78%", size: "size-1.5", color: "bg-[#FF6600]" },
];

export function CelebrationSprinkles({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {sparkleDots.map((dot, index) => (
        <motion.span
          key={`${dot.top}-${dot.left}`}
          className={cn(
            "absolute rounded-full opacity-80 blur-[0.2px]",
            dot.size,
            dot.color,
          )}
          style={{ top: dot.top, left: dot.left }}
          animate={{
            y: [0, index % 2 === 0 ? -18 : 16, 0],
            x: [0, index % 2 === 0 ? 10 : -8, 0],
            scale: [1, 1.25, 1],
            opacity: [0.45, 0.95, 0.45],
          }}
          transition={{
            duration: 3.8 + index * 0.35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
