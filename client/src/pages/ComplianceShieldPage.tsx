import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, Loader2,
  AlertTriangle, CheckCircle, XCircle, Info, Sparkles,
  ArrowRight, RefreshCw, Scale, FileWarning, Eye,
} from "lucide-react";
import { GlowCard } from "@/components/GlowCard";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter", label: "X/Twitter" },
];

const SEVERITY_CONFIG = {
  critical: { icon: ShieldX, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "KRITISCH" },
  warning: { icon: ShieldAlert, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "WARNUNG" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "HINWEIS" },
  ok: { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "OK" },
};

function ComplianceScoreRing({ score, status }: { score: number; status: string }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = status === "safe" ? "#22c55e" : status === "warning" ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold font-heading"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-[10px] text-muted-foreground">Konformität</span>
      </div>
    </div>
  );
}

export default function ComplianceShieldPage() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");

  const quickMutation = trpc.complianceShield.check.useMutation();
  const deepMutation = trpc.complianceShield.deepCheck.useMutation();

  const isLoading = quickMutation.isPending || deepMutation.isPending;
  const quickResult = quickMutation.data;
  const deepResult = deepMutation.data;

  const handleCheck = async () => {
    if (!content.trim()) {
      toast.error("Bitte gib Content zum Prüfen ein!");
      return;
    }
    quickMutation.mutate({ content, platform });
    deepMutation.mutate({ content, platform });
  };

  const handleReset = () => {
    setContent("");
    quickMutation.reset();
    deepMutation.reset();
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
          <Shield className="h-5 w-5 text-primary" />
          <span className="gradient-text-gold">Smart Compliance Shield</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Automatische Rechtskonformitätsprüfung - MLM, Heilversprechen, UWG, Impressum
        </p>
      </div>

      {/* Input */}
      <GlowCard>
        <div className="p-4 space-y-3">
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              <Eye className="h-4 w-4 inline mr-1.5 text-primary" />
              Content prüfen
            </Label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Füge deinen Post-Text hier ein, um ihn auf rechtliche Konformität zu prüfen..."
              className="min-h-[100px] bg-background/50"
            />
          </div>

          <div className="flex items-end gap-3">
            <div>
              <Label className="text-xs mb-1 block">Plattform</Label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="h-9 rounded-md border border-border/40 bg-background/50 px-3 text-sm"
              >
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="h-9 gap-2 btn-gold"
                onClick={handleCheck}
                disabled={isLoading || !content.trim()}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Prüfe...</>
                ) : (
                  <><Shield className="h-4 w-4" /> Compliance Check</>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </GlowCard>

      {/* Quick Result (sofort) */}
      <AnimatePresence>
        {quickResult && !deepResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <GlowCard>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Quick-Check: {quickResult.score}% Konformität — Deep-Analyse läuft...
                  </span>
                </div>
                {quickResult.checks.length > 0 && (
                  <div className="space-y-1.5">
                    {quickResult.checks.filter((v: any) => v.severity !== 'pass').map((v: any, i: number) => {
                      const sev = SEVERITY_CONFIG[v.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
                      const Icon = sev.icon;
                      return (
                        <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${sev.bg} border ${sev.border}`}>
                          <Icon className={`h-4 w-4 ${sev.color} shrink-0 mt-0.5`} />
                          <div>
                            <p className={`text-xs font-medium ${sev.color}`}>{v.rule}</p>
                            <p className="text-[10px] text-muted-foreground">{v.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Result */}
      <AnimatePresence>
        {deepResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlowCard>
                <div className="p-6 text-center">
                  <ComplianceScoreRing
                    score={deepResult.quick.score}
                    status={deepResult.quick.riskLevel === "low" ? "safe" : deepResult.quick.riskLevel === "medium" ? "warning" : "danger"}
                  />
                  <div className="mt-3">
                    <Badge className={`${
                      deepResult.quick.riskLevel === "low" ? "bg-emerald-500/20 text-emerald-400" :
                      deepResult.quick.riskLevel === "medium" ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    } border-0 text-xs`}>
                      {deepResult.quick.riskLevel === "low" ? "SICHER" :
                       deepResult.quick.riskLevel === "medium" ? "WARNUNG" : "GEFÄHRLICH"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {deepResult.quick.checks.filter((c: any) => c.severity !== 'pass').length} Verstöße gefunden
                  </p>
                </div>
              </GlowCard>

              {/* Kategorie-Übersicht */}
              <GlowCard>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    Prüfbereiche
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Heilversprechen", key: "health_claims" },
                      { label: "Einkommensversprechen", key: "income_claims" },
                      { label: "MLM-Konformität", key: "mlm_compliance" },
                      { label: "Impressumspflicht", key: "impressum" },
                      { label: "Werbekennzeichnung", key: "ad_disclosure" },
                      { label: "Markenrecht", key: "trademark" },
                    ].map((area) => {
                      const areaChecks = deepResult.quick.checks.filter(
                        (v: any) => v.category === area.key && v.severity !== 'pass'
                      );
                      const isOk = areaChecks.length === 0;
                      return (
                        <div key={area.key} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                          <span className="text-xs">{area.label}</span>
                          {isOk ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">
                              <CheckCircle className="h-3 w-3 mr-1" /> OK
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400 border-0 text-[10px]">
                              <XCircle className="h-3 w-3 mr-1" /> {areaChecks.length} Verstoß{areaChecks.length > 1 ? "e" : ""}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Violations Detail */}
            {deepResult.quick.checks.filter((c: any) => c.severity !== 'pass').length > 0 && (
              <GlowCard>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileWarning className="h-4 w-4 text-amber-400" />
                    Gefundene Verstöße
                  </h3>
                  <div className="space-y-2">
                    {deepResult.quick.checks.filter((c: any) => c.severity !== 'pass').map((v: any, i: number) => {
                      const sev = SEVERITY_CONFIG[v.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
                      const Icon = sev.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-3 rounded-lg border ${sev.border} ${sev.bg}`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className={`h-4 w-4 ${sev.color} shrink-0 mt-0.5`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold ${sev.color}`}>{v.rule}</span>
                                <Badge variant="outline" className={`text-[8px] h-4 ${sev.border} ${sev.color}`}>
                                  {sev.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{v.description}</p>
                              {v.matchedText && (
                                <p className="text-[10px] text-red-400/70 mt-1 italic">
                                  Gefunden: "{v.matchedText}"
                                </p>
                              )}
                              {v.suggestion && (
                                <div className="mt-1.5 flex items-start gap-1.5 p-1.5 rounded bg-background/50">
                                  <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                  <span className="text-[10px] text-primary">{v.suggestion}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </GlowCard>
            )}

            {/* Deep AI Analysis */}
            {deepResult.deep && (
              <GlowCard>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    KI-Tiefenanalyse
                  </h3>
                  <div className="bg-background/50 rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {deepResult.deep?.analysis || JSON.stringify(deepResult.deep, null, 2)}
                  </div>
                </div>
              </GlowCard>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <Button variant="outline" className="gap-2 border-primary/30 text-primary" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
                Neuen Content prüfen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!quickResult && !deepResult && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <Shield className="h-16 w-16 mx-auto text-primary/20 mb-4" />
          <h3 className="text-lg font-semibold gradient-text-gold mb-2">Dein Schutzschild</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Prüft automatisch auf Heilversprechen, Einkommensversprechen, MLM-Regeln,
            Impressumspflicht, Werbekennzeichnung und Markenrecht.
            Speziell für Network Marketing / LR optimiert.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6 max-w-lg mx-auto">
            {[
              { icon: "🏥", label: "Heilversprechen" },
              { icon: "💰", label: "Einkommensversprechen" },
              { icon: "📋", label: "MLM-Konformität" },
              { icon: "📝", label: "Impressumspflicht" },
              { icon: "📢", label: "Werbekennzeichnung" },
              { icon: "™️", label: "Markenrecht" },
            ].map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg border border-border/30 bg-card/50 text-center"
              >
                <span className="text-lg">{area.icon}</span>
                <p className="text-[10px] text-muted-foreground mt-1">{area.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
