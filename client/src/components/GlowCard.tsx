import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
  onClick?: () => void;
}

export function GlowCard({
  children,
  className,
  glowColor = "rgba(16, 185, 129, 0.15)",
  delay = 0,
  onClick,
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border border-border/40 bg-card/80",
        "transition-shadow duration-300",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        boxShadow: `0 0 20px -8px ${glowColor}`,
      }}
    >
      {children}
    </motion.div>
  );
}

export function GlowBadge({
  children,
  className,
  color = "emerald",
}: {
  children: ReactNode;
  className?: string;
  color?: "emerald" | "amber" | "blue" | "violet" | "red" | "cyan";
}) {
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-400 shadow-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 shadow-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 shadow-blue-500/20",
    violet: "bg-violet-500/10 text-violet-400 shadow-violet-500/20",
    red: "bg-red-500/10 text-red-400 shadow-red-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 shadow-cyan-500/20",
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "shadow-sm",
        colorMap[color],
        className
      )}
    >
      {children}
    </motion.span>
  );
}
