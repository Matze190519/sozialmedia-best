import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Sparkles, ArrowRight, Type, Hash, Scissors, Expand,
  Smile, Languages, Zap, Target, Loader2, Copy, Check,
  ChevronDown, ChevronUp, Lightbulb, Wand2,
} from "lucide-react";

const COPILOT_ACTIONS = [
  { id: "continue" as const, label: "Weiterschreiben", icon: ArrowRight, color: "text-blue-400", desc: "KI schreibt weiter" },
  { id: "improve" as const, label: "Verbessern", icon: Sparkles, color: "text-purple-400", desc: "Text optimieren" },
  { id: "hook" as const, label: "3 Hooks", icon: Zap, color: "text-amber-400", desc: "Alternative Einstiege" },
  { id: "cta" as const, label: "3 CTAs", icon: Target, color: "text-emerald-400", desc: "Call-to-Actions" },
  { id: "hashtags" as const, label: "Hashtags", icon: Hash, color: "text-cyan-400", desc: "5 relevante Tags" },
  { id: "shorten" as const, label: "Kürzen", icon: Scissors, color: "text-orange-400", desc: "Auf die Hälfte" },
  { id: "lengthen" as const, label: "Verlängern", icon: Expand, color: "text-pink-400", desc: "Doppelt so lang" },
  { id: "emoji" as const, label: "Emojis", icon: Smile, color: "text-yellow-400", desc: "Emojis einfügen" },
  { id: "translate" as const, label: "Englisch", icon: Languages, color: "text-indigo-400", desc: "Ins Englische" },
] as const;

type CopilotAction = typeof COPILOT_ACTIONS[number]["id"];

export default function AICopilot({
  content,
  onApply,
  platform = "instagram",
  contentType = "post",
}: {
  content: string;
  onApply: (newContent: string) => void;
  platform?: string;
  contentType?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [lastAction, setLastAction] = useState<CopilotAction | null>(null);
  const [copied, setCopied] = useState(false);

  const suggestMut = trpc.aiCopilot.suggest.useMutation({
    onSuccess: (data) => {
      setSuggestion(data.suggestion);
      setLastAction(data.action as CopilotAction);
      setExpanded(true);
    },
    onError: (err) => toast.error("Copilot-Fehler: " + err.message),
  });

  const handleAction = (action: CopilotAction) => {
    if (!content.trim()) {
      toast.error("Erst etwas Text eingeben");
      return;
    }
    suggestMut.mutate({ text: content, platform, contentType, action });
  };

  const handleApply = () => {
    if (!suggestion) return;
    // For hooks, CTAs, hashtags: append. For others: replace
    if (lastAction === "hook" || lastAction === "cta") {
      toast.success("Vorschläge angezeigt - wähle den besten aus und kopiere ihn!");
    } else if (lastAction === "hashtags") {
      onApply(content + "\n\n" + suggestion);
      toast.success("Hashtags angehängt!");
    } else {
      onApply(suggestion);
      toast.success("Text übernommen!");
    }
    setSuggestion("");
    setExpanded(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    toast.success("Kopiert!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-blue-500/20 rounded-lg overflow-hidden bg-blue-500/5">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-blue-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">KI-Copilot</span>
          <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400">
            9 Aktionen
          </Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-blue-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 border-t border-blue-500/20 space-y-3">
              {/* Action Buttons Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {COPILOT_ACTIONS.map((action) => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant="outline"
                    className={`h-auto py-1.5 px-2 text-[10px] gap-1 border-blue-500/20 hover:bg-blue-500/10 flex-col items-center ${
                      suggestMut.isPending && lastAction === action.id ? "opacity-50" : ""
                    }`}
                    onClick={() => handleAction(action.id)}
                    disabled={suggestMut.isPending}
                  >
                    {suggestMut.isPending && lastAction === action.id ? (
                      <Loader2 className={`h-3.5 w-3.5 animate-spin ${action.color}`} />
                    ) : (
                      <action.icon className={`h-3.5 w-3.5 ${action.color}`} />
                    )}
                    <span>{action.label}</span>
                  </Button>
                ))}
              </div>

              {/* Suggestion Result */}
              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-amber-400" />
                      KI-Vorschlag ({COPILOT_ACTIONS.find(a => a.id === lastAction)?.label})
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[9px]" onClick={handleCopy}>
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto border border-blue-500/10">
                    {suggestion}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-[10px] gap-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleApply}
                    >
                      <Wand2 className="h-3 w-3" />
                      {lastAction === "hook" || lastAction === "cta" ? "Kopieren" : "Übernehmen"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] gap-1 border-blue-500/20"
                      onClick={() => { setSuggestion(""); setLastAction(null); }}
                    >
                      Verwerfen
                    </Button>
                  </div>
                </motion.div>
              )}

              {!content.trim() && (
                <p className="text-[10px] text-muted-foreground text-center py-2">
                  Schreibe erst etwas Text, dann kann der Copilot helfen.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
