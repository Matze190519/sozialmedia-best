import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  LayoutDashboard, Wand2, Zap, CheckCircle, Library,
  Sparkles, Bot, Repeat, Layers, Kanban,
  Flame, Shield, ShieldCheck, Hash,
  Eye, Rocket, Calendar, CalendarDays,
  TrendingUp, Recycle, Package, BookTemplate,
  FileText, FlaskConical, BarChart3, Activity,
  Trophy, Globe, Settings, HelpCircle,
  Users, UserPlus, DollarSign, Play,
} from "lucide-react";

const commands = [
  { icon: Play, label: "Tages-Autopilot starten", path: "/", keywords: "autopilot tag heute starten post" },
  { icon: Rocket, label: "Auto-Content-Loop", path: "/auto-loop", keywords: "auto loop trend post compliance automatisch" },
  { icon: Flame, label: "Viral Vault", path: "/viral-vault", keywords: "viral hooks ctas formeln kopieren kontakte leads" },
  { icon: Target, label: "Lead Capture", path: "/lead-capture", keywords: "lead capture dm whatsapp kontakte trigger" },
  { icon: Wand2, label: "Content Wizard", path: "/wizard", keywords: "wizard erstellen post schreiben" },
  { icon: Zap, label: "Content erstellen", path: "/generator", keywords: "generator schnell post erstellen" },
  { icon: CheckCircle, label: "Freigabe", path: "/approval", keywords: "freigabe genehmigen prüfen approval" },
  { icon: Kanban, label: "Pipeline", path: "/kanban", keywords: "kanban pipeline überblick board" },
  { icon: Library, label: "Bibliothek", path: "/library", keywords: "bibliothek fertig kopieren posts" },
  { icon: Sparkles, label: "Lifestyle-Engine", path: "/lifestyle", keywords: "lifestyle traumauto freiheit emotion" },
  { icon: Bot, label: "Lina Avatar", path: "/lina-avatar", keywords: "lina avatar video produkt erklären" },
  { icon: Repeat, label: "Remix 1→7", path: "/remix7", keywords: "remix sieben formate plattform" },
  { icon: Repeat, label: "Content Remix", path: "/remix", keywords: "remix fünf formate" },
  { icon: Layers, label: "Karussell", path: "/carousel", keywords: "karussell slides instagram linkedin" },
  { icon: Flame, label: "Viral Predictor", path: "/viral-predictor", keywords: "viral score prüfen bewerten" },
  { icon: Shield, label: "Compliance Shield", path: "/compliance", keywords: "compliance recht legal prüfen heilaussage" },
  { icon: ShieldCheck, label: "Duplicate Check", path: "/duplicate-check", keywords: "duplikat prüfen doppelt" },
  { icon: Hash, label: "Hashtag-Engine", path: "/hashtags", keywords: "hashtag tags reichweite" },
  { icon: Flame, label: "Trend-Scanner", path: "/trends", keywords: "trend viral scanner tiktok youtube" },
  { icon: Eye, label: "Creator Spy", path: "/creator-spy", keywords: "creator spy analyse wettbewerb" },
  { icon: Rocket, label: "Instagram Growth", path: "/instagram-growth", keywords: "instagram wachsen follower autodm" },
  { icon: Calendar, label: "Kalender", path: "/calendar", keywords: "kalender planen wann posten" },
  { icon: CalendarDays, label: "Monatsplan", path: "/monthly-plan", keywords: "monatsplan 30 tage monat" },
  { icon: TrendingUp, label: "Posting-Zeiten", path: "/posting-times", keywords: "posting zeiten wann beste" },
  { icon: Recycle, label: "Evergreen", path: "/evergreen", keywords: "evergreen recycling wiederverwenden top" },
  { icon: BarChart3, label: "Analytics", path: "/analytics", keywords: "analytics statistik performance" },
  { icon: Activity, label: "Analytics+", path: "/analytics-plus", keywords: "analytics plus heatmap trend tiefe" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard", keywords: "leaderboard ranking team punkte" },
  { icon: FlaskConical, label: "A/B Tests", path: "/ab-test", keywords: "ab test variante vergleich" },
  { icon: TrendingUp, label: "Feedback", path: "/feedback", keywords: "feedback bewerten sterne" },
  { icon: Package, label: "Produktbilder", path: "/products", keywords: "produkt bilder lr fotos" },
  { icon: BookTemplate, label: "Vorlagen", path: "/templates", keywords: "vorlagen hooks texte" },
  { icon: FileText, label: "Content Queue", path: "/queue", keywords: "queue warteschlange posts" },
  { icon: Globe, label: "Blotato Command", path: "/blotato", keywords: "blotato posten kanäle verbinden" },
  { icon: Settings, label: "Einstellungen", path: "/settings", keywords: "einstellungen branding api key" },
  { icon: HelpCircle, label: "Quick-Start", path: "/onboarding", keywords: "onboarding start hilfe neu" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/", keywords: "dashboard home start zentrale" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Tool suchen"
      description="Tippe den Namen eines Tools um direkt dorthin zu springen"
    >
      <CommandInput placeholder="Tool suchen... (z.B. Wizard, Trends, Hashtags)" />
      <CommandList>
        <CommandEmpty>Kein Tool gefunden.</CommandEmpty>
        <CommandGroup heading="Alle Tools">
          {commands.map(cmd => (
            <CommandItem
              key={cmd.path + cmd.label}
              value={cmd.label + " " + cmd.keywords}
              onSelect={() => {
                setLocation(cmd.path);
                setOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <cmd.icon className="h-4 w-4 text-primary shrink-0" />
              <span>{cmd.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
