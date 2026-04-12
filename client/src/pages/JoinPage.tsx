import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Sparkles, Loader2 } from "lucide-react";

/**
 * JoinPage - Magic Link Landing
 * 
 * Flow:
 * 1. Partner bekommt Link von Lina: sozialmedia.best/join/TOKEN
 * 2. Diese Seite prüft den Token via REST API
 * 3. Wenn gültig → zeigt Willkommens-Nachricht → Auto-Redirect zum Magic Login
 * 4. Magic Login setzt JWT Cookie → Partner ist eingeloggt
 * 
 * Kein Manus-Konto nötig! Kein Passwort! Kein E-Mail!
 */
export default function JoinPage() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "redirecting">("loading");
  const [tokenInfo, setTokenInfo] = useState<{ name?: string; partnerNumber?: string; reason?: string }>({});

  // Extract token from URL path: /join/:token
  const token = useMemo(() => {
    const path = window.location.pathname;
    const parts = path.split("/");
    const joinIdx = parts.indexOf("join");
    return joinIdx >= 0 && parts[joinIdx + 1] ? parts[joinIdx + 1] : "";
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setTokenInfo({ reason: "Kein Token im Link gefunden" });
      return;
    }

    // Verify token via REST API
    fetch(`/api/lina/invite/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setTokenInfo({ name: data.name, partnerNumber: data.partnerNumber });
          setStatus("valid");

          // Auto-redirect to magic login after 2 seconds
          setTimeout(() => {
            setStatus("redirecting");
            // The magic login endpoint creates a JWT session and redirects to /
            const nameParam = tokenInfo.name ? `?name=${encodeURIComponent(tokenInfo.name)}` : "";
            window.location.href = `/api/auth/magic/${token}${nameParam}`;
          }, 2500);
        } else {
          setStatus(data.reason?.includes("abgelaufen") ? "expired" : "invalid");
          setTokenInfo({ reason: data.reason });
        }
      })
      .catch(() => {
        setStatus("invalid");
        setTokenInfo({ reason: "Verbindungsfehler. Bitte versuche es nochmal." });
      });
  }, [token]);

  if (status === "loading") {
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

  if (status === "invalid" || status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-destructive/30">
            <CardContent className="py-12 text-center">
              {status === "expired" ? (
                <Clock className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              ) : (
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              )}
              <h1 className="text-xl font-bold mb-2">
                {status === "expired" ? "Link abgelaufen" : "Link ungültig"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tokenInfo.reason || "Dieser Einladungs-Link ist nicht mehr gültig."}
              </p>
              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-sm font-medium mb-1">Neuen Link anfordern?</p>
                <p className="text-xs text-muted-foreground">
                  Schreibe einfach <strong>"Content Hub öffnen"</strong> an Lina auf WhatsApp.
                  Sie schickt dir sofort einen neuen Link.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Valid token → Show welcome + auto-redirect
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
              Willkommen{tokenInfo.name ? `, ${tokenInfo.name}` : ""}!
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Du wurdest zum LR Content System eingeladen.
              {tokenInfo.partnerNumber && (
                <span className="block mt-1 text-xs">
                  Partnernummer: <strong>{tokenInfo.partnerNumber}</strong>
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

            {status === "redirecting" ? (
              <div className="mt-6 flex items-center justify-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Du wirst eingeloggt...</span>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Wird vorbereitet...</span>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-4">
              Du wirst automatisch eingeloggt. Kein Passwort nötig.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
