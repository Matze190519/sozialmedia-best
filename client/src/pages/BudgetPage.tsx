import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Image, Video, Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatCentsEuro(cents: number): string {
  // Rough USD to EUR conversion
  const eur = (cents / 100) * 0.92;
  return `~€${eur.toFixed(2)}`;
}

export default function BudgetPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: budgetStatus, isLoading: loadingBudget } = trpc.budget.status.useQuery();
  const { data: myUsage, isLoading: loadingUsage } = trpc.budget.myUsage.useQuery();
  const { data: allPartnerUsage, isLoading: loadingPartners } = trpc.budget.allPartnerUsage.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  if (loadingBudget || loadingUsage) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Kosten-Übersicht</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const percentUsed = budgetStatus?.percentUsed ?? 0;
  const isWarning = percentUsed >= 75;
  const isDanger = percentUsed >= 90;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kosten-Übersicht</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monat: {budgetStatus?.monthKey || "—"} — Globales Budget und Partner-Verbrauch
          </p>
        </div>
        <Badge variant={isDanger ? "destructive" : isWarning ? "secondary" : "default"} className="text-sm px-3 py-1">
          {isDanger ? "Kritisch" : isWarning ? "Achtung" : "OK"}
        </Badge>
      </div>

      {/* Global Budget Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ausgegeben</p>
                <p className="text-xl font-bold">{formatCents(budgetStatus?.totalSpentCents ?? 0)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{formatCentsEuro(budgetStatus?.totalSpentCents ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Budget-Limit</p>
                <p className="text-xl font-bold">{formatCents(budgetStatus?.limitCents ?? 20000)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Verbleibend: {formatCents(budgetStatus?.remainingCents ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Image className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bilder gesamt</p>
                <p className="text-xl font-bold">{budgetStatus?.totalImages ?? 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">je $0.08 (Nano Banana 2)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Video className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Videos gesamt</p>
                <p className="text-xl font-bold">{budgetStatus?.totalVideos ?? 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">je $0.84 (Kling 3.0 Pro)</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Bar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget-Verbrauch</span>
            <span className={`text-sm font-bold ${isDanger ? "text-red-500" : isWarning ? "text-amber-500" : "text-emerald-500"}`}>
              {percentUsed}%
            </span>
          </div>
          <Progress value={percentUsed} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatCents(budgetStatus?.totalSpentCents ?? 0)} ausgegeben</span>
            <span>{formatCents(budgetStatus?.limitCents ?? 20000)} Limit</span>
          </div>
        </CardContent>
      </Card>

      {/* My Usage (visible for everyone) */}
      {myUsage && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Dein Verbrauch diesen Monat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Image className="h-4 w-4 text-purple-500" /> Bilder
                  </span>
                  <span className="text-sm font-medium">{myUsage.images} / {myUsage.imageLimit}</span>
                </div>
                <Progress value={(myUsage.images / myUsage.imageLimit) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-amber-500" /> Videos
                  </span>
                  <span className="text-sm font-medium">{myUsage.videos} / {myUsage.videoLimit}</span>
                </div>
                <Progress value={(myUsage.videos / myUsage.videoLimit) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin: All Partner Usage */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Partner-Verbrauch (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPartners ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded" />)}
              </div>
            ) : !allPartnerUsage?.partners?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Generierungen diesen Monat.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Partner</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Bilder</th>
                      <th className="text-center py-2 px-2 font-medium text-muted-foreground">Videos</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Kosten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPartnerUsage.partners.map((p) => (
                      <tr key={p.userId} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.userName || `User #${p.userId}`}</span>
                            {p.partnerNumber && (
                              <Badge variant="outline" className="text-[10px] px-1.5">{p.partnerNumber}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <span className="inline-flex items-center gap-1">
                            <Image className="h-3 w-3 text-purple-500" />
                            {p.images}
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <span className="inline-flex items-center gap-1">
                            <Video className="h-3 w-3 text-amber-500" />
                            {p.videos}
                          </span>
                        </td>
                        <td className="text-right py-2.5 px-2 font-medium">
                          {formatCents(p.totalCostCents)}
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="border-t-2 border-border font-bold">
                      <td className="py-2.5 px-2">Gesamt</td>
                      <td className="text-center py-2.5 px-2">{allPartnerUsage.totals.images}</td>
                      <td className="text-center py-2.5 px-2">{allPartnerUsage.totals.videos}</td>
                      <td className="text-right py-2.5 px-2">{formatCents(allPartnerUsage.totals.totalCostCents)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cost Info Card */}
      <Card className="border-dashed">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Kosten-Info (Testphase)</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Bilder: $0.08 pro Bild (Nano Banana 2 / Google Gemini)</p>
                <p>Videos Partner: $0.84 pro 5s Video (Kling 3.0 Pro mit Audio)</p>
                <p>Videos Admin: $2.00 pro 5s Video (Veo 3.1 Top-Qualität)</p>
                <p>Partner-Limit: 40 Bilder + 10 Videos pro Monat</p>
                <p>Admin: Unbegrenzt (Veo 3.1)</p>
                <p>Globaler Monatsdeckel: $200</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
