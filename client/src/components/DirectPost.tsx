import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Copy, ExternalLink, CheckCircle, Image, Video,
  Instagram, Globe, Linkedin, Twitter, Youtube, MessageCircle,
  Smartphone, ClipboardCheck,
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
  instagram: "bg-gradient-to-br from-pink-500 to-purple-600",
  facebook: "bg-gradient-to-br from-blue-600 to-blue-700",
  tiktok: "bg-gradient-to-br from-cyan-400 to-pink-500",
  linkedin: "bg-gradient-to-br from-blue-700 to-blue-800",
  twitter: "bg-gradient-to-br from-sky-400 to-sky-500",
  youtube: "bg-gradient-to-br from-red-600 to-red-700",
  threads: "bg-gradient-to-br from-gray-600 to-gray-700",
};

interface DirectPostProps {
  contentPostId: number;
  onClose?: () => void;
}

export function DirectPost({ contentPostId, onClose }: DirectPostProps) {
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedMedia, setCopiedMedia] = useState(false);
  const [markedPlatforms, setMarkedPlatforms] = useState<Set<string>>(new Set());

  const { data, isLoading } = trpc.directPost.getForCopy.useQuery({ contentPostId });
  const markPublished = trpc.directPost.markPublished.useMutation({
    onSuccess: () => {
      toast.success("Als gepostet markiert!");
    },
  });

  const copyToClipboard = async (text: string, type: "content" | "media") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "content") {
        setCopiedContent(true);
        setTimeout(() => setCopiedContent(false), 3000);
      } else {
        setCopiedMedia(true);
        setTimeout(() => setCopiedMedia(false), 3000);
      }
      toast.success(type === "content" ? "Text kopiert!" : "Medien-URL kopiert!");
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const handleMarkPublished = async (platform: string) => {
    await markPublished.mutateAsync({ contentPostId, platform });
    setMarkedPlatforms(prev => new Set(prev).add(platform));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
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
            <Smartphone className="h-5 w-5 text-primary" />
            Manuell posten
          </h3>
          <p className="text-sm text-muted-foreground">
            Kopiere den Content und poste direkt auf der Plattform
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>Schließen</Button>
        )}
      </div>

      {/* Step 1: Copy Content */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] p-0">1</Badge>
            Text kopieren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/20 rounded-lg p-3 border border-border/20 mb-3 max-h-40 overflow-y-auto">
            <p className="text-xs whitespace-pre-wrap">{data.content}</p>
          </div>
          <Button
            onClick={() => copyToClipboard(data.content, "content")}
            className="w-full gap-2"
            variant={copiedContent ? "default" : "outline"}
          >
            {copiedContent ? (
              <><ClipboardCheck className="h-4 w-4" /> Kopiert!</>
            ) : (
              <><Copy className="h-4 w-4" /> Text in Zwischenablage kopieren</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Copy Media (if available) */}
      {(data.mediaUrl || data.videoUrl) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] p-0">2</Badge>
              Medien herunterladen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {data.mediaUrl && (
                <div className="flex-1">
                  <div className="bg-black/20 rounded-lg overflow-hidden mb-2 h-20">
                    <img src={data.mediaUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => copyToClipboard(data.mediaUrl!, "media")}>
                      <Copy className="h-3 w-3" /> URL kopieren
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" asChild>
                      <a href={data.mediaUrl} target="_blank" rel="noopener noreferrer" download>
                        <Image className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              {data.videoUrl && (
                <div className="flex-1">
                  <div className="bg-black/20 rounded-lg overflow-hidden mb-2 h-20 flex items-center justify-center">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => copyToClipboard(data.videoUrl!, "media")}>
                      <Copy className="h-3 w-3" /> URL kopieren
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-xs" asChild>
                      <a href={data.videoUrl} target="_blank" rel="noopener noreferrer" download>
                        <Video className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Open Platform & Mark as Posted */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] p-0">
              {data.mediaUrl || data.videoUrl ? "3" : "2"}
            </Badge>
            Plattform öffnen & posten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.platforms.map((platform, idx) => {
              const Icon = PLATFORM_ICONS[platform.name.toLowerCase()] || Globe;
              const colorClass = PLATFORM_COLORS[platform.name.toLowerCase()] || "bg-gray-600";
              const isMarked = markedPlatforms.has(platform.name);

              return (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-card/50"
                >
                  <div className={`h-8 w-8 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{platform.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-7" asChild>
                      <a href={platform.webUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" /> Öffnen
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant={isMarked ? "default" : "outline"}
                      className="gap-1 text-xs h-7"
                      onClick={() => handleMarkPublished(platform.name)}
                      disabled={isMarked || markPublished.isPending}
                    >
                      {isMarked ? (
                        <><CheckCircle className="h-3 w-3" /> Gepostet</>
                      ) : (
                        <><CheckCircle className="h-3 w-3" /> Als gepostet markieren</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
