import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { useMemo } from "react";

const MOTIVATIONAL_QUOTES = [
  "Heute ist der perfekte Tag für viralen Content.",
  "Dein nächster Post könnte der Durchbruch sein.",
  "Konsistenz schlägt Perfektion. Jeden Tag ein Schritt.",
  "Die besten Creator posten, wenn andere schlafen.",
  "Content ist King. Dein Content ist Emperor.",
  "Jeder Post bringt dich näher an dein Ziel.",
  "Deine Community wartet auf deinen nächsten Beitrag.",
  "Heute Trends setzen, morgen Ergebnisse ernten.",
  "Authentizität ist dein stärkstes Marketing-Tool.",
  "Mach heute den Content, den du morgen feiern wirst.",
  "Dein Engagement-Rate wird es dir danken.",
  "Erfolg ist kein Zufall. Es ist ein System.",
  "Die beste Zeit zu posten war gestern. Die zweitbeste ist jetzt.",
  "Dein Business wächst mit jedem Beitrag.",
];

function getTimeOfDay(): { greeting: string; icon: typeof Sun; period: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: "Guten Morgen", icon: Sunrise, period: "morning" };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: "Guten Tag", icon: Sun, period: "afternoon" };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: "Guten Abend", icon: Sunset, period: "evening" };
  } else {
    return { greeting: "Gute Nacht", icon: Moon, period: "night" };
  }
}

export function MotivationalGreeting({ name }: { name: string }) {
  const { greeting, icon: TimeIcon } = getTimeOfDay();
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-start gap-3"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"
      >
        <TimeIcon className="h-5 w-5 text-primary" />
      </motion.div>
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {greeting}, {name}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5"
        >
          <Sparkles className="h-3 w-3 text-primary/60" />
          {quote}
        </motion.p>
      </div>
    </motion.div>
  );
}
