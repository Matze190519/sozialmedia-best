import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Repeat, Sparkles, Loader2, Copy, Check,
  FileText, Video, Briefcase, Youtube, Twitter,
  Headphones, Star, ChevronDown, ChevronUp, RefreshCw,
  Zap, Music, Camera, Clock, Hash,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";

const FORMAT_CONFIG: Record<string, {
  icon: typeof FileText;
  color: string;
  bg: string;
  border: string;
  platform: string;
  isNew?: boolean;
}> = {
  carousel: { icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", platform: "Instagram" },
  reel_script: { icon: Video, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", platform: "TikTok" },
  linkedin: { icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", platform: "LinkedIn" },
  youtube_shorts: { icon: Youtube, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", platform: "YouTube" },
  twitter_thread: { icon: Twitter, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", platform: "X/Twitter" },
  asmr_script: { icon: Headphones, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", platform: "TikTok", isNew: true },
  hopecore_reel: { icon: Star, color: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/20", platform: "Instagram", isNew: true },
};

const ALL_FORMATS = ["carousel", "reel_script", "linkedin", "youtube_shorts", "twitter_thread", "asmr_script", "hopecore_reel"] as const;

export default function ContentRemix7Page() {
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>([...ALL_FORMATS]);
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatsMutation = trpc.contentRemix.formats.useQuery();
  const remixSelectedMutation = trpc.contentRemix.remixSelected.useMutation();
  const saveToQueueMutation = trpc.contentRemix.saveAsPost.useMutation();
  const [savedFormats, setSavedFormats] = useState<string[]>([]);

  const isLoading = remixSelectedMutation.isPending;
  const results = remixSelectedMutation.data;

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleRemix = async () => {
    if (!content.trim()) {
      toast.error("Bitte gib Content zum Remixen ein!");
      return;
    }
    if (selectedFormats.length === 0) {
      toast.error("Wähle mindestens ein Format!");
      return;
    }
    remixSelectedMutation.mutate({
      content: content.trim(),
      formats: selectedFormats as any,
      topic: topic || undefined,
      pillar: pillar || undefined,
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Kopiert!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setContent("");
    setTopic("");
    remixSelectedMutation.reset();
    setSavedFormats([]);
  };

  const handleSaveAsPost = async (remix: any) => {
    const isScript = remix.format === "asmr_script" || remix.format === "hopecore_reel";
    const config = FORMAT_CONFIG[remix.format];
    try {
      await saveToQueueMutation.mutateAsync({
        content: remix.content,
        format: remix.format,
        platform: config?.platform || "instagram",
        hashtags: remix.hashtags,
        topic: topic || undefined,
        pillar: pillar || undefined,
        isInternal: isScript, // ASMR & Hopecore Scripts = intern (nicht in normale Queue)
        internalCategory: isScript ? remix.format : undefined,
      });
      setSavedFormats(prev => [...prev, remix.format]);
      toast.success(isScript
        ? `${remix.formatLabel} intern gespeichert (nur Admin sichtbar)`
        : `${remix.formatLabel} in Freigabe-Queue gespeichert!`);
    } catch (e) {
      toast.error("Fehler beim Speichern!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl space-y-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2 font-heading">
          <Repeat className="h-5 w-5 text-primary" />
          <span className="gradient-text-gold">Content Remix 1→7</span>
          <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px]">NEU</Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          1 Post → 7 Formate inkl. ASMR-Script und Hopecore Reel. Automatisch.
        </p>
      </div>

      {/* Input */}
      <GlowCard>
        <div className="p-4 space-y-3">
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              <Sparkles className="h-4 w-4 inline mr-1.5 text-primary" />
              Original-Content
            </Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Füge deinen bestehenden Post-Text hier ein, der in 7 Formate verwandelt werden soll..."
              className="min-h-[100px] bg-background/50"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-1 block">Thema (optional)</Label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="z.B. Autokonzept, Aloe Vera..."
                className="w-full h-9 rounded-md border border-border/40 bg-background/50 px-3 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Content-Säule</Label>
              <select
                value={pillar}
                onChange={e => setPillar(e.target.value)}
                className="h-9 rounded-md border border-border/40 bg-background/50 px-3 text-sm"
              >
                <option value="">Automatisch</option>
                <option value="Autokonzept">Autokonzept</option>
                <option value="Business Opportunity">Business Opportunity</option>
                <option value="Produkt-Highlight">Produkt-Highlight</option>
                <option value="Lina KI-Demo">Lina KI-Demo</option>
                <option value="Lifestyle & Erfolg">Lifestyle & Erfolg</option>
              </select>
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Format Selection */}
      <GlowCard>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Formate wählen ({selectedFormats.length}/7)
            </h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedFormats([...ALL_FORMATS])}
              >
                Alle
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedFormats([])}
              >
                Keine
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {ALL_FORMATS.map((formatId) => {
              const config = FORMAT_CONFIG[formatId];
              const format = formatsMutation.data?.find((f: any) => f.id === formatId);
              const Icon = config.icon;
              const isSelected = selectedFormats.includes(formatId);

              return (
                <motion.button
                  key={formatId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleFormat(formatId)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? `${config.border} ${config.bg} ring-1 ring-primary/20`
                      : "border-border/20 bg-background/30 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    {config.isNew && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[8px] h-4 px-1">NEU</Badge>
                    )}
                  </div>
                  <p className="text-xs font-medium">{format?.label || formatId}</p>
                  <p className="text-[9px] text-muted-foreground">{format?.description || config.platform}</p>
                </motion.button>
              );
            })}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
            <Button
              className="w-full h-10 gap-2 btn-gold text-base"
              onClick={handleRemix}
              disabled={isLoading || !content.trim() || selectedFormats.length === 0}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Remixe {selectedFormats.length} Formate...</>
              ) : (
                <><Repeat className="h-4 w-4" /> 1→{selectedFormats.length} Remix starten</>
              )}
            </Button>
          </motion.div>
        </div>
      </GlowCard>

      {/* Results */}
      <AnimatePresence>
        {results && results.remixes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold gradient-text-gold">
                {results.remixes.length} Formate generiert
              </h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                const all = results.remixes.map((r: any) =>
                  `=== ${r.formatLabel?.toUpperCase()} (${r.platform}) ===\n${r.content}\n\n${r.hashtags?.length ? r.hashtags.join(" ") : ""}`
                ).join("\n\n---\n\n");
                navigator.clipboard.writeText(all);
                toast.success(`Alle ${results.remixes.length} Formate kopiert!`);
              }}>
                <Copy className="h-3 w-3" /> Alle kopieren
              </Button>
            </div>

            {results.remixes.map((remix: any, i: number) => {
              const config = FORMAT_CONFIG[remix.format] || FORMAT_CONFIG.carousel;
              const Icon = config.icon;
              const isExpanded = expandedFormat === remix.format;
              const isCopied = copiedId === remix.format;

              return (
                <motion.div
                  key={remix.format}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <GlowCard>
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{remix.formatLabel}</p>
                              {config.isNew && (
                                <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[8px]">NEU</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>{config.platform}</span>
                              {remix.estimatedDuration && (
                                <><Clock className="h-3 w-3" /> {remix.estimatedDuration}</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {savedFormats.includes(remix.format) ? (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <Check className="h-3 w-3" /> Gespeichert
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 text-xs gap-1 ${
                                remix.format === "asmr_script" || remix.format === "hopecore_reel"
                                  ? "text-amber-400 hover:text-amber-300"
                                  : "text-emerald-400 hover:text-emerald-300"
                              }`}
                              onClick={() => handleSaveAsPost(remix)}
                              disabled={saveToQueueMutation.isPending}
                            >
                              {saveToQueueMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                              {remix.format === "asmr_script" || remix.format === "hopecore_reel" ? "Intern" : "Speichern"}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleCopy(remix.format, remix.content)}
                          >
                            {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            {isCopied ? "Kopiert!" : "Kopieren"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setExpandedFormat(isExpanded ? null : remix.format)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Content Preview (always visible) */}
                      <div className={`bg-background/50 rounded-md p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        isExpanded ? "max-h-none" : "max-h-[120px] overflow-hidden relative"
                      }`}>
                        {remix.content}
                        {!isExpanded && remix.content.length > 300 && (
                          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                        )}
                      </div>

                      {/* Meta Info (expanded) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2"
                          >
                            {/* Hashtags */}
                            {remix.hashtags?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <Hash className="h-3.5 w-3.5 text-primary" />
                                {remix.hashtags.map((tag: string, j: number) => (
                                  <Badge key={j} variant="outline" className="text-[10px] border-primary/20 text-primary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Music Suggestion */}
                            {remix.musicSuggestion && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                                <Music className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-[10px] text-muted-foreground">{remix.musicSuggestion}</span>
                              </div>
                            )}

                            {/* Production Notes */}
                            {remix.productionNotes && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                                <Camera className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="text-[10px] text-muted-foreground">{remix.productionNotes}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </GlowCard>
                </motion.div>
              );
            })}

            {/* Reset */}
            <div className="flex justify-center pt-2">
              <Button variant="outline" className="gap-2 border-primary/30 text-primary" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
                Neuen Content remixen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!results && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <Repeat className="h-14 w-14 mx-auto text-primary/20 mb-3" />
          <h3 className="text-lg font-semibold gradient-text-gold mb-2">1 Post → 7 Formate</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Verwandle einen einzigen Post in 7 verschiedene Content-Formate.
            Inkl. ASMR-Script und Hopecore Motivational Reel.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 max-w-2xl mx-auto">
            {ALL_FORMATS.map((formatId, i) => {
              const config = FORMAT_CONFIG[formatId];
              const Icon = config.icon;
              return (
                <motion.div
                  key={formatId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-2 rounded-lg border ${config.border} ${config.bg} text-center relative`}
                >
                  {config.isNew && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <span className="text-[8px] bg-amber-500 text-black font-bold px-1 rounded">NEU</span>
                    </div>
                  )}
                  <Icon className={`h-5 w-5 mx-auto mb-1 ${config.color}`} />
                  <p className="text-[9px] font-medium">{config.platform}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
