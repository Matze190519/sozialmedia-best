import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Sparkles, Loader2, Rocket, Zap, Image } from "lucide-react";

/**
 * JoinPage - Magic Link Landing (Premium Gold Design)
 */
export default function JoinPage() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "redirecting">("loading");
  const [tokenInfo, setTokenInfo] = useState<{ name?: string; partnerNumber?: string; reason?: string }>({});

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

    fetch(`/api/lina/invite/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setTokenInfo({ name: data.name, partnerNumber: data.partnerNumber });
          setStatus("valid");
          setTimeout(() => {
            setStatus("redirecting");
            window.location.href = `/api/auth/magic/${token}`;
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

  // Animated gold particles background
  const GoldParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(245,158,11,${0.3 + Math.random() * 0.4}) 0%, transparent 70%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative">
        <GoldParticles />
        <Card className="max-w-md w-full bg-black/60 border-amber-500/20 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4 bg-amber-500/10" />
            <Skeleton className="h-6 w-48 mx-auto mb-2 bg-amber-500/10" />
            <Skeleton className="h-4 w-64 mx-auto bg-amber-500/10" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "invalid" || status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative">
        <GoldParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-black/60 border-amber-500/20 backdrop-blur-xl">
            <CardContent className="py-12 text-center">
              {status === "expired" ? (
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-amber-400" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              )}
              <h1 className="text-xl font-bold text-white mb-2 font-[Montserrat]">
                {status === "expired" ? "Link abgelaufen" : "Link ungültig"}
              </h1>
              <p className="text-sm text-white/60">
                {tokenInfo.reason || "Dieser Einladungs-Link ist nicht mehr gültig."}
              </p>
              <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-400 mb-1">Neuen Link anfordern?</p>
                <p className="text-xs text-white/50">
                  Schreibe einfach <strong className="text-amber-300">"Content Hub öffnen"</strong> an Lina auf WhatsApp.
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative">
      <GoldParticles />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <Card className="bg-black/60 border-amber-500/20 backdrop-blur-xl overflow-hidden">
          {/* Premium Gold Gradient Header */}
          <div className="h-36 bg-gradient-to-br from-amber-600/30 via-yellow-500/20 to-amber-700/30 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, damping: 12 }}
              className="relative z-10"
            >
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Rocket className="h-10 w-10 text-black" />
              </div>
            </motion.div>
          </div>

          <CardContent className="py-8 text-center -mt-4 relative z-10">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-1 font-[Montserrat]"
            >
              Willkommen{tokenInfo.name ? `, ${tokenInfo.name}` : ""}!
            </motion.h1>
            <p className="text-sm text-white/50 mb-6">
              Du wurdest zum <span className="text-amber-400 font-medium">LR Content System</span> eingeladen.
              {tokenInfo.partnerNumber && (
                <span className="block mt-1 text-xs text-white/40">
                  Partnernummer: <strong className="text-amber-300">{tokenInfo.partnerNumber}</strong>
                </span>
              )}
            </p>

            <div className="space-y-2.5">
              {[
                { icon: Zap, title: "KI-Content Generator", desc: "Erstelle Posts, Reels, Karussells mit KI" },
                { icon: Image, title: "Content-Bibliothek", desc: "Fertige Vorlagen kopieren & personalisieren" },
                { icon: Sparkles, title: "One-Click Publishing", desc: "Direkt auf Instagram, TikTok, LinkedIn posten" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-left p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-[10px] text-white/40">{item.desc}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-amber-400/60 ml-auto shrink-0" />
                </motion.div>
              ))}
            </div>

            {status === "redirecting" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex items-center justify-center gap-2"
              >
                <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Du wirst eingeloggt...</span>
              </motion.div>
            ) : (
              <div className="mt-6">
                <div className="flex items-center justify-center gap-2 text-amber-400/80">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Wird vorbereitet...</span>
                </div>
              </div>
            )}

            <p className="text-[10px] text-white/30 mt-4">
              Du wirst automatisch eingeloggt. Kein Passwort nötig.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
