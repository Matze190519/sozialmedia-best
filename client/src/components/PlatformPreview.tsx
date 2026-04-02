import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLATFORM_CONFIGS: Record<string, {
  name: string;
  icon: string;
  maxChars: number;
  bgColor: string;
  headerColor: string;
  accentColor: string;
  fontClass: string;
}> = {
  instagram: {
    name: "Instagram",
    icon: "📸",
    maxChars: 2200,
    bgColor: "bg-white",
    headerColor: "bg-white",
    accentColor: "text-pink-500",
    fontClass: "font-sans",
  },
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    maxChars: 4000,
    bgColor: "bg-black",
    headerColor: "bg-black",
    accentColor: "text-cyan-400",
    fontClass: "font-sans",
  },
  linkedin: {
    name: "LinkedIn",
    icon: "💼",
    maxChars: 3000,
    bgColor: "bg-white",
    headerColor: "bg-[#0a66c2]",
    accentColor: "text-blue-600",
    fontClass: "font-sans",
  },
  facebook: {
    name: "Facebook",
    icon: "📘",
    maxChars: 63206,
    bgColor: "bg-white",
    headerColor: "bg-[#1877f2]",
    accentColor: "text-blue-500",
    fontClass: "font-sans",
  },
  twitter: {
    name: "X / Twitter",
    icon: "🐦",
    maxChars: 280,
    bgColor: "bg-black",
    headerColor: "bg-black",
    accentColor: "text-sky-400",
    fontClass: "font-sans",
  },
};

function InstagramPreview({ content, imageUrl, userName }: { content: string; imageUrl?: string; userName: string }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden text-black w-full max-w-[280px] mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 p-2.5 border-b border-gray-100">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-[10px] font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs font-semibold">{userName.toLowerCase().replace(/\s/g, "_")}</span>
        <span className="text-gray-400 text-[10px] ml-auto">···</span>
      </div>
      {/* Image */}
      {imageUrl ? (
        <img src={imageUrl} alt="Post" className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xs">Kein Bild</span>
        </div>
      )}
      {/* Actions */}
      <div className="flex items-center gap-3 p-2.5">
        <span className="text-lg">♡</span>
        <span className="text-lg">💬</span>
        <span className="text-lg">✈️</span>
        <span className="text-lg ml-auto">🔖</span>
      </div>
      {/* Caption */}
      <div className="px-2.5 pb-3">
        <p className="text-[10px] leading-relaxed">
          <span className="font-semibold">{userName.toLowerCase().replace(/\s/g, "_")}</span>{" "}
          {content.length > 150 ? content.slice(0, 150) + "..." : content}
        </p>
      </div>
    </div>
  );
}

function TikTokPreview({ content, userName }: { content: string; userName: string }) {
  return (
    <div className="bg-black rounded-xl overflow-hidden text-white w-full max-w-[280px] mx-auto shadow-lg aspect-[9/16] relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
        <p className="text-xs font-semibold">@{userName.toLowerCase().replace(/\s/g, "")}</p>
        <p className="text-[10px] leading-relaxed opacity-90">
          {content.length > 120 ? content.slice(0, 120) + "..." : content}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] opacity-70">🎵</span>
          <span className="text-[9px] opacity-70 truncate">Originalton - {userName}</span>
        </div>
      </div>
      {/* Side actions */}
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
        {["♡", "💬", "↗️", "🔖"].map((icon, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-lg">{icon}</span>
            <span className="text-[8px] opacity-60">{Math.floor(Math.random() * 999)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedInPreview({ content, imageUrl, userName }: { content: string; imageUrl?: string; userName: string }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden text-black w-full max-w-[280px] mx-auto shadow-lg">
      <div className="flex items-center gap-2 p-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold">{userName}</p>
          <p className="text-[9px] text-gray-500">LR Health & Beauty Partner</p>
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] leading-relaxed text-gray-800">
          {content.length > 200 ? content.slice(0, 200) + "... mehr anzeigen" : content}
        </p>
      </div>
      {imageUrl && (
        <img src={imageUrl} alt="Post" className="w-full aspect-video object-cover" />
      )}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 text-[9px] text-gray-500">
        <span>👍 Gefällt mir</span>
        <span>💬 Kommentieren</span>
        <span>↗️ Teilen</span>
      </div>
    </div>
  );
}

export default function PlatformPreview({
  content,
  imageUrl,
  platforms = ["instagram"],
  userName = "LR Partner",
}: {
  content: string;
  imageUrl?: string;
  platforms?: string[];
  userName?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activePlatforms = platforms.filter(p => PLATFORM_CONFIGS[p]);
  const currentPlatform = activePlatforms[currentIndex] || "instagram";
  const config = PLATFORM_CONFIGS[currentPlatform];

  if (!content && !imageUrl) return null;

  const charCount = content.length;
  const isOverLimit = config && charCount > config.maxChars;

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
      {/* Header with platform tabs */}
      <div className="flex items-center justify-between p-2 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Vorschau</span>
        </div>
        <div className="flex items-center gap-1">
          {activePlatforms.map((p, i) => (
            <Badge
              key={p}
              variant={i === currentIndex ? "default" : "outline"}
              className="text-[9px] cursor-pointer px-1.5 py-0"
              onClick={() => setCurrentIndex(i)}
            >
              {PLATFORM_CONFIGS[p]?.icon} {PLATFORM_CONFIGS[p]?.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Phone Frame */}
      <div className="p-4 bg-accent/10 flex justify-center">
        <div className="relative">
          {/* Phone bezel */}
          <div className="rounded-[2rem] border-4 border-gray-700 bg-gray-900 p-1 shadow-2xl">
            <div className="rounded-[1.6rem] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPlatform}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentPlatform === "instagram" && (
                    <InstagramPreview content={content} imageUrl={imageUrl} userName={userName} />
                  )}
                  {currentPlatform === "tiktok" && (
                    <TikTokPreview content={content} userName={userName} />
                  )}
                  {currentPlatform === "linkedin" && (
                    <LinkedInPreview content={content} imageUrl={imageUrl} userName={userName} />
                  )}
                  {currentPlatform === "facebook" && (
                    <LinkedInPreview content={content} imageUrl={imageUrl} userName={userName} />
                  )}
                  {currentPlatform === "twitter" && (
                    <div className="bg-black rounded-xl overflow-hidden text-white w-full max-w-[280px] mx-auto shadow-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{userName}</p>
                          <p className="text-[9px] text-gray-500">@{userName.toLowerCase().replace(/\s/g, "")}</p>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {content.length > 280 ? (
                          <><span>{content.slice(0, 280)}</span><span className="text-red-400">... (zu lang!)</span></>
                        ) : content}
                      </p>
                      {imageUrl && <img src={imageUrl} alt="" className="rounded-lg mt-2 w-full" />}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation arrows */}
          {activePlatforms.length > 1 && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="absolute left-[-2rem] top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                onClick={() => setCurrentIndex(i => (i - 1 + activePlatforms.length) % activePlatforms.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                onClick={() => setCurrentIndex(i => (i + 1) % activePlatforms.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Character count */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/30 text-[10px] text-muted-foreground">
        <span>{charCount} / {config?.maxChars} Zeichen</span>
        {isOverLimit && <span className="text-red-400 font-medium">Zu lang!</span>}
      </div>
    </div>
  );
}
