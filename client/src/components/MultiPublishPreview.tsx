import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Eye, CheckCircle, AlertCircle, Image, Video,
  Instagram, Globe, Linkedin, Twitter, Youtube, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

const PLATFORM_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Globe,
  tiktok: MessageCircle,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  threads: MessageCircle,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "from-pink-500 to-purple-600",
  facebook: "from-blue-600 to-blue-700",
  tiktok: "from-cyan-400 to-pink-500",
  linkedin: "from-blue-700 to-blue-800",
  twitter: "from-sky-400 to-sky-500",
  youtube: "from-red-600 to-red-700",
  threads: "from-gray-600 to-gray-700",
};

interface MultiPublishPreviewProps {
  contentPostId: number;
  onClose?: () => void;
  onPublished?: () => void;
}

export function MultiPublishPreview({ contentPostId, onClose, onPublished }: MultiPublishPreviewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);

  const { data, isLoading } = trpc.multiPublish.preview.useQuery({ contentPostId });
  const publishMutation = trpc.multiPublish.publishSelected.useMutation({
    onSuccess: (result) => {
      toast.success(`Content auf ${result.platformCount} Plattformen geplant!`);
      onPublished?.();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
  };

  const selectAll = () => {
    if (data) setSelectedPlatforms(new Set(data.previews.map(p => p.platform)));
  };

  const handlePublish = async () => {
    if (selectedPlatforms.size === 0) {
      toast.error("Keine Plattform ausgewählt");
      return;
    }
    setPublishing(true);
    try {
      await publishMutation.mutateAsync({
        contentPostId,
        platforms: Array.from(selectedPlatforms),
      });
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Multi-Publish Vorschau
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.totalPlatforms} Plattformen · {data.connectedAccounts} verbundene Konten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Alle auswählen
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>Schließen</Button>
          )}
        </div>
      </div>

      {/* Platform Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {data.previews.map((preview, idx) => {
            const Icon = PLATFORM_ICONS[preview.platform.toLowerCase()] || Globe;
            const gradient = PLATFORM_COLORS[preview.platform.toLowerCase()] || "from-gray-500 to-gray-600";
            const isSelected = selectedPlatforms.has(preview.platform);

            return (
              <motion.div
                key={preview.platform}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/20" : "hover:border-border/60"
                  }`}
                  onClick={() => togglePlatform(preview.platform)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm capitalize">{preview.platform}</CardTitle>
                          <p className="text-[10px] text-muted-foreground">{preview.accountName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {preview.hasAccount ? (
                          <Badge variant="default" className="text-[9px] h-5">
                            <CheckCircle className="h-2.5 w-2.5 mr-1" /> Verbunden
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] h-5 text-amber-400 border-amber-500/30">
                            <AlertCircle className="h-2.5 w-2.5 mr-1" /> Fallback
                          </Badge>
                        )}
                        <Checkbox checked={isSelected} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Phone-like preview */}
                    <div className="bg-black/30 rounded-lg p-3 border border-border/20">
                      {/* Media preview */}
                      {(preview.mediaUrl || preview.videoUrl) && (
                        <div className="mb-2 rounded-md overflow-hidden bg-black/20 h-24 flex items-center justify-center">
                          {preview.mediaUrl ? (
                            <img src={preview.mediaUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Video className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      {/* Content preview */}
                      <p className="text-xs line-clamp-4">{preview.content.substring(0, 200)}...</p>
                      {/* Stats bar */}
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>{preview.charCount}/{preview.charLimit} Zeichen</span>
                        {preview.truncated && (
                          <Badge variant="destructive" className="text-[8px] h-4">Wird gekürzt</Badge>
                        )}
                        <div className="flex items-center gap-1">
                          {preview.mediaUrl && <Image className="h-3 w-3 text-emerald-400" />}
                          {preview.videoUrl && <Video className="h-3 w-3 text-violet-400" />}
                        </div>
                      </div>
                    </div>
                    {/* Tone info */}
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      <span className="font-medium">Ton:</span> {preview.tone}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Publish Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm"
      >
        <div>
          <p className="text-sm font-medium">
            {selectedPlatforms.size} von {data.totalPlatforms} Plattformen ausgewählt
          </p>
          {!data.hasBlotatoKey && (
            <p className="text-[10px] text-amber-400">Kein Blotato Key - nutze "Manuell posten" stattdessen</p>
          )}
        </div>
        <Button
          onClick={handlePublish}
          disabled={selectedPlatforms.size === 0 || publishing || !data.hasBlotatoKey}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {publishing ? "Wird veröffentlicht..." : `Auf ${selectedPlatforms.size} Plattformen posten`}
        </Button>
      </motion.div>
    </div>
  );
}
