import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import {
  Library, Copy, Image, Video, FileText, Plus,
  Search, Download, Eye, Sparkles, Tag,
} from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Alle", icon: Library },
  { value: "text", label: "Texte", icon: FileText },
  { value: "image", label: "Bilder", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "template", label: "Vorlagen", icon: Sparkles },
];

const PILLARS = ["Autokonzept", "Business Opportunity", "Produkt-Highlight", "Lina KI-Demo", "Lifestyle & Erfolg", "Einwandbehandlung"];

export default function LibraryPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string | undefined>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("text");
  const [newPillar, setNewPillar] = useState("");
  const [newText, setNewText] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newHints, setNewHints] = useState("");

  const { data: items, isLoading, refetch } = trpc.library.list.useQuery({
    category: activeCategory === "all" ? undefined : activeCategory,
    pillar: selectedPillar,
    limit: 50,
  });

  const addMutation = trpc.library.add.useMutation({
    onSuccess: () => {
      toast.success("Zur Bibliothek hinzugefügt");
      refetch();
      setShowAddDialog(false);
      setNewTitle(""); setNewCategory("text"); setNewPillar(""); setNewText(""); setNewTags(""); setNewHints("");
    },
    onError: (err) => toast.error(err.message),
  });

  const copyMutation = trpc.library.copy.useMutation({
    onSuccess: () => toast.success("Kopiert! Du kannst den Text jetzt einfügen."),
  });

  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => { toast.success("Gelöscht"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const handleCopy = async (item: any) => {
    const textToCopy = item.item?.textContent || item.textContent || "";
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      copyMutation.mutate({ id: item.item?.id || item.id });
    }
  };

  const filteredItems = (items || []).filter((entry: any) => {
    const item = entry.item || entry;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.textContent?.toLowerCase().includes(q) ||
      (item.tags as string[])?.some((t: string) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content-Bibliothek</h1>
          <p className="text-muted-foreground mt-1">
            Texte, Bilder und Videos f&uuml;r dein Team. Einfach kopieren und auf deinen Kan&auml;len posten.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Hinzuf&uuml;gen</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neuen Content zur Bibliothek hinzuf&uuml;gen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Titel (z.B. 'Autokonzept Reel Hook')" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Bild</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="template">Vorlage</SelectItem>
                    <SelectItem value="reel_script">Reel Script</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newPillar} onValueChange={setNewPillar}>
                  <SelectTrigger><SelectValue placeholder="Pillar" /></SelectTrigger>
                  <SelectContent>
                    {PILLARS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Text-Inhalt (der Text den dein Team kopieren kann)" value={newText} onChange={e => setNewText(e.target.value)} rows={5} />
              <Input placeholder="Tags (kommagetrennt, z.B. hook, reel, instagram)" value={newTags} onChange={e => setNewTags(e.target.value)} />
              <Textarea placeholder="Personalisierungs-Tipps (z.B. 'Ersetze den Namen durch deinen eigenen')" value={newHints} onChange={e => setNewHints(e.target.value)} rows={2} />
              <Button
                className="w-full"
                disabled={!newTitle || !newText || addMutation.isPending}
                onClick={() => addMutation.mutate({
                  title: newTitle,
                  category: newCategory as any,
                  pillar: newPillar || undefined,
                  textContent: newText,
                  tags: newTags ? newTags.split(",").map(t => t.trim()) : undefined,
                  personalizationHints: newHints || undefined,
                })}
              >
                {addMutation.isPending ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suche nach Texten, Tags..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={selectedPillar || "all"} onValueChange={v => setSelectedPillar(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Alle Pillars" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Pillars</SelectItem>
            {PILLARS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
              <cat.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Library className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Noch keine Inhalte</h3>
                <p className="text-muted-foreground mt-1">
                  Erstelle Content im Generator und teile ihn mit deinem Team, oder f&uuml;ge manuell Inhalte hinzu.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((entry: any) => {
                const item = entry.item || entry;
                const categoryIcon = item.category === "image" ? Image : item.category === "video" ? Video : FileText;
                const CategoryIcon = categoryIcon;
                return (
                  <Card key={item.id} className="group hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <CategoryIcon className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        </div>
                        {item.pillar && (
                          <Badge variant="outline" className="text-[10px] shrink-0">{item.pillar}</Badge>
                        )}
                      </div>

                      {/* Preview */}
                      {item.imageUrl && (
                        <div className="rounded-lg overflow-hidden mb-3 bg-muted aspect-video">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {item.textContent && (
                        <p className="text-sm text-muted-foreground line-clamp-4 mb-3 whitespace-pre-line">
                          {item.textContent}
                        </p>
                      )}

                      {/* Tags */}
                      {item.tags && (item.tags as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(item.tags as string[]).slice(0, 4).map((tag: string) => (
                            <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              <Tag className="h-2.5 w-2.5" />{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats + Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-[11px] text-muted-foreground">
                          {item.copyCount || 0}x kopiert
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setPreviewItem(item)}>
                            <Eye className="h-3 w-3 mr-1" /> Ansehen
                          </Button>
                          <Button variant="default" size="sm" className="h-7 px-2 text-xs" onClick={() => handleCopy(entry)}>
                            <Copy className="h-3 w-3 mr-1" /> Kopieren
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {previewItem && (
            <>
              <DialogHeader>
                <DialogTitle>{previewItem.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex gap-2">
                  {previewItem.pillar && <Badge variant="outline">{previewItem.pillar}</Badge>}
                  <Badge variant="secondary">{previewItem.category}</Badge>
                </div>

                {previewItem.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img src={previewItem.imageUrl} alt={previewItem.title} className="w-full" />
                  </div>
                )}

                {previewItem.videoUrl && (
                  <video src={previewItem.videoUrl} controls className="w-full rounded-lg" />
                )}

                {previewItem.textContent && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-line">{previewItem.textContent}</p>
                  </div>
                )}

                {previewItem.personalizationHints && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-xs font-medium text-primary mb-1">Personalisierungs-Tipp:</p>
                    <p className="text-sm text-muted-foreground">{previewItem.personalizationHints}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => { handleCopy({ item: previewItem }); }}>
                    <Copy className="h-4 w-4 mr-2" /> Text kopieren
                  </Button>
                  {previewItem.imageUrl && (
                    <Button variant="outline" asChild>
                      <a href={previewItem.imageUrl} download target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Bild laden
                      </a>
                    </Button>
                  )}
                  {user?.role === "admin" && (
                    <Button variant="destructive" size="icon" onClick={() => {
                      deleteMutation.mutate({ id: previewItem.id });
                      setPreviewItem(null);
                    }}>
                      &times;
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
