import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Zap, CheckCircle, XCircle, Send, Image, Video,
  FileText, Clock, User, Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "./dateUtils";

export interface ActivityItem {
  id: number;
  type: "created" | "approved" | "rejected" | "published" | "scheduled" | "media_generated";
  userName: string;
  contentPreview: string;
  timestamp: Date;
  platform?: string;
}

const activityConfig: Record<string, {
  icon: typeof Zap;
  color: string;
  bg: string;
  label: string;
}> = {
  created: { icon: Zap, color: "text-primary", bg: "bg-primary/10", label: "hat Content erstellt" },
  approved: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "hat freigegeben" },
  rejected: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "hat abgelehnt" },
  published: { icon: Send, color: "text-blue-400", bg: "bg-blue-500/10", label: "hat gepostet" },
  scheduled: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", label: "hat geplant" },
  media_generated: { icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10", label: "hat Media generiert" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-xs">
        <Clock className="h-6 w-6 mx-auto mb-2 opacity-30" />
        Noch keine Aktivitäten
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => {
          const config = activityConfig[item.type] || activityConfig.created;
          const Icon = config.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-accent/30 transition-colors"
            >
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">
                  <span className="font-medium text-foreground">{item.userName}</span>{" "}
                  <span className="text-muted-foreground">{config.label}</span>
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {item.contentPreview}
                </p>
              </div>
              <span className="text-[9px] text-muted-foreground/60 shrink-0 mt-1">
                {formatDistanceToNow(item.timestamp)}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
