import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { FlaskConical, Plus, Trophy, ArrowRight, Swords } from "lucide-react";

const PLATFORMS = ["instagram", "facebook", "tiktok", "linkedin", "twitter", "threads"];
const PILLARS = ["Autokonzept", "Business Opportunity", "Produkt-Highlight", "Lina KI-Demo", "Lifestyle & Erfolg"];

export default function ABTestPage() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [pillar, setPillar] = useState("");
  const [topic, setTopic] = useState("");
  const [variantA, setVariantA] = useState("");
  const [variantB, setVariantB] = useState("");

  const { data: tests, isLoading, refetch } = trpc.abTest.list.useQuery({});

  const createMutation = trpc.abTest.create.useMutation({
    onSuccess: () => {
      toast.success("A/B Test erstellt! Beide Varianten sind jetzt in der Queue.");
      refetch();
      setShowCreate(false);
      setName(""); setVariantA(""); setVariantB(""); setTopic("");
    },
    onError: (err) => toast.error(err.message),
  });

  const completeMutation = trpc.abTest.complete.useMutation({
    onSuccess: () => { toast.success("Test abgeschlossen!"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">A/B Tests</h1>
          <p className="text-muted-foreground mt-1">
            Teste zwei Varianten gegeneinander. Finde heraus was bei deiner Zielgruppe besser ankommt.
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Neuer Test</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neuen A/B Test erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Testname</Label>
                <Input placeholder="z.B. 'Hook-Vergleich Autokonzept'" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Plattform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pillar</Label>
                  <Select value={pillar} onValueChange={setPillar}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="W&auml;hlen..." /></SelectTrigger>
                    <SelectContent>
                      {PILLARS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Thema</Label>
                  <Input placeholder="z.B. 'Firmenwagen'" value={topic} onChange={e => setTopic(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">A</div>
                    <Label>Variante A</Label>
                  </div>
                  <Textarea placeholder="Ersten Post-Text hier einf&uuml;gen..." value={variantA} onChange={e => setVariantA(e.target.value)} rows={8} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-orange-500/20 flex items-center justify-center text-xs font-bold text-orange-400">B</div>
                    <Label>Variante B</Label>
                  </div>
                  <Textarea placeholder="Zweiten Post-Text hier einf&uuml;gen..." value={variantB} onChange={e => setVariantB(e.target.value)} rows={8} />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <strong>So funktioniert es:</strong> Beide Varianten landen als separate Posts in der Content Queue. Nach der Freigabe werden sie gepostet. Vergleiche danach die Performance in Analytics und w&auml;hle den Gewinner.
              </div>

              <Button
                className="w-full"
                disabled={!name || !variantA || !variantB || createMutation.isPending}
                onClick={() => createMutation.mutate({
                  name, platform,
                  variantAContent: variantA,
                  variantBContent: variantB,
                  topic: topic || undefined,
                  pillar: pillar || undefined,
                })}
              >
                {createMutation.isPending ? "Wird erstellt..." : "Test starten"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      ) : !tests || tests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Noch keine A/B Tests</h3>
            <p className="text-muted-foreground mt-1">
              Erstelle deinen ersten Test um herauszufinden welcher Content besser performt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test: any) => {
            const t = test.group || test;
            const isActive = t.status === "active";
            const isComplete = t.status === "completed";
            return (
              <Card key={t.id} className={isComplete ? "border-primary/20" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {isComplete ? <Trophy className="h-5 w-5 text-primary" /> : <Swords className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{t.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Erstellt am {new Date(t.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isActive ? "default" : isComplete ? "secondary" : "outline"}>
                      {isActive ? "Aktiv" : isComplete ? "Abgeschlossen" : t.status}
                    </Badge>
                  </div>

                  {/* Variants comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={`rounded-lg p-3 border ${t.winner === "A" ? "border-green-500/40 bg-green-500/5" : "border-border/50 bg-muted/30"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">A</div>
                        <span className="text-xs font-medium">Variante A</span>
                        {t.winner === "A" && <Badge className="bg-green-500/20 text-green-500 border-0 text-[10px]"><Trophy className="h-2.5 w-2.5 mr-0.5" /> Gewinner</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">Post #{t.variantAId}</p>
                    </div>
                    <div className={`rounded-lg p-3 border ${t.winner === "B" ? "border-green-500/40 bg-green-500/5" : "border-border/50 bg-muted/30"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded bg-orange-500/20 flex items-center justify-center text-[10px] font-bold text-orange-400">B</div>
                        <span className="text-xs font-medium">Variante B</span>
                        {t.winner === "B" && <Badge className="bg-green-500/20 text-green-500 border-0 text-[10px]"><Trophy className="h-2.5 w-2.5 mr-0.5" /> Gewinner</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">Post #{t.variantBId}</p>
                    </div>
                  </div>

                  {t.winReason && (
                    <div className="mt-3 bg-primary/5 rounded-lg p-3 text-sm">
                      <span className="font-medium">Ergebnis:</span> {t.winReason}
                    </div>
                  )}

                  {/* Complete test */}
                  {isActive && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-border/50">
                      <Button size="sm" variant="outline" className="text-blue-400" onClick={() => {
                        const reason = prompt("Warum hat Variante A gewonnen?");
                        if (reason) completeMutation.mutate({ id: t.id, winner: "A", reason });
                      }}>
                        A gewinnt
                      </Button>
                      <Button size="sm" variant="outline" className="text-orange-400" onClick={() => {
                        const reason = prompt("Warum hat Variante B gewonnen?");
                        if (reason) completeMutation.mutate({ id: t.id, winner: "B", reason });
                      }}>
                        B gewinnt
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
