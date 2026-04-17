import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, CheckCircle, Shield, Hash, Flame, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type LoopStep = "idle" | "scanning" | "generating" | "compliance" | "done";

interface LoopResult {
  postId: number;
  trendTitle: string;
  complianceStatus: "green" | "yellow" | "red" | "skipped";
  complianceMessage?: string;
  hashtags: string[];
  imageUrl?: string;
}

const STEP_INFO: Record<LoopStep, { icon: typeof Rocket; label: string; desc: string }> = {
  idle: { icon: Rocket, label: "Bereit", desc: "Klick auf Start — KI erledigt den Rest" },
  scanning: { icon: Flame, label: "Trends scannen", desc: "Suche virale Trends auf TikTok, YouTube, Reddit..." },
  generating: { icon: Rocket, label: "Content generieren", desc: "KI erstellt Post + Bild + Hashtags aus Top-Trend..." },
  compliance: { icon: Shield, label: "Compliance prüfen", desc: "Prüfe auf Heilaussagen, Verdienstversprechen..." },
  done: { icon: CheckCircle, label: "Fertig", desc: "Posts liegen in der Freigabe — du musst nur noch klicken" },
};

export default function AutoLoopPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<LoopStep>("idle");
  const [results, setResults] = useState<LoopResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanMutation = trpc.trends.scan.useMutation();
  const topTrends = trpc.trends.top.useQuery(undefined, { enabled: false });
  const autopilotMutation = trpc.trends.autopilot.useMutation();
  const complianceCheck = trpc.complianceShield.check.useMutation();
  const utils = trpc.useUtils();

  const runLoop = useCallback(async () => {
    setStep("scanning");
    setResults([]);
    setError(null);

    try {
      await scanMutation.mutateAsync();
      const { data: trends } = await topTrends.refetch();

      if (!trends || trends.length === 0) {
        setError("Keine Trends gefunden. Versuche es in ein paar Stunden nochmal.");
        setStep("idle");
        return;
      }

      const topThree = trends.slice(0, 3);

      setStep("generating");
      const loopResults: LoopResult[] = [];

      for (const trend of topThree) {
        try {
          const post = await autopilotMutation.mutateAsync({
            trendId: trend.id,
            trendTitle: trend.title,
            trendPlatform: trend.platform,
            trendPillar: trend.pillar || "lifestyle",
            trendViralScore: trend.viralScore ?? undefined,
            generateImage: true,
          });

          setStep("compliance");
          let complianceStatus: LoopResult["complianceStatus"] = "skipped";
          let complianceMessage: string | undefined;

          try {
            const check = await complianceCheck.mutateAsync({
              content: trend.title,
              platform: trend.platform,
            });
            if (check && typeof check === "object" && "status" in check) {
              complianceStatus = (check as { status: string }).status as LoopResult["complianceStatus"];
              complianceMessage = (check as { message?: string }).message;
            }
          } catch {
            complianceStatus = "skipped";
          }

          loopResults.push({
            postId: post.postId,
            trendTitle: trend.title,
            complianceStatus,
            complianceMessage,
            hashtags: post.hashtags || [],
            imageUrl: post.imageUrl ?? undefined,
          });
        } catch {
          loopResults.push({
            postId: 0,
            trendTitle: trend.title,
            complianceStatus: "skipped",
            complianceMessage: "Generierung fehlgeschlagen",
            hashtags: [],
          });
        }
      }

      setResults(loopResults);
      setStep("done");
      utils.content.list.invalidate();
      utils.dashboard.stats.invalidate();

      const successCount = loopResults.filter(r => r.postId > 0).length;
      toast.success(`Auto-Loop fertig: ${successCount} Posts erstellt!`);
    } catch {
      setError("Auto-Loop fehlgeschlagen. Bitte nochmal versuchen.");
      setStep("idle");
    }
  }, [scanMutation, topTrends, autopilotMutation, complianceCheck, utils]);

  const currentStepInfo = STEP_INFO[step];
  const StepIcon = currentStepInfo.icon;
  const isRunning = step !== "idle" && step !== "done";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Auto-Content-Loop
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trend scannen → Post generieren → Compliance prüfen → Freigabe. Komplett automatisch.
        </p>
      </div>

      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${isRunning ? "bg-primary/20 animate-pulse" : step === "done" ? "bg-emerald-500/20" : "bg-primary/10"}`}>
                {isRunning ? (
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                ) : (
                  <StepIcon className={`h-7 w-7 ${step === "done" ? "text-emerald-400" : "text-primary"}`} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{currentStepInfo.label}</h3>
                <p className="text-sm text-muted-foreground">{currentStepInfo.desc}</p>
              </div>
            </div>
            {step === "idle" && (
              <Button
                size="lg"
                className="btn-gold h-12 px-8 text-base font-semibold shadow-lg"
                onClick={runLoop}
              >
                <Rocket className="h-5 w-5 mr-2" />
                Auto-Loop starten
              </Button>
            )}
            {step === "done" && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setStep("idle"); setResults([]); }}>
                  Nochmal
                </Button>
                <Button className="btn-gold" onClick={() => setLocation("/approval")}>
                  Zur Freigabe
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {isRunning && (
            <div className="mt-4 flex gap-2">
              {(["scanning", "generating", "compliance"] as const).map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    step === s ? "bg-primary animate-pulse" :
                    ["scanning", "generating", "compliance"].indexOf(step) > i ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-200">{error}</p>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold">Ergebnisse</h2>
            {results.map((r, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.trendTitle}</p>
                    {r.hashtags.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {r.hashtags.slice(0, 5).join(" ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.postId > 0 ? (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 gap-1">
                        <CheckCircle className="h-3 w-3" /> Erstellt
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">Fehler</Badge>
                    )}
                    {r.complianceStatus === "green" && (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 gap-1">
                        <Shield className="h-3 w-3" /> Clean
                      </Badge>
                    )}
                    {r.complianceStatus === "yellow" && (
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30 gap-1">
                        <Shield className="h-3 w-3" /> Warnung
                      </Badge>
                    )}
                    {r.complianceStatus === "red" && (
                      <Badge variant="destructive" className="gap-1">
                        <Shield className="h-3 w-3" /> Stopp
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">So funktioniert der Auto-Loop</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: Flame, label: "Trends scannen", desc: "TikTok, YouTube, Reddit" },
            { icon: Rocket, label: "Post generieren", desc: "Text + Bild + Hashtags" },
            { icon: Shield, label: "Compliance prüfen", desc: "Rechtskonformität" },
            { icon: CheckCircle, label: "Zur Freigabe", desc: "Du gibst frei" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3">
              <s.icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">{s.label}</span>
              <span className="text-[10px] text-muted-foreground">{s.desc}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
