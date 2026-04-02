import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLATFORM_CONFIGS: Record<string, {
  name: string;
  icon: string;
  maxChars: number;
}> = {
  instagram: { name: "Instagram", icon: "\u{1F4F8}", maxChars: 2200 },
  tiktok: { name: "TikTok", icon: "\u{1F3B5}", maxChars: 4000 },
  linkedin: { name: "LinkedIn", icon: "\u{1F4BC}", maxChars: 3000 },
  facebook: { name: "Facebook", icon: "\u{1F4D8}", maxChars: 63206 },
  twitter: { name: "X", icon: "\u{1F426}", maxChars: 280 },
};

function InstagramPreview({ content, imageUrl, userName }: { content: string; imageUrl?: string; userName: string }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden text-black w-full shadow-md">
      <div className="flex items-center gap-2 p-2 border-b border-gray-100">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-[10px] font-semibold truncate">{userName.toLowerCase().replace(/\s/g, "_")}</span>
      </div>
      {imageUrl ? (
        <img src={imageUrl} alt="Post" className="w-full aspect-square object-cover" />
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-[10px]">Kein Bild</span>
        </div>
      )}
      <div className="flex items-center gap-2.5 px-2 py-1.5 text-sm">
        <span>♡</span><span>💬</span><span>✈️</span><span className="ml-auto">🔖</span>
      </div>
      <div className="px-2 pb-2">
        <p className="text-[9px] leading-relaxed">
          <span className="font-semibold">{userName.toLowerCase().replace(/\s/g, "_")}</span>{" "}
          {content.length > 120 ? content.slice(0, 120) + "..." : content}
        </p>
      </div>
    </div>
  );
}

function TikTokPreview({ content, userName }: { content: string; userName: string }) {
  return (
    <div className="bg-black rounded-lg overflow-hidden text-white w-full shadow-md aspect-[9/14] relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5 space-y-1.5">
        <p className="text-[10px] font-semibold">@{userName.toLowerCase().replace(/\s/g, "")}</p>
        <p className="text-[9px] leading-relaxed opacity-90">
          {content.length > 100 ? content.slice(0, 100) + "..." : content}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-[8px] opacity-70">🎵 Originalton</span>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ content, imageUrl, userName }: { content: string; imageUrl?: string; userName: string }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden text-black w-full shadow-md">
      <div className="flex items-center gap-2 p-2 border-b border-gray-100">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold truncate">{userName}</p>
          <p className="text-[8px] text-gray-500">LR Partner</p>
        </div>
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[9px] leading-relaxed text-gray-800">
          {content.length > 150 ? content.slice(0, 150) + "... mehr" : content}
        </p>
      </div>
      {imageUrl && <img src={imageUrl} alt="Post" className="w-full aspect-video object-cover" />}
      <div className="flex items-center justify-between px-2 py-1.5 border-t border-gray-100 text-[8px] text-gray-500">
        <span>👍 Gefällt mir</span>
        <span>💬 Kommentieren</span>
        <span>↗️ Teilen</span>
      </div>
    </div>
  );
}

function TwitterPreview({ content, imageUrl, userName }: { content: string; imageUrl?: string; userName: string }) {
  return (
    <div className="bg-black rounded-lg overflow-hidden text-white w-full shadow-md p-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold truncate">{userName}</p>
          <p className="text-[8px] text-gray-500">@{userName.toLowerCase().replace(/\s/g, "")}</p>
        </div>
      </div>
      <p className="text-[9px] leading-relaxed">
        {content.length > 280 ? (
          <><span>{content.slice(0, 280)}</span><span className="text-red-400">...</span></>
        ) : content}
      </p>
      {imageUrl && <img src={imageUrl} alt="" className="rounded-md mt-1.5 w-full" />}
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
  if (activePlatforms.length === 0) return null;

  const charCount = content.length;
  const isOverLimit = config && charCount > config.maxChars;

  const prev = () => setCurrentIndex(i => (i - 1 + activePlatforms.length) % activePlatforms.length);
  const next = () => setCurrentIndex(i => (i + 1) % activePlatforms.length);

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Vorschau</span>
        </div>
        {/* Platform tabs - scrollable on mobile */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[60%] scrollbar-hide">
          {activePlatforms.map((p, i) => (
            <Badge
              key={p}
              variant={i === currentIndex ? "default" : "outline"}
              className="text-[8px] sm:text-[9px] cursor-pointer px-1 sm:px-1.5 py-0 whitespace-nowrap shrink-0"
              onClick={() => setCurrentIndex(i)}
            >
              {PLATFORM_CONFIGS[p]?.icon}
            </Badge>
          ))}
        </div>
      </div>

      {/* Preview - no phone bezel on mobile, simpler layout */}
      <div className="p-3 sm:p-4 bg-accent/10">
        <div className="relative max-w-[240px] sm:max-w-[260px] mx-auto">
          {/* Simple rounded container instead of heavy phone bezel */}
          <div className="rounded-xl sm:rounded-2xl border-2 border-gray-600 overflow-hidden shadow-lg">
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
              <TwitterPreview content={content} imageUrl={imageUrl} userName={userName} />
            )}
          </div>

          {/* Navigation arrows - only if multiple platforms */}
          {activePlatforms.length > 1 && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="absolute left-[-1.5rem] sm:left-[-2rem] top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                onClick={prev}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-[-1.5rem] sm:right-[-2rem] top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                onClick={next}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Character count */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/30 text-[10px] text-muted-foreground">
        <span>{config?.icon} {charCount} / {config?.maxChars}</span>
        {isOverLimit && <span className="text-red-400 font-medium">Zu lang!</span>}
      </div>
    </div>
  );
}
