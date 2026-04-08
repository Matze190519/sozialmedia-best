import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { trpc as trpcTyped } from "@/lib/trpc";
const trpc = trpcTyped as any;
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Loader2,
  Copy, Users, Search, Info, Zap, RefreshCw,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";

export default function DuplicateCheckPage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<{
    isDuplicate: boolean;
    similarity: number;
    matches: Array<{ postId: number; similarity: number; preview: string; authorName: string }>;
    totalChecked: number;
  } | null>(null);

  const checkMutation = trpc.duplicateCheck.check.useMutation({
    onSuccess: (data: {
      isDuplicate: boolean;
      similarity: number;
      matches: Array<{ postId: number; similarity: number; preview: string; authorName: string }>;
      totalChecked: number;
    }) => {
      setResult(data);
      if (data.isDuplicate) {
        toast.warning("⚠️ Ähnlicher Content gefunden! Bitte umschreiben.");
      } else {
        toast.success("✅ Kein Duplikat gefunden! Content ist einzigartig.");
      }
    },
    onError: () => toast.error("Fehler beim Prüfen"),
  });

  const handleCheck = () => {
    if (!content.trim() || content.trim().length < 20) {
      toast.error("Bitte mindestens 20 Zeichen eingeben!");
      return;
    }
    checkMutation.mutate({ content, threshold: 0.6 });
  };

  const getSimilarityColor = (sim: number) => {
    if (sim >= 75) return "text-red-400";
    if (sim >= 50) return "text-amber-400";
    return "text-emerald-400";
  };

  const getSimilarityBg = (sim: number) => {
    if (sim >= 75) return "bg-red-500/10 border-red-500/20";
    if (sim >= 50) return "bg-amber-500/10 border-amber-500/20";
    return "bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <motion.div
      className="space-y-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text-gold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Duplicate Check
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prüft ob dein Text schon von einem anderen Teammitglied gepostet wurde — verhindert Algorithmus-Bestrafung.
        </p>
      </div>

      {/* Warum wichtig */}
      <GlowCard className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Warum das wichtig ist:</strong> Wenn 10 Partner denselben Text posten, bestraft der Instagram/TikTok-Algorithmus alle Posts als "Spam". Dein Reach bricht ein. Dieser Check stellt sicher, dass dein Content einzigartig ist.
          </div>
        </div>
      </GlowCard>

      {/* Input */}
      <GlowCard className="p-5">
        <Label className="text-sm font-semibold mb-3 block">Deinen Text hier einfügen</Label>
        <Textarea
          className="min-h-[140px] text-sm resize-none"
          placeholder="Füge hier deinen geplanten Post-Text ein. Der Check vergleicht ihn mit den letzten 50 Posts deiner Teammitglieder..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{content.length} Zeichen</span>
          <Button
            onClick={handleCheck}
            disabled={checkMutation.isPending || content.trim().length < 20}
            className="btn-gold h-9 text-sm gap-2"
          >
            {checkMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Prüfe...</>
            ) : (
              <><Search className="h-4 w-4" /> Jetzt prüfen</>
            )}
          </Button>
        </div>
      </GlowCard>

      {/* Ergebnis */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status Banner */}
            <GlowCard className={`p-5 border-2 ${result.isDuplicate ? "border-red-500/30 bg-red-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
              <div className="flex items-center gap-3">
                {result.isDuplicate ? (
                  <AlertTriangle className="h-8 w-8 text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className={`text-lg font-bold ${result.isDuplicate ? "text-red-400" : "text-emerald-400"}`}>
                    {result.isDuplicate ? "⚠️ Ähnlicher Content gefunden!" : "✅ Einzigartiger Content!"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {result.isDuplicate
                      ? "Bitte deinen Text umschreiben, bevor du ihn postest."
                      : `Geprüft gegen ${result.totalChecked} Team-Posts — kein Duplikat gefunden.`}
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Matches */}
            {result.matches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Ähnliche Posts im Team ({result.matches.length})</span>
                </div>
                {result.matches.map((match, i) => (
                  <GlowCard key={i} className={`p-4 border ${getSimilarityBg(match.similarity)}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">von</span>
                        <span className="text-xs font-semibold">{match.authorName}</span>
                      </div>
                      <div className={`text-sm font-bold ${getSimilarityColor(match.similarity)}`}>
                        {match.similarity}% ähnlich
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{match.preview}"
                    </p>
                    <div className="mt-2">
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            match.similarity >= 75 ? "bg-red-400" :
                            match.similarity >= 50 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${match.similarity}%` }}
                        />
                      </div>
                    </div>
                  </GlowCard>
                ))}
              </div>
            )}

            {/* Tipps bei Duplikat */}
            {result.isDuplicate && (
              <GlowCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Tipps zum Umschreiben</span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Nutze den <strong className="text-foreground">Content Remix</strong> um deinen Text in 7 neue Formate umzuwandeln</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Ändere den <strong className="text-foreground">Einstieg</strong> — die ersten 2 Sätze sind am wichtigsten</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Füge deine <strong className="text-foreground">persönliche Geschichte</strong> oder Erfahrung hinzu</li>
                  <li className="flex items-start gap-2"><span className="text-primary mt-0.5">→</span> Wechsle die <strong className="text-foreground">Zielgruppe</strong> — sprich andere Menschen an</li>
                </ul>
              </GlowCard>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => { setResult(null); setContent(""); }}
            >
              <RefreshCw className="h-3 w-3" /> Neuen Text prüfen
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
