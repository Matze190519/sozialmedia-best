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
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library, Copy, Image, Video, FileText, Plus,
  Search, Download, Eye, Sparkles, Tag, Send,
  Flame, Star, Clock, Filter, Grid3X3, List,
  Trash2, ExternalLink, CheckCircle, Loader2,
} from "lucide-react";
import PlatformPreview from "@/components/PlatformPreview";

const CATEGORIES = [
  { value: "all", label: "Alle", icon: Library },
  { value: "text", label: "Texte", icon: FileText },
  { value: "image", label: "Bilder", icon: Image },
  { value: "video", label: "Videos", icon: Video },
  { value: "template", label: "Vorlagen", icon: Sparkles },
  { value: "reel_script", label: "Reel Scripts", icon: Flame },
];

const PILLARS = ["Autokonzept", "Business Opportunity", "Produkt-Highlight", "Lina KI-Demo", "Lifestyle & Erfolg", "Einwandbehandlung"];

const SORT_OPTIONS = [
  { value: "newest", label: "Neueste zuerst" },
  { value: "popular", label: "Meistgenutzt" },
  { value: "az", label: "A-Z" },
];

export default function LibraryPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<string | undefined>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [copiedId, setCopiedId] = useState<number | null>(null);

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
    limit: 100,
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
    onSuccess: () => {},
  });

  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => { toast.success("Gelöscht"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const handleCopy = async (item: any) => {
    const textToCopy = item.item?.textContent || item.textContent || "";
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      const id = item.item?.id || item.id;
      copyMutation.mutate({ id });
      setCopiedId(id);
      toast.success("Text kopiert! Jetzt einfach einfuegen.");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyAll = async (item: any) => {
    const raw = item.item || item;
    const parts: string[] = [];
    if (raw.textContent) parts.push(raw.textContent);
    if (raw.tags && (raw.tags as string[]).length > 0) {
      parts.push("\n" + (raw.tags as string[]).map((t: string) => `#${t}`).join(" "));
    }
    const fullText = parts.join("\n");
    if (fullText) {
      await navigator.clipboard.writeText(fullText);
      const id = raw.id;
      copyMutation.mutate({ id });
      setCopiedId(id);
      toast.success("Text + Hashtags kopiert!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadImage = async (url: string, title: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${title || "content"}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Bild heruntergeladen!");
    } catch {
      window.open(url, "_blank");
    }
  };

  const filteredItems = useMemo(() => {
    let result = (items || []).filter((entry: any) => {
      const item = entry.item || entry;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.textContent?.toLowerCase().includes(q) ||
        (item.tags as string[])?.some((t: string) => t.toLowerCase().includes(q))
      );
    });

    // Sort
    if (sortBy === "popular") {
      result = [...result].sort((a: any, b: any) => ((b.item || b).copyCount || 0) - ((a.item || a).copyCount || 0));
    } else if (sortBy === "az") {
      result = [...result].sort((a: any, b: any) => ((a.item || a).title || "").localeCompare((b.item || b).title || ""));
    }

    return result;
  }, [items, searchQuery, sortBy]);

  const totalCount = filteredItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" />
            Content-Bibliothek
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalCount} Inhalte bereit zum Kopieren und Posten. Dein Killer Copy-Paste Hub.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Hinzufügen</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neuen Content zur Bibliothek hinzufügen</DialogTitle>
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suche nach Texten, Tags, Themen..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={selectedPillar || "all"} onValueChange={v => setSelectedPillar(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Alle Pillars" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Pillars</SelectItem>
            {PILLARS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="gap-1.5 text-xs">
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
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
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Library className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Noch keine Inhalte</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Erstelle Content im Generator und teile ihn mit deinem Team, oder füge manuell Inhalte hinzu.
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Ersten Content hinzufügen
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredItems.map((entry: any, idx: number) => {
                  const item = entry.item || entry;
                  const isCopied = copiedId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <Card className="group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                        <CardContent className="p-4 flex flex-col flex-1">
                          {/* Media Preview */}
                          {item.imageUrl && (
                            <div className="rounded-lg overflow-hidden mb-3 bg-muted aspect-video relative">
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                                  onClick={() => setPreviewItem(item)}
                                >
                                  <Eye className="h-3 w-3" /> Vorschau
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                {item.category === "image" ? <Image className="h-3.5 w-3.5 text-primary" /> :
                                 item.category === "video" ? <Video className="h-3.5 w-3.5 text-primary" /> :
                                 item.category === "reel_script" ? <Flame className="h-3.5 w-3.5 text-primary" /> :
                                 <FileText className="h-3.5 w-3.5 text-primary" />}
                              </div>
                              <h3 className="font-medium text-sm truncate">{item.title}</h3>
                            </div>
                            {item.copyCount > 0 && (
                              <Badge variant="secondary" className="text-[9px] px-1 py-0 shrink-0">
                                <Star className="h-2 w-2 mr-0.5" />{item.copyCount}x
                              </Badge>
                            )}
                          </div>

                          {/* Pillar */}
                          {item.pillar && (
                            <Badge variant="outline" className="text-[9px] mb-2 w-fit">{item.pillar}</Badge>
                          )}

                          {/* Text Preview */}
                          {item.textContent && (
                            <p className="text-xs text-muted-foreground line-clamp-4 mb-3 whitespace-pre-line flex-1">
                              {item.textContent}
                            </p>
                          )}

                          {/* Tags */}
                          {item.tags && (item.tags as string[]).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(item.tags as string[]).slice(0, 5).map((tag: string) => (
                                <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                                  <Tag className="h-2 w-2" />{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Personalization Hint */}
                          {item.personalizationHints && (
                            <div className="bg-primary/5 border border-primary/10 rounded-md p-2 mb-3">
                              <p className="text-[9px] text-primary/80">
                                <Sparkles className="h-2.5 w-2.5 inline mr-1" />
                                {item.personalizationHints}
                              </p>
                            </div>
                          )}

                          {/* 1-Tap Actions */}
                          <div className="flex flex-col gap-1.5 pt-3 border-t border-border/30 mt-auto">
                            <Button
                              variant={isCopied ? "default" : "outline"}
                              size="sm"
                              className={`w-full h-9 text-xs gap-1.5 font-semibold ${isCopied ? 'btn-gold' : 'border-primary/30 hover:bg-primary/10 hover:border-primary/50'}`}
                              onClick={() => handleCopyAll(entry)}
                            >
                              {isCopied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {isCopied ? "Kopiert!" : "Text + Hashtags kopieren"}
                            </Button>
                            <div className="flex items-center gap-1.5">
                              {item.imageUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 h-8 text-[10px] gap-1 border-primary/20 hover:bg-primary/10"
                                  onClick={() => handleDownloadImage(item.imageUrl, item.title)}
                                >
                                  <Download className="h-3 w-3" /> Bild speichern
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-[10px]"
                                onClick={() => setPreviewItem(item)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-[10px] text-destructive/70 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  if (confirm("Wirklich löschen?")) deleteMutation.mutate({ id: item.id });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              <AnimatePresence>
                {filteredItems.map((entry: any, idx: number) => {
                  const item = entry.item || entry;
                  const isCopied = copiedId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <Card className="group hover:border-primary/30 transition-all">
                        <CardContent className="p-3 flex items-center gap-3">
                          {/* Icon */}
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            {item.category === "image" ? <Image className="h-4 w-4 text-primary" /> :
                             item.category === "video" ? <Video className="h-4 w-4 text-primary" /> :
                             <FileText className="h-4 w-4 text-primary" />}
                          </div>

                          {/* Thumbnail */}
                          {item.imageUrl && (
                            <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm truncate">{item.title}</h3>
                              {item.pillar && <Badge variant="outline" className="text-[8px] px-1 py-0">{item.pillar}</Badge>}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {item.textContent?.slice(0, 120)}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="text-center shrink-0">
                            <p className="text-sm font-bold">{item.copyCount || 0}</p>
                            <p className="text-[8px] text-muted-foreground">Kopien</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant={isCopied ? "default" : "outline"}
                              size="sm"
                              className="h-7 px-2 text-[10px] gap-1"
                              onClick={() => handleCopy(entry)}
                            >
                              {isCopied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {isCopied ? "Kopiert!" : "Kopieren"}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setPreviewItem(item)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog - Premium */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {previewItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewItem.title}
                  {previewItem.pillar && <Badge variant="outline" className="text-xs">{previewItem.pillar}</Badge>}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                {/* Media */}
                {previewItem.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-border/30">
                    <img src={previewItem.imageUrl} alt={previewItem.title} className="w-full" />
                  </div>
                )}
                {previewItem.videoUrl && (
                  <video src={previewItem.videoUrl} controls className="w-full rounded-xl" />
                )}

                {/* Text Content */}
                {previewItem.textContent && (
                  <div className="bg-accent/30 rounded-xl p-4 border border-border/20">
                    <p className="text-sm whitespace-pre-line leading-relaxed">{previewItem.textContent}</p>
                  </div>
                )}

                {/* Personalization Hints */}
                {previewItem.personalizationHints && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Personalisierungs-Tipp
                    </p>
                    <p className="text-sm text-muted-foreground">{previewItem.personalizationHints}</p>
                  </div>
                )}

                {/* Tags */}
                {previewItem.tags && (previewItem.tags as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(previewItem.tags as string[]).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs gap-1">
                        <Tag className="h-2.5 w-2.5" />{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Platform Preview */}
                {previewItem.textContent && (
                  <PlatformPreview
                    content={previewItem.textContent}
                    imageUrl={previewItem.imageUrl || undefined}
                    platforms={["instagram", "tiktok", "linkedin"]}
                    userName="LR Partner"
                  />
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 gap-2" onClick={() => { handleCopy({ item: previewItem }); }}>
                    <Copy className="h-4 w-4" /> Text kopieren
                  </Button>
                  {previewItem.imageUrl && (
                    <Button variant="outline" className="gap-2" asChild>
                      <a href={previewItem.imageUrl} download target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" /> Bild laden
                      </a>
                    </Button>
                  )}
                  <Button variant="destructive" size="icon" onClick={() => {
                    if (confirm("Wirklich löschen?")) {
                      deleteMutation.mutate({ id: previewItem.id });
                      setPreviewItem(null);
                    }
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
