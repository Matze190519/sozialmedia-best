import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import { BookOpen, Plus, Trash2, Copy, Loader2, Car, Briefcase, Heart, Sparkles, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  autokonzept: <Car className="h-4 w-4" />,
  business_opportunity: <Briefcase className="h-4 w-4" />,
  produkt_highlight: <Heart className="h-4 w-4" />,
  lina_demo: <Sparkles className="h-4 w-4" />,
  lifestyle: <Smartphone className="h-4 w-4" />,
};

const PILLAR_LABELS: Record<string, string> = {
  autokonzept: "Autokonzept",
  business_opportunity: "Business Opportunity",
  produkt_highlight: "Produkt-Highlight",
  lina_demo: "Lina Demo",
  lifestyle: "Lifestyle",
};

const PILLAR_COLORS: Record<string, string> = {
  autokonzept: "text-blue-400 bg-blue-500/10",
  business_opportunity: "text-emerald-400 bg-emerald-500/10",
  produkt_highlight: "text-pink-400 bg-pink-500/10",
  lina_demo: "text-violet-400 bg-violet-500/10",
  lifestyle: "text-amber-400 bg-amber-500/10",
};

export default function TemplatesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const [filterCat, setFilterCat] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", category: "autokonzept", content: "" });

  const { data: templates, isLoading } = trpc.templates.list.useQuery(
    filterCat ? { category: filterCat } : undefined
  );

  const createMut = trpc.templates.create.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      toast.success("Vorlage erstellt!");
      setCreateOpen(false);
      setNewTemplate({ name: "", category: "autokonzept", content: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMut = trpc.templates.delete.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      toast.success("Vorlage gelöscht");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("In Zwischenablage kopiert!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-violet-400" />
            Content-Vorlagen
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Erfolgreiche Posts als Templates speichern und wiederverwenden
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Neue Vorlage</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neue Vorlage erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                  placeholder="z.B. Autokonzept Hook - Porsche"
                />
              </div>
              <div>
                <Label>Kategorie</Label>
                <Select value={newTemplate.category} onValueChange={(v) => setNewTemplate(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PILLAR_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  rows={8}
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(p => ({ ...p, content: e.target.value }))}
                  placeholder="Template-Text hier einfügen..."
                />
              </div>
              <Button
                className="w-full"
                disabled={!newTemplate.name || !newTemplate.content || createMut.isPending}
                onClick={() => createMut.mutate(newTemplate)}
              >
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Vorlage speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!filterCat ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCat(undefined)}
        >
          Alle
        </Button>
        {Object.entries(PILLAR_LABELS).map(([key, label]) => (
          <Button
            key={key}
            variant={filterCat === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCat(key)}
            className="gap-1.5"
          >
            {PILLAR_ICONS[key]}
            {label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="border-border/50 group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${PILLAR_COLORS[tpl.category] || "bg-accent"}`}>
                      {PILLAR_ICONS[tpl.category] || <BookOpen className="h-4 w-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{tpl.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {PILLAR_LABELS[tpl.category] || tpl.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(tpl.content)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate({ id: tpl.id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">{tpl.content}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">{tpl.usageCount}x verwendet</span>
                  {tpl.platforms && (
                    <div className="flex gap-1">
                      {(tpl.platforms as string[]).map(p => (
                        <Badge key={p} variant="outline" className="text-[9px] px-1">{p}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Vorlagen vorhanden.</p>
            <p className="text-sm text-muted-foreground mt-2">Erstelle deine erste Vorlage oder speichere erfolgreiche Posts als Template.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
