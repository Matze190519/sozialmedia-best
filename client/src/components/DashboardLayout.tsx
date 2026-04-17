import { useAuth } from "@/_core/hooks/useAuth";
import { CommandPalette } from "@/components/CommandPalette";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, LogOut, PanelLeft, Users,
  CheckCircle, Calendar, Zap,
  Eye, BarChart3, Shield, Flame,
  Settings, Package, Library, Rocket,
  FileText, FlaskConical, TrendingUp, BookTemplate,
  HelpCircle, Hash, CalendarDays, Recycle, Sparkles,
  Wand2, Globe, Repeat, Layers, Kanban, Trophy, Activity, UserPlus, DollarSign,
  MoreHorizontal, Video, ShieldCheck, Bot,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { trpc } from "@/lib/trpc";

const menuSections = [
  {
    title: "Erstellen",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/", desc: "Deine Zentrale – alles auf einen Blick" },
      { icon: Wand2, label: "Content Wizard", path: "/wizard", desc: "In 3 Schritten zum fertigen Post" },
      { icon: Zap, label: "Content erstellen", path: "/generator", desc: "Text, Bild & Video auf Knopfdruck" },
      { icon: CheckCircle, label: "Freigabe", path: "/approval", desc: "Posts prüfen, freigeben & posten", badge: "pending" as const },
      { icon: Kanban, label: "Pipeline", path: "/kanban", desc: "Deine Posts im Überblick (Kanban)" },
      { icon: Library, label: "Bibliothek", path: "/library", desc: "Fertige Posts kopieren & direkt nutzen" },
    ],
  },
  {
    title: "KI-Power",
    items: [
      { icon: Sparkles, label: "Lifestyle-Engine", path: "/lifestyle", desc: "Traumauto, Freiheit & Erfolg als Content" },
      { icon: Bot, label: "Lina Avatar", path: "/lina-avatar", desc: "Lina erklärt dein Produkt als Video" },
      { icon: Repeat, label: "Remix 1→7", path: "/remix7", desc: "1 Idee → 7 fertige Formate (inkl. ASMR)" },
      { icon: Repeat, label: "Content Remix", path: "/remix", desc: "1 Thema → 5 verschiedene Formate" },
      { icon: Layers, label: "Karussell", path: "/carousel", desc: "Mehrteilige Slide-Posts erstellen" },
    ],
  },
  {
    title: "Optimieren",
    items: [
      { icon: Flame, label: "Viral Predictor", path: "/viral-predictor", desc: "KI bewertet deinen Post vor dem Posten" },
      { icon: Shield, label: "Compliance Shield", path: "/compliance", desc: "Prüft ob dein Post rechtlich sicher ist" },
      { icon: ShieldCheck, label: "Duplicate Check", path: "/duplicate-check", desc: "Verhindert dass alle denselben Text posten" },
      { icon: Hash, label: "Hashtag-Engine", path: "/hashtags", desc: "Die besten Hashtags für mehr Reichweite" },
    ],
  },
  {
    title: "Recherche",
    items: [
      { icon: Flame, label: "Trend-Scanner", path: "/trends", desc: "Was ist gerade viral? Jetzt nutzen!" },
      { icon: Eye, label: "Creator Spy", path: "/creator-spy", desc: "Was machen erfolgreiche Creator?" },
      { icon: Rocket, label: "Instagram Growth", path: "/instagram-growth", desc: "AutoDM & neue Leads gewinnen" },
    ],
  },
  {
    title: "Planen",
    items: [
      { icon: Calendar, label: "Kalender", path: "/calendar", desc: "Wann wird was gepostet?" },
      { icon: CalendarDays, label: "Monatsplan", path: "/monthly-plan", desc: "30 Posts für den ganzen Monat" },
      { icon: TrendingUp, label: "Posting-Zeiten", path: "/posting-times", desc: "Wann ist dein Publikum online?" },
      { icon: Recycle, label: "Evergreen", path: "/evergreen", desc: "Deine besten Posts nochmal posten" },
    ],
  },
  {
    title: "Auswerten",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/analytics", desc: "Wie laufen deine Posts?" },
      { icon: Activity, label: "Analytics+", path: "/analytics-plus", desc: "Tiefe Analyse: Heatmap & Trends" },
      { icon: Trophy, label: "Leaderboard", path: "/leaderboard", desc: "Wer im Team postet am meisten?" },
      { icon: FlaskConical, label: "A/B Tests", path: "/ab-test", desc: "Welche Version performt besser?" },
      { icon: TrendingUp, label: "Feedback", path: "/feedback", desc: "Was hat am besten funktioniert?" },
    ],
  },
  {
    title: "Ressourcen",
    items: [
      { icon: Package, label: "Produktbilder", path: "/products", desc: "Offizielle LR Produktfotos" },
      { icon: BookTemplate, label: "Vorlagen", path: "/templates", desc: "Bewährte Texte & Hooks zum Anpassen" },
      { icon: FileText, label: "Content Queue", path: "/queue", desc: "Alle Posts in der Warteschlange" },
    ],
  },
  {
    title: "Einstellungen",
    items: [
      { icon: Globe, label: "Blotato Command", path: "/blotato", desc: "Auf 9 Kanäle gleichzeitig posten" },
      { icon: Settings, label: "Einstellungen", path: "/settings", desc: "Blotato verbinden & Branding" },
      { icon: HelpCircle, label: "Quick-Start", path: "/onboarding", desc: "Neu hier? Hier starten!" },
    ],
  },
  {
    title: "Admin",
    adminOnly: true,
    items: [
      { icon: Activity, label: "Team-Aktivitäten", path: "/team-activity", desc: "Was macht das Team gerade?" },
      { icon: UserPlus, label: "Einladungen", path: "/invite-tokens", desc: "Neue Partner ins Team einladen" },
      { icon: Users, label: "Team", path: "/team", desc: "Alle Partner verwalten" },
      { icon: Shield, label: "Nutzer-Übersicht", path: "/admin-users", desc: "Admin: Zugänge & Rollen" },
      { icon: DollarSign, label: "Kosten-Übersicht", path: "/budget", desc: "Was kostet das Tool pro Monat?" },
    ],
  },
];

const menuItems = menuSections.flatMap(s => s.items);

// Bottom tab bar items for mobile — 4 main tabs + More
const bottomTabs = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Zap, label: "Erstellen", path: "/generator" },
  { icon: CheckCircle, label: "Freigabe", path: "/approval", badge: true },
  { icon: Library, label: "Bibliothek", path: "/library" },
  { icon: MoreHorizontal, label: "Mehr", path: "__more__" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background bg-grid">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              <Rocket className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight gold-shimmer" style={{ fontFamily: 'var(--font-heading)' }}>LR Content Hub</h1>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Die Content-Maschine für das LR Lifestyle Team. Erstelle viralen Content, lass ihn freigeben und poste automatisch auf allen Plattformen.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full btn-gold text-base h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Anmelden
          </Button>
        </div>
      </div>
    );
  }

  // Gate: Non-approved users see a waiting page
  if (user.role !== 'admin' && !user.isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background bg-grid">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight gradient-text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Zugang ausstehend</h1>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Hallo <span className="font-semibold text-foreground">{user.name || 'Partner'}</span>! Dein Account wurde erstellt, aber noch nicht freigeschaltet. Dein Teamleiter wird dich in Kürze freischalten.
            </p>
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 w-full">
              <p className="text-xs text-primary/80 text-center">
                Sobald du freigeschaltet bist, hast du Zugriff auf alle Tools: Content erstellen, Trend-Scanner, KI-Coach, Bibliothek und vieles mehr.
              </p>
            </div>
          </div>
          <Button
            onClick={() => { window.location.reload(); }}
            variant="outline"
            size="lg"
            className="w-full border-primary/30 hover:bg-primary/10"
          >
            Seite neu laden
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <CommandPalette />
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  // Get pending count for badge
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const pendingCount = stats?.pending ?? 0;

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  // Mobile: Bottom Tab Bar
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-background/95 px-4 backdrop-blur border-b border-border">
          <div className="flex items-center gap-2.5">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight text-sm gradient-text-gold" style={{ fontFamily: 'var(--font-heading)' }}>LR Content Hub</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center focus:outline-none">
                <Avatar className="h-8 w-8 border border-primary/30">
                  <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-muted-foreground text-xs cursor-default">
                {user?.name || "-"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <main className="pt-14 pb-20 px-3 min-h-screen">{children}</main>

        {/* Bottom Tab Bar */}
        <div className="bottom-tab-bar">
          <div className="flex items-stretch">
            {bottomTabs.map((tab) => {
              const isMore = tab.path === "__more__";
              const isActive = isMore ? false : location === tab.path;
              return (
                <button
                  key={tab.path}
                  className={`bottom-tab-item relative ${isActive ? "active" : ""}`}
                  onClick={() => {
                    if (isMore) {
                      toggleSidebar();
                    } else {
                      setLocation(tab.path);
                    }
                  }}
                >
                  <div className="tab-indicator" />
                  <tab.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                  {tab.badge && pendingCount > 0 && (
                    <span className="absolute top-1 right-1/4 h-4 min-w-4 flex items-center justify-center rounded-full bg-destructive text-[9px] text-white font-bold px-1">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slide-out sidebar for "Mehr" on mobile */}
        <SidebarMobileDrawer />
      </>
    );
  }

  // Desktop: Standard Sidebar Layout
  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={() => setLocation("/")}>
                  <Rocket className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-bold tracking-tight truncate text-sm gradient-text-gold" style={{ fontFamily: 'var(--font-heading)' }}>LR Content Hub</span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            {menuSections.filter(s => !('adminOnly' in s && s.adminOnly) || user?.role === 'admin').map((section) => (
              <div key={section.title} className="mb-1">
                {!isCollapsed && (
                  <div className="px-4 pt-4 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/50" style={{ fontFamily: 'var(--font-heading)' }}>{section.title}</span>
                  </div>
                )}
                <SidebarMenu className="px-2">
                  {section.items.map(item => {
                    const isActive = location === item.path;
                    const showBadge = 'badge' in item && item.badge === 'pending' && pendingCount > 0;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => { setLocation(item.path); }}
                          tooltip={item.label}
                          className={`h-10 md:h-9 transition-all font-normal ${isActive ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                          <span className="flex items-center gap-2">
                            {item.label}
                            {showBadge && (
                              <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 min-w-[1.25rem] flex items-center justify-center">
                                {pendingCount}
                              </Badge>
                            )}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-primary/30 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate leading-none">{user?.name || "-"}</p>
                      {user?.role === "admin" && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">Admin</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">{user?.email || "-"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (isCollapsed) return; setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        <main className="flex-1 p-3 md:p-6 max-w-full overflow-x-hidden">{children}</main>
      </SidebarInset>
    </>
  );
}

function SidebarMobileDrawer() {
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const isOpen = state === "expanded";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={toggleSidebar}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-72 bg-background border-l border-border overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="font-bold text-sm gradient-text-gold" style={{ fontFamily: 'var(--font-heading)' }}>Alle Tools</span>
          <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground p-1">
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="py-2">
          {menuSections.filter(s => !('adminOnly' in s && s.adminOnly) || user?.role === 'admin').map((section) => (
            <div key={section.title} className="mb-2">
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/50" style={{ fontFamily: 'var(--font-heading)' }}>{section.title}</span>
              </div>
              {section.items.map(item => {
                const isActive = location === item.path;
                return (
                  <button
                    key={item.path}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent/50"}`}
                    onClick={() => { setLocation(item.path); toggleSidebar(); }}
                  >
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground block">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
