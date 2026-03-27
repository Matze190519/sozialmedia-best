import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hash, Copy, Search, TrendingUp, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HashtagPage() {

  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [pillar, setPillar] = useState("");
  const [topic, setTopic] = useState("");
  const [researchTopic, setResearchTopic] = useState("");
  const [researchPillar, setResearchPillar] = useState("");

  const generateMutation = trpc.hashtags.generate.useMutation();
  const researchMutation = trpc.hashtags.research.useMutation();
  const platformsQuery = trpc.hashtags.platforms.useQuery();
  const poolsQuery = trpc.hashtags.pools.useQuery();

  const handleGenerate = () => {
    if (!content.trim()) {
      toast.error("Bitte Content eingeben");
      return;
    }
    generateMutation.mutate({ content, platform, pillar: pillar || undefined, topic: topic || undefined });
  };

  const handleResearch = () => {
    if (!researchTopic.trim()) {
      toast.error("Bitte Thema eingeben");
      return;
    }
    researchMutation.mutate({ topic: researchTopic, pillar: researchPillar || undefined });
  };

  const copyHashtags = (tags: string[]) => {
    navigator.clipboard.writeText(tags.join(" "));
    toast.success(`${tags.length} Hashtags kopiert!`);
  };

  const pillars = [
    { key: "autokonzept", label: "Autokonzept" },
    { key: "business", label: "Business" },
    { key: "gesundheit", label: "Gesundheit" },
    { key: "lifestyle", label: "Lifestyle" },
    { key: "lina_ki", label: "Lina & KI" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Hash className="h-7 w-7 text-primary" />
          Smart Hashtag Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          KI-generierte, trendbasierte Hashtags pro Plattform. Maximale Reichweite, minimaler Aufwand.
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate"><Sparkles className="h-4 w-4 mr-1" /> Generator</TabsTrigger>
          <TabsTrigger value="research"><Search className="h-4 w-4 mr-1" /> Recherche</TabsTrigger>
          <TabsTrigger value="pools"><TrendingUp className="h-4 w-4 mr-1" /> Hashtag-Pools</TabsTrigger>
        </TabsList>

        {/* Generator Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hashtags generieren</CardTitle>
              <CardDescription>Füge deinen Content ein und erhalte die perfekten Hashtags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Füge hier deinen Post-Text ein..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Plattform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="threads">Threads</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={pillar} onValueChange={setPillar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pillar (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Pillar</SelectItem>
                    {pillars.map(p => (
                      <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Thema (optional)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="w-full">
                {generateMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generiere Hashtags...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Hashtags generieren</>
                )}
              </Button>
            </CardContent>
          </Card>

          {generateMutation.data && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {generateMutation.data.hashtags.length} Hashtags generiert
                    </CardTitle>
                    <CardDescription>
                      Plattform: {generateMutation.data.platform} | Geschätzte Reichweite: {generateMutation.data.totalReach}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyHashtags(generateMutation.data!.hashtags)}>
                    <Copy className="h-4 w-4 mr-1" /> Alle kopieren
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {generateMutation.data.hashtags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm py-1 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                        toast.success(`${tag} kopiert!`);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(generateMutation.data.categories).map(([cat, tags]) => (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground capitalize">{cat}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => copyHashtags(tags)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {generateMutation.data.tips && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <span className="font-medium">Tipp:</span> {generateMutation.data.tips}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Hashtag-Recherche</CardTitle>
              <CardDescription>Finde die besten Hashtags für dein Thema mit Schwierigkeitsgrad und Post-Anzahl</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Thema eingeben (z.B. 'Aloe Vera Gesundheit')"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                />
                <Select value={researchPillar} onValueChange={setResearchPillar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pillar (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Pillar</SelectItem>
                    {pillars.map(p => (
                      <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleResearch} disabled={researchMutation.isPending} className="w-full">
                {researchMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recherchiere...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" /> Hashtags recherchieren</>
                )}
              </Button>
            </CardContent>
          </Card>

          {researchMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle>{researchMutation.data.hashtags.length} Hashtags gefunden</CardTitle>
                <CardDescription>{researchMutation.data.recommendations}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["easy", "medium", "hard"].map(diff => {
                    const filtered = researchMutation.data!.hashtags.filter(h => h.difficulty === diff);
                    if (filtered.length === 0) return null;
                    return (
                      <div key={diff}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={diff === "easy" ? "default" : diff === "medium" ? "secondary" : "destructive"}>
                            {diff === "easy" ? "Leicht" : diff === "medium" ? "Mittel" : "Schwer"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{filtered.length} Hashtags</span>
                          <Button variant="ghost" size="sm" className="h-6 ml-auto" onClick={() => copyHashtags(filtered.map(h => h.hashtag))}>
                            <Copy className="h-3 w-3 mr-1" /> Kopieren
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {filtered.map((h, i) => (
                            <div key={i} className="flex items-center justify-between bg-muted/30 rounded px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/60"
                              onClick={() => { navigator.clipboard.writeText(h.hashtag); toast.success(`${h.hashtag} kopiert!`); }}>
                              <span className="font-medium">{h.hashtag}</span>
                              <span className="text-xs text-muted-foreground">{h.postCount} Posts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pools Tab */}
        <TabsContent value="pools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poolsQuery.data?.map(pool => (
              <Card key={pool.category}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{pool.category}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => copyHashtags(pool.hashtags)}>
                      <Copy className="h-3 w-3 mr-1" /> Alle
                    </Button>
                  </div>
                  <CardDescription>{pool.count} Hashtags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {pool.hashtags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                        onClick={() => { navigator.clipboard.writeText(tag); toast.success(`${tag} kopiert!`); }}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {platformsQuery.data && (
            <Card>
              <CardHeader>
                <CardTitle>Plattform-Regeln</CardTitle>
                <CardDescription>Optimale Hashtag-Anzahl und Stil pro Plattform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {platformsQuery.data.map(p => (
                    <div key={p.platform} className="bg-muted/30 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{p.platform}</span>
                        <Badge variant="secondary">{p.maxHashtags} max</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.style}</p>
                      <p className="text-xs text-muted-foreground italic">{p.placement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
