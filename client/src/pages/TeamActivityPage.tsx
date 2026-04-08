import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Activity, FileText, CheckCircle, XCircle, Send, Image, Video,
  BookOpen, TrendingUp, Layers, LogIn, UserPlus, Clock,
} from "lucide-react";

const ACTION_CONFIG: Record<string, { icon: typeof Activity; label: string; color: string }> = {
  content_created: { icon: FileText, label: "Content erstellt", color: "text-amber-400" },
  content_approved: { icon: CheckCircle, label: "Content genehmigt", color: "text-emerald-400" },
  content_rejected: { icon: XCircle, label: "Content abgelehnt", color: "text-red-400" },
  content_published: { icon: Send, label: "Content veröffentlicht", color: "text-amber-400" },
  content_edited: { icon: FileText, label: "Content bearbeitet", color: "text-amber-400" },
  image_generated: { icon: Image, label: "Bild generiert", color: "text-pink-400" },
  video_generated: { icon: Video, label: "Video generiert", color: "text-amber-400" },
  template_created: { icon: BookOpen, label: "Vorlage erstellt", color: "text-orange-400" },
  library_shared: { icon: Layers, label: "In Bibliothek geteilt", color: "text-indigo-400" },
  trend_scanned: { icon: TrendingUp, label: "Trend gescannt", color: "text-lime-400" },
  carousel_created: { icon: Layers, label: "Karussell erstellt", color: "text-fuchsia-400" },
  login: { icon: LogIn, label: "Eingeloggt", color: "text-gray-400" },
  joined: { icon: UserPlus, label: "Beigetreten", color: "text-emerald-400" },
};

function formatTimeAgo(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Gerade eben";
  if (diffMin < 60) return `Vor ${diffMin} Min.`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Vor ${diffH} Std.`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Vor ${diffD} Tagen`;
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export default function TeamActivityPage() {
  const { data: activities, isLoading } = trpc.teamActivity.list.useQuery({ limit: 100 });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  // Group activities by date
  const grouped: Record<string, typeof activities> = {};
  for (const item of activities || []) {
    const date = new Date(item.activity.createdAt).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          Team-Aktivitäten
        </h1>
        <p className="text-muted-foreground mt-1">Echtzeit-Stream aller Team-Aktionen</p>
      </div>

      {/* Activity Stream */}
      {Object.keys(grouped).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">Noch keine Aktivitäten</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sobald Team-Mitglieder Content erstellen, genehmigen oder posten, erscheinen die Aktivitäten hier.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
              <div className="flex-1 h-px bg-border/30" />
              <Badge variant="outline" className="text-[10px]">{items!.length} Aktionen</Badge>
            </div>
            <div className="space-y-2">
              {items!.map((item, idx) => {
                const config = ACTION_CONFIG[item.activity.actionType] || {
                  icon: Activity,
                  label: item.activity.actionType,
                  color: "text-gray-400",
                };
                const Icon = config.icon;

                return (
                  <motion.div
                    key={item.activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card className="hover:border-border/60 transition-colors">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                          <div className={`h-8 w-8 rounded-lg bg-card border border-border/30 flex items-center justify-center shrink-0 ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {item.user?.name || "Unbekannt"}
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">
                                {config.label}
                              </Badge>
                            </div>
                            {item.activity.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {item.activity.description}
                              </p>
                            )}
                          </div>
                          <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(item.activity.createdAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
