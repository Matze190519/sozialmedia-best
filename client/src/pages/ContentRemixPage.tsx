import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Repeat, Sparkles, Loader2, Copy, Check, Send,
  FileText, Video, Image, MessageSquare, Megaphone,
  ChevronRight, Zap, ArrowRight, RefreshCw,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";

const REMIX_FORMATS = [
  {
    id: "post",
    label: "Feed Post",
    icon: FileText,
    desc: "Klassischer Social Media Post",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "reel",
    label: "Reel Script",
    icon: Video,
    desc: "15-60s Video Script",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
  },
  {
    id: "story",
    label: "Story",
    icon: Image,
    desc: "Story-Sequenz (3-5 Slides)",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    id: "hooks",
    label: "Hooks",
    icon: MessageSquare,
    desc: "5 Aufmerksamkeits-Hooks",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    id: "ad_copy",
    label: "Ad Copy",
    icon: Megaphone,
    desc: "Werbeanzeigen-Text",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
];

interface RemixResult {
  formatId: string;
  content: string;
  postId?: number;
}

export default function ContentRemixPage() {
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("");
  const [isRemixing, setIsRemixing] = useState(false);
  const [results, setResults] = useState<RemixResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateMutation = trpc.content.generate.useMutation();

  const handleRemix = async () => {
    if (!topic.trim()) {
      toast.error("Bitte gib ein Thema ein!");
      return;
    }

    setIsRemixing(true);
    setResults([]);

    const newResults: RemixResult[] = [];

    for (const format of REMIX_FORMATS) {
      try {
        const result = await generateMutation.mutateAsync({
          contentType: format.id as "post" | "reel" | "story" | "hooks" | "ad_copy",
          topic: topic.trim(),
          pillar: pillar || undefined,
          platforms: ["instagram"],
        });
        newResults.push({
          formatId: format.id,
          content: result.content || "",
          postId: result.id,
        });
        // Update results progressively
        setResults([...newResults]);
      } catch (err: any) {
        newResults.push({
          formatId: format.id,
          content: `Fehler: ${err.message || "Generierung fehlgeschlagen"}`,
        });
        setResults([...newResults]);
      }
    }

    setIsRemixing(false);
    toast.success(`${newResults.length} Content-Formate generiert!`);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Kopiert!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl space-y-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Repeat className="h-5 w-5 text-primary" />
          Content Remix Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ein Thema → 5 verschiedene Content-Formate. Automatisch.
        </p>
      </div>

      {/* Input Section */}
      <GlowCard glowColor="rgba(99, 102, 241, 0.1)">
        <div className="p-4 space-y-3">
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              <Sparkles className="h-4 w-4 inline mr-1.5 text-primary" />
              Dein Thema / Idee
            </Label>
            <Textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="z.B. 'Mein erstes Autokonzept-Auto bei LR' oder 'Warum Aloe Vera besser als jede Creme ist'"
              className="min-h-[80px] bg-background/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Content-Säule (optional)</Label>
              <select
                value={pillar}
                onChange={e => setPillar(e.target.value)}
                className="w-full h-9 rounded-md border border-border/40 bg-background/50 px-3 text-sm"
              >
                <option value="">Automatisch</option>
                <option value="Autokonzept">Autokonzept</option>
                <option value="Business Opportunity">Business Opportunity</option>
                <option value="Produkt-Highlight">Produkt-Highlight</option>
                <option value="Lina KI-Demo">Lina KI-Demo</option>
                <option value="Lifestyle & Erfolg">Lifestyle & Erfolg</option>
              </select>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-5">
              <Button
                size="lg"
                className="h-9 gap-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90"
                onClick={handleRemix}
                disabled={isRemixing || !topic.trim()}
              >
                {isRemixing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Remixing...
                  </>
                ) : (
                  <>
                    <Repeat className="h-4 w-4" />
                    5x Remix starten
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </GlowCard>

      {/* Format Preview (before generation) */}
      {results.length === 0 && !isRemixing && (
        <div className="grid grid-cols-5 gap-2">
          {REMIX_FORMATS.map((format, i) => {
            const Icon = format.icon;
            return (
              <motion.div
                key={format.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-lg border ${format.borderColor} ${format.bgColor} text-center`}
              >
                <Icon className={`h-5 w-5 mx-auto mb-1 ${format.color}`} />
                <p className="text-xs font-medium">{format.label}</p>
                <p className="text-[9px] text-muted-foreground">{format.desc}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {isRemixing && results.length < 5 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div>
            <p className="text-sm font-medium">
              Generiere Format {results.length + 1}/5: {REMIX_FORMATS[results.length]?.label}...
            </p>
            <p className="text-xs text-muted-foreground">
              KI erstellt {5 - results.length} weitere Formate
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.map((result, i) => {
          const format = REMIX_FORMATS.find(f => f.id === result.formatId);
          if (!format) return null;
          const Icon = format.icon;
          const isCopied = copiedId === format.id;

          return (
            <motion.div
              key={format.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlowCard glowColor={`rgba(99, 102, 241, 0.05)`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-md ${format.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${format.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{format.label}</p>
                        <p className="text-[10px] text-muted-foreground">{format.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleCopy(format.id, result.content)}
                      >
                        {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {isCopied ? "Kopiert!" : "Kopieren"}
                      </Button>
                      <Badge variant="outline" className={`text-[8px] h-4 ${format.color} ${format.borderColor}`}>
                        {result.content.length} Zeichen
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-md p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {result.content}
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Success Actions */}
      {results.length === 5 && !isRemixing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 justify-center pt-2"
        >
          <Button
            onClick={() => { setResults([]); setTopic(""); }}
            className="gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Neues Thema remixen
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const all = results.map(r => {
                const f = REMIX_FORMATS.find(f => f.id === r.formatId);
                return `=== ${f?.label?.toUpperCase()} ===\n${r.content}`;
              }).join("\n\n");
              navigator.clipboard.writeText(all);
              toast.success("Alle 5 Formate kopiert!");
            }}
            className="gap-1.5"
          >
            <Copy className="h-4 w-4" />
            Alle kopieren
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
