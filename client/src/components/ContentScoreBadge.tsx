import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentScoreBadgeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreConfig(score: number) {
  if (score >= 85) {
    return {
      label: "Viral-Potenzial",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      ring: "ring-emerald-500/30",
      glow: "shadow-emerald-500/20",
      icon: Flame,
      description: "Dieser Content hat hohes virales Potenzial!",
    };
  }
  if (score >= 65) {
    return {
      label: "Stark",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      ring: "ring-blue-500/30",
      glow: "shadow-blue-500/20",
      icon: TrendingUp,
      description: "Guter Content mit solidem Engagement-Potenzial.",
    };
  }
  if (score >= 40) {
    return {
      label: "Ausbaufähig",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/30",
      glow: "shadow-amber-500/20",
      icon: Zap,
      description: "Kann mit Optimierung deutlich besser performen.",
    };
  }
  return {
    label: "Überarbeiten",
    color: "text-red-400",
    bg: "bg-red-500/10",
    ring: "ring-red-500/30",
    glow: "shadow-red-500/20",
    icon: AlertTriangle,
    description: "Dieser Content braucht noch Arbeit.",
  };
}

export function ContentScoreBadge({
  score,
  size = "md",
  showLabel = true,
}: ContentScoreBadgeProps) {
  const config = getScoreConfig(score);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "h-6 w-6 text-[9px]",
    md: "h-8 w-8 text-xs",
    lg: "h-12 w-12 text-base",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex items-center gap-1.5"
        >
          <div
            className={cn(
              "relative rounded-full flex items-center justify-center font-bold",
              "ring-2 shadow-lg",
              config.bg,
              config.color,
              config.ring,
              config.glow,
              sizeClasses[size]
            )}
          >
            {score}
            {/* Pulse ring for high scores */}
            {score >= 85 && (
              <motion.div
                className={cn("absolute inset-0 rounded-full", config.ring, "ring-2")}
                animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          {showLabel && (
            <div className="flex items-center gap-1">
              <Icon className={cn("h-3 w-3", config.color)} />
              <span className={cn("text-[10px] font-medium", config.color)}>
                {config.label}
              </span>
            </div>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <div className="space-y-1">
          <p className="font-semibold text-xs">Content Score: {score}/100</p>
          <p className="text-[10px] text-muted-foreground">{config.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Calculate a content score based on post attributes.
 * This runs client-side for instant feedback.
 */
export function calculateContentScore(post: {
  content: string;
  hashtags?: string[];
  mediaUrl?: string | null;
  videoUrl?: string | null;
  platforms?: string[];
  pillar?: string | null;
}): number {
  let score = 0;

  // Content length (optimal 100-280 chars for social)
  const len = post.content?.length || 0;
  if (len >= 100 && len <= 280) score += 20;
  else if (len >= 50 && len <= 500) score += 12;
  else if (len > 0) score += 5;

  // Has hook (starts with question, emoji, or strong statement)
  const firstLine = post.content?.split("\n")[0] || "";
  if (/^[❓🔥💡🚀⚡️✨🎯💰]/.test(firstLine) || firstLine.endsWith("?") || firstLine.endsWith("!")) {
    score += 15;
  } else if (firstLine.length > 0) {
    score += 5;
  }

  // Has CTA (call to action keywords)
  const ctaKeywords = ["link", "kommentier", "teile", "folge", "klick", "schreib", "dm", "bio", "jetzt", "hier"];
  const lowerContent = post.content?.toLowerCase() || "";
  if (ctaKeywords.some(k => lowerContent.includes(k))) {
    score += 15;
  }

  // Has media
  if (post.videoUrl) score += 20; // Video is king
  else if (post.mediaUrl) score += 15; // Image is great

  // Has hashtags
  const hashtagCount = post.hashtags?.length || 0;
  if (hashtagCount >= 3 && hashtagCount <= 8) score += 10;
  else if (hashtagCount > 0) score += 5;

  // Multi-platform
  const platformCount = post.platforms?.length || 0;
  if (platformCount >= 3) score += 10;
  else if (platformCount >= 1) score += 5;

  // Has content pillar (strategic alignment)
  if (post.pillar) score += 10;

  return Math.min(100, score);
}
