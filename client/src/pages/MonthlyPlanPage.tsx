import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Sparkles, Loader2, ChevronRight, Rocket, CheckCircle, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const PILLAR_COLORS: Record<string, string> = {
  autokonzept: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  business: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  gesundheit: "bg-green-500/10 text-green-500 border-green-500/20",
  lifestyle: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  lina_ki: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

export default function MonthlyPlanPage() {
  const [, navigate] = useLocation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const generateMutation = trpc.monthlyPlan.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`Monatsplan erstellt: ${data.posts.length} Posts für ${MONTHS[month - 1]} ${year}`);
      plansQuery.refetch();
      setSelectedPlanId(data.id);
    },
    onError: (err) => toast.error(err.message),
  });

  const createPostMutation = trpc.monthlyPlan.createPostFromPlan.useMutation({
    onSuccess: (data) => {
      toast.success("Post erstellt und zur Freigabe geschickt!");
      navigate("/approval");
    },
    onError: (err) => toast.error(err.message),
  });

  const plansQuery = trpc.monthlyPlan.list.useQuery();
  const selectedPlan = trpc.monthlyPlan.get.useQuery(
    { id: selectedPlanId! },
    { enabled: !!selectedPlanId }
  );

  const planData = useMemo(() => {
    if (!selectedPlan.data?.planData) return [];
    try {
      return typeof selectedPlan.data.planData === "string"
        ? JSON.parse(selectedPlan.data.planData)
        : selectedPlan.data.planData;
    } catch { return []; }
  }, [selectedPlan.data]);

  const handleGenerate = () => {
    generateMutation.mutate({ month, year });
  };

  // Group posts by week
  const weekGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    planData.forEach((post: any, idx: number) => {
      const week = `Woche ${Math.floor(idx / 7) + 1}`;
      if (!groups[week]) groups[week] = [];
      groups[week].push({ ...post, index: idx });
    });
    return groups;
  }, [planData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-7 w-7 text-primary" />
          Monatsplan Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          30 Posts auf Knopfdruck. Der KI-Autopilot plant deinen gesamten Monat basierend auf dem Agent Brain Content-Mix.
        </p>
      </div>

      {/* Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Neuen Monatsplan erstellen</CardTitle>
          <CardDescription>
            Wähle Monat und Jahr. Die KI erstellt automatisch 30 Posts mit dem optimalen Content-Mix:
            Autokonzept 3x/Woche, Business 4x/Woche, Gesundheit 2x/Woche, Lifestyle 3x/Woche, Lina & KI 2x/Woche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2025, 2026, 2027].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="flex-1">
              {generateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generiere 30 Posts...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Monatsplan generieren</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Plans */}
      {plansQuery.data && plansQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gespeicherte Monatspläne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {plansQuery.data.map((plan: any) => (
                <div
                  key={plan.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlanId === plan.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{MONTHS[(plan.month || 1) - 1]} {plan.year}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {plan.totalPosts} Posts
                    <span className="mx-1">|</span>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {plan.postsCreated || 0} erstellt
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Detail */}
      {selectedPlan.data && planData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {MONTHS[(selectedPlan.data.month || 1) - 1]} {selectedPlan.data.year} - {planData.length} Posts
            </h2>
            {selectedPlan.data.summary && (
              <p className="text-sm text-muted-foreground max-w-md">{typeof selectedPlan.data.summary === 'string' ? selectedPlan.data.summary : ''}</p>
            )}
          </div>

          {Object.entries(weekGroups).map(([week, posts]) => (
            <Card key={week}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{week}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(posts as any[]).map((post: any) => (
                    <div key={post.index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className={PILLAR_COLORS[post.pillar] || ""}>{post.pillar}</Badge>
                        <span className="font-medium truncate">{post.topic || post.hook || "Post"}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">{post.platform || "instagram"}</Badge>
                        <Badge variant="outline" className="text-xs shrink-0">{post.contentType || "post"}</Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Tag {post.day || post.index + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={createPostMutation.isPending}
                          onClick={() => createPostMutation.mutate({
                            planId: selectedPlanId!,
                            dayIndex: post.index,
                            topic: post.topic || post.hook || "Monatsplan Post",
                            hook: post.hook || "",
                            platform: post.platform || "instagram",
                            pillar: post.pillar || "lifestyle",
                            contentType: post.contentType || "post",
                            hashtags: post.hashtags || [],
                            imagePrompt: post.imagePrompt || "",
                          })}
                        >
                          <Rocket className="h-3 w-3 mr-1" /> Erstellen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPlan.isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
