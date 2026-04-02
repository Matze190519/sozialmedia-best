import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Sparkles, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function JoinPage() {
  // Extract token from URL
  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  }, []);

  const { data, isLoading } = trpc.inviteTokens.verify.useQuery(
    { token },
    { enabled: !!token }
  );

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Kein Einladungs-Token</h1>
            <p className="text-sm text-muted-foreground">
              Du benötigst einen gültigen Einladungs-Link um beizutreten.
              Bitte kontaktiere deinen Team-Leader.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full border-destructive/30">
            <CardContent className="py-12 text-center">
              {data?.reason?.includes("abgelaufen") ? (
                <Clock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              ) : (
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              )}
              <h1 className="text-xl font-bold mb-2">Einladung ungültig</h1>
              <p className="text-sm text-muted-foreground">
                {data?.reason || "Dieser Einladungs-Link ist nicht mehr gültig."}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Bitte kontaktiere deinen Team-Leader für einen neuen Link.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="border-primary/30 overflow-hidden">
          {/* Gradient Header */}
          <div className="h-32 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTEydjRoMTJ6TTI0IDI0aDEydi0ySDE0djJoMTB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Sparkles className="h-16 w-16 text-white" />
            </motion.div>
          </div>

          <CardContent className="py-8 text-center">
            <h1 className="text-2xl font-bold mb-2">
              Willkommen{data.name ? `, ${data.name}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Du wurdest zum LR Content System eingeladen.
              {data.partnerNumber && (
                <span className="block mt-1 text-xs">
                  Partnernummer: <strong>{data.partnerNumber}</strong>
                </span>
              )}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-card border border-border/30">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">KI-Content Generator</p>
                  <p className="text-[10px] text-muted-foreground">Erstelle Posts, Reels, Karussells mit KI</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-card border border-border/30">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Content-Bibliothek</p>
                  <p className="text-[10px] text-muted-foreground">Fertige Vorlagen kopieren & personalisieren</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-card border border-border/30">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">One-Click Publishing</p>
                  <p className="text-[10px] text-muted-foreground">Direkt auf Instagram, TikTok, LinkedIn posten</p>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-6 gap-2 h-12 text-base"
              onClick={() => {
                // Store token in localStorage for after login
                localStorage.setItem("lr_invite_token", token);
                window.location.href = getLoginUrl();
              }}
            >
              Jetzt beitreten <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="text-[10px] text-muted-foreground mt-4">
              Du wirst zur Anmeldung weitergeleitet. Nach der Anmeldung wirst du automatisch freigeschaltet.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
