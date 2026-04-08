import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  Copy, Download, Image, Video, Check, ChevronDown, ChevronUp,
  Hash, Type, Clipboard, Sparkles,
} from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  tiktok: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  linkedin: "bg-blue-700/20 text-blue-200 border-blue-700/30",
  twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  threads: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  youtube: "bg-red-600/20 text-red-300 border-red-600/30",
  pinterest: "bg-red-400/20 text-red-200 border-red-400/30",
};

const PLATFORM_EMOJIS: Record<string, string> = {
  instagram: "📸", facebook: "📘", tiktok: "🎵", linkedin: "💼",
  twitter: "🐦", threads: "🧵", youtube: "🎬", pinterest: "📌",
};

interface ContentCardProps {
  post: {
    id: number;
    content: string;
    editedContent?: string | null;
    mediaUrl?: string | null;
    videoUrl?: string | null;
    contentType: string;
    pillar?: string | null;
    platforms?: string[];
    hashtags?: string | null;
    createdAt: number | Date;
    status: string;
  };
  createdBy?: { name: string | null } | null;
  children?: React.ReactNode;
  showCopyButtons?: boolean;
}

function extractHashtags(text: string): { mainText: string; hashtags: string } {
  const lines = text.split("\n");
  const hashtagLines: string[] = [];
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^#\w/) || trimmed.match(/^(#\w+\s*){3,}/)) {
      hashtagLines.push(trimmed);
    } else {
      textLines.push(line);
    }
  }

  return {
    mainText: textLines.join("\n").trim(),
    hashtags: hashtagLines.join("\n").trim(),
  };
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`, { duration: 1500 });
    return true;
  } catch {
    toast.error("Kopieren fehlgeschlagen");
    return false;
  }
}

async function downloadImage(url: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `content-${Date.now()}.${blob.type.includes("png") ? "png" : "jpg"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success("Bild gespeichert!", { duration: 1500 });
  } catch {
    // Fallback: Open in new tab
    window.open(url, "_blank");
    toast.info("Bild in neuem Tab geöffnet — lange drücken zum Speichern");
  }
}

export function ContentCard({ post, createdBy, children, showCopyButtons = true }: ContentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fullContent = post.editedContent || post.content;
  const { mainText, hashtags } = extractHashtags(fullContent);
  const isLong = fullContent.length > 300;
  const platforms = post.platforms || [];
  const hasImage = !!post.mediaUrl;
  const hasVideo = !!post.videoUrl;

  const handleCopy = async (text: string, field: string, label: string) => {
    const ok = await copyToClipboard(text, label);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    const parts = [mainText];
    if (hashtags) parts.push("\n" + hashtags);
    await handleCopy(parts.join("\n"), "all", "Alles");
  };

  return (
    <Card className="overflow-hidden border-amber-500/10 bg-gradient-to-b from-card to-card/80 hover:border-amber-500/30 transition-all duration-300">
      <CardContent className="p-0">
        {/* Media Preview - Full width, prominent */}
        {hasImage && (
          <div className="relative group">
            <img
              src={post.mediaUrl!}
              alt="Content"
              className="w-full aspect-[4/5] object-cover"
              loading="lazy"
            />
            {/* Overlay with download button */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <Button
                size="lg"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-xl"
                onClick={() => downloadImage(post.mediaUrl!)}
              >
                <Download className="h-5 w-5" />
                Bild speichern
              </Button>
            </div>
            {/* Type badges */}
            <div className="absolute top-3 right-3 flex gap-1.5">
              <Badge className="bg-black/60 text-white border-0 text-xs gap-1 backdrop-blur-sm px-2 py-1">
                <Image className="h-3.5 w-3.5" /> Bild
              </Badge>
            </div>
          </div>
        )}

        {hasVideo && (
          <div className="relative">
            <video
              src={post.videoUrl!}
              className="w-full aspect-video object-cover"
              controls
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-black/60 text-white border-0 text-xs gap-1 backdrop-blur-sm px-2 py-1">
                <Video className="h-3.5 w-3.5" /> Video
              </Badge>
            </div>
          </div>
        )}

        {!hasImage && !hasVideo && (
          <div className="h-32 bg-gradient-to-br from-amber-500/5 to-amber-600/10 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-amber-500/30 mx-auto mb-1" />
              <p className="text-xs text-amber-500/50">Kein Bild/Video</p>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header: Type + Pillar + Date */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                {post.contentType}
              </Badge>
              {post.pillar && (
                <Badge className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {post.pillar}
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {createdBy?.name} · {new Date(post.createdAt).toLocaleDateString("de-DE")}
            </span>
          </div>

          {/* Platforms */}
          {platforms.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {platforms.map(p => (
                <span key={p} className={`text-xs px-2 py-1 rounded-full border ${PLATFORM_COLORS[p] || "bg-accent text-accent-foreground border-border"}`}>
                  {PLATFORM_EMOJIS[p]} {p}
                </span>
              ))}
            </div>
          )}

          {/* Content Text */}
          <div className="relative">
            <div className={`bg-black/20 rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap border border-amber-500/5 ${!expanded && isLong ? "max-h-40 overflow-hidden" : ""}`}>
              {fullContent}
            </div>
            {isLong && !expanded && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent rounded-b-xl" />
            )}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-amber-400 mt-2 hover:text-amber-300 transition-colors"
              >
                {expanded ? <><ChevronUp className="h-3 w-3" /> Weniger anzeigen</> : <><ChevronDown className="h-3 w-3" /> Mehr anzeigen</>}
              </button>
            )}
          </div>

          {/* 1-Tap Copy Buttons */}
          {showCopyButtons && (
            <div className="space-y-2 pt-1">
              {/* Big "Copy All" Button */}
              <Button
                size="lg"
                className="w-full h-12 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-amber-500/20 transition-all duration-300"
                onClick={handleCopyAll}
              >
                {copiedField === "all" ? (
                  <><Check className="h-5 w-5" /> Kopiert!</>
                ) : (
                  <><Clipboard className="h-5 w-5" /> Alles kopieren</>
                )}
              </Button>

              {/* Individual copy buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40"
                  onClick={() => handleCopy(mainText, "text", "Text")}
                >
                  {copiedField === "text" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Type className="h-3.5 w-3.5" />}
                  Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40"
                  onClick={() => handleCopy(hashtags || "#LR #Lifestyle", "hashtags", "Hashtags")}
                >
                  {copiedField === "hashtags" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Hash className="h-3.5 w-3.5" />}
                  Hashtags
                </Button>
                {hasImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-9 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40"
                    onClick={() => downloadImage(post.mediaUrl!)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Bild
                  </Button>
                )}
                {!hasImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-9 border-amber-500/20 opacity-50"
                    disabled
                  >
                    <Image className="h-3.5 w-3.5" />
                    Kein Bild
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Custom actions (Approve/Reject/etc) */}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
