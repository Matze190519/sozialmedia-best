import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recycle, Star, Clock, Loader2, Plus, Trash2, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EvergreenPage() {
  const [recycleDays, setRecycleDays] = useState(30);
  const [maxRecycles, setMaxRecycles] = useState(3);

  const evergreenQuery = trpc.evergreen.list.useQuery();
  const dueQuery = trpc.evergreen.due.useQuery();
  const candidatesQuery = trpc.evergreen.candidates.useQuery();

  const addMutation = trpc.evergreen.add.useMutation({
    onSuccess: () => {
      toast.success("Post zum Evergreen-Pool hinzugefügt!");
      evergreenQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const recycleMutation = trpc.evergreen.recycle.useMutation({
    onSuccess: (data) => {
      toast.success(`Post recycled! (Recycling #${data.recycleCount})`);
      evergreenQuery.refetch();
      dueQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMutation = trpc.evergreen.remove.useMutation({
    onSuccess: () => {
      toast.success("Aus Evergreen-Pool entfernt");
      evergreenQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Recycle className="h-7 w-7 text-primary" />
          Evergreen Recycling
        </h1>
        <p className="text-muted-foreground mt-1">
          Deine Top-Posts automatisch wiederverwenden. Posts mit hohem Feedback-Score werden nach X Wochen recycled und erneut zur Freigabe geschickt.
        </p>
      </div>

      <Tabs defaultValue="due" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="due"><Clock className="h-4 w-4 mr-1" /> Fällig ({dueQuery.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="pool"><Recycle className="h-4 w-4 mr-1" /> Evergreen-Pool ({evergreenQuery.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="candidates"><Star className="h-4 w-4 mr-1" /> Kandidaten</TabsTrigger>
        </TabsList>

        {/* Due for Recycling */}
        <TabsContent value="due" className="space-y-4">
          {dueQuery.data && dueQuery.data.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-500">{dueQuery.data.length} Posts bereit zum Recycling</p>
                  <p className="text-sm text-muted-foreground">Diese Posts haben ihren Recycling-Zeitpunkt erreicht und können erneut gepostet werden.</p>
                </div>
              </div>
              {dueQuery.data.map((eg: any) => (
                <Card key={eg.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-medium truncate">Post #{eg.originalPostId}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">Recycling #{eg.recycleCount + 1} von {eg.maxRecycles}</Badge>
                          <span>Alle {eg.recycleAfterDays} Tage</span>
                        </div>
                        {eg.notes && <p className="text-xs text-muted-foreground">{eg.notes}</p>}
                      </div>
                      <Button
                        onClick={() => recycleMutation.mutate({ evergreenId: eg.id })}
                        disabled={recycleMutation.isPending}
                      >
                        {recycleMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><RefreshCw className="h-4 w-4 mr-1" /> Jetzt recyclen</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Keine Posts fällig zum Recycling</p>
                <p className="text-sm text-muted-foreground mt-1">Posts werden automatisch fällig basierend auf dem eingestellten Intervall.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Evergreen Pool */}
        <TabsContent value="pool" className="space-y-4">
          {evergreenQuery.data && evergreenQuery.data.length > 0 ? (
            <div className="space-y-3">
              {evergreenQuery.data.map((eg: any) => (
                <Card key={eg.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Post #{eg.originalPostId}</p>
                          <Badge variant={eg.isActive ? "default" : "secondary"}>
                            {eg.isActive ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {eg.recycleCount}/{eg.maxRecycles} Recyclings
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Alle {eg.recycleAfterDays} Tage
                          </span>
                          {eg.nextRecycleAt && (
                            <span>Nächstes: {new Date(eg.nextRecycleAt).toLocaleDateString("de-DE")}</span>
                          )}
                        </div>
                        {eg.notes && <p className="text-xs text-muted-foreground">{eg.notes}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMutation.mutate({ id: eg.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Recycle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Noch keine Evergreen-Posts</p>
                <p className="text-sm text-muted-foreground mt-1">Füge Top-Posts aus dem "Kandidaten" Tab hinzu.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Candidates */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evergreen-Einstellungen</CardTitle>
              <CardDescription>Konfiguriere wie oft und wie häufig Posts recycled werden</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Recycling-Intervall (Tage)</label>
                  <Input
                    type="number"
                    value={recycleDays}
                    onChange={(e) => setRecycleDays(Number(e.target.value))}
                    min={7}
                    max={180}
                    className="w-32"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Max. Recyclings</label>
                  <Input
                    type="number"
                    value={maxRecycles}
                    onChange={(e) => setMaxRecycles(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {candidatesQuery.data && candidatesQuery.data.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Posts mit Feedback-Score ab 70 - deine besten Performer, ideal zum Recycling.
              </p>
              {candidatesQuery.data.map((post: any) => {
                const p = post.post || post;
                return (
                  <Card key={p.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{p.topic || "Post"}</p>
                            {p.feedbackScore && (
                              <Badge variant="default" className="bg-green-500">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Score: {p.feedbackScore}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {p.pillar && <Badge variant="outline" className="text-xs">{p.pillar}</Badge>}
                            {p.platforms && <span>{(typeof p.platforms === 'string' ? JSON.parse(p.platforms) : p.platforms).join(", ")}</span>}
                            <span>{new Date(p.publishedAt || p.createdAt).toLocaleDateString("de-DE")}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addMutation.mutate({
                            originalPostId: p.id,
                            recycleAfterDays: recycleDays,
                            maxRecycles: maxRecycles,
                          })}
                          disabled={addMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Hinzufügen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Noch keine Top-Posts gefunden</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Posts mit Feedback-Score ab 70 erscheinen hier automatisch als Evergreen-Kandidaten.
                  Nutze den Feedback-Loop um Posts zu bewerten.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
