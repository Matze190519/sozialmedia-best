import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Plus, Trash2, Copy, Check, Eye,
  Palette, Music, Camera, Shield, MessageCircle,
  BookOpen, Film, Sparkles, AlertTriangle, Save, Edit3
} from "lucide-react";
import { toast } from "sonner";

/**
 * CHARACTER BIBLE — Konsistente Figuren, Welten und Prompts
 *
 * Speichert Figuren mit visuellem Prompt, Voice, Phrases, World Rules.
 * localStorage-basiert (Manus kann später auf DB umstellen).
 */

interface CharacterBibleEntry {
  id: string;
  name: string;
  role: string;
  visualPrompt: string;
  negativePrompt?: string;
  tone: string;
  catchPhrases: string[];
  backstory: string;
  worldRules: string[];
  colorPalette: string[];
  musicStyle?: string;
  cameraStyle?: string;
  createdAt: string;
  version: number;
}

const STORAGE_KEY = "character-bible-entries";

const DEFAULT_CHARACTERS: Omit<CharacterBibleEntry, "id" | "createdAt" | "version">[] = [
  {
    name: "Nova Lenz",
    role: "Protagonistin · LR Parallelwelt",
    visualPrompt: "cinematic female protagonist, age 28-34, sharp cheekbones, athletic but elegant, platinum-dark-blonde hair with subtle silver strands, confident eyes, futuristic matte black jacket with gold luminous seams, minimal premium LR-inspired accessories, high detail skin texture, realistic fashion editorial lighting, clean sci-fi background",
    negativePrompt: "cartoon, anime, extra fingers, text, watermark, low detail, blurry, distorted face",
    tone: "ruhig, präzise, leicht ironisch — spricht wie jemand, der mehr weiß als alle im Raum",
    catchPhrases: ["Das ist nicht normal.", "Schau genau hin.", "Hier kippt die Realität.", "Das ist Ebene zwei."],
    backstory: "Nova war früher komplett im Funktionsmodus gefangen, bis sie verstanden hat, dass Routinen, Umfeld und Systeme wichtiger sind als Motivation. Jetzt navigiert sie die Parallelwelt, in der jede LR-Entscheidung wie ein Upgrade wirkt.",
    worldRules: ["Jede Routine hat Konsequenzen", "LR-Produkte sind Upgrades, keine Heilmittel", "Nie direkte Einkommensclaims", "Cliffhanger am Ende jeder Folge"],
    colorPalette: ["#0B1020", "#1F2A44", "#D4AF37", "#F4E8B2", "#7EE7F2"],
    musicStyle: "cinematic synthwave, tension pulses, rise-and-drop",
    cameraStyle: "schnelle Push-ins, Crash-Zoom auf Hook-Wörter, Whip-Pans, POV-Cuts",
  },
];

function loadEntries(): CharacterBibleEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // Seed with default Nova on first load
  return DEFAULT_CHARACTERS.map((c, i) => ({
    ...c,
    id: `default-${i}`,
    createdAt: new Date().toISOString(),
    version: 1,
  }));
}

function saveEntries(entries: CharacterBibleEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function emptyEntry(): CharacterBibleEntry {
  return {
    id: `char-${Date.now()}`,
    name: "",
    role: "",
    visualPrompt: "",
    negativePrompt: "",
    tone: "",
    catchPhrases: [],
    backstory: "",
    worldRules: [],
    colorPalette: ["#D4AF37"],
    musicStyle: "",
    cameraStyle: "",
    createdAt: new Date().toISOString(),
    version: 1,
  };
}

function scoreConsistency(entry: CharacterBibleEntry): number {
  let score = 0;
  if (entry.name.length > 2) score += 10;
  if (entry.role.length > 5) score += 10;
  if (entry.visualPrompt.length > 50) score += 25;
  if (entry.negativePrompt && entry.negativePrompt.length > 10) score += 10;
  if (entry.tone.length > 20) score += 10;
  if (entry.catchPhrases.length >= 3) score += 10;
  if (entry.backstory.length > 50) score += 10;
  if (entry.worldRules.length >= 2) score += 10;
  if (entry.colorPalette.length >= 3) score += 5;
  return Math.min(100, score);
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1 text-xs"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label || "Prompt"} kopiert`);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {label || "Copy"}
    </Button>
  );
}

function ColorSwatch({ color, onChange, onDelete }: { color: string; onChange?: (v: string) => void; onDelete?: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className="h-6 w-6 rounded border border-border/50"
        style={{ backgroundColor: color }}
      />
      {onChange ? (
        <Input
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-20 text-[10px] font-mono"
        />
      ) : (
        <span className="text-[10px] font-mono">{color}</span>
      )}
      {onDelete && (
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={onDelete}>
          <Trash2 className="h-3 w-3 text-red-400" />
        </Button>
      )}
    </div>
  );
}

function CharacterCard({ entry, onSelect, isSelected }: { entry: CharacterBibleEntry; onSelect: () => void; isSelected: boolean }) {
  const score = scoreConsistency(entry);
  const scoreColor = score >= 70 ? "text-emerald-400 border-emerald-500/30" : score >= 40 ? "text-amber-400 border-amber-500/30" : "text-red-400 border-red-500/30";

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-primary font-bold shrink-0"
            style={{ backgroundColor: entry.colorPalette[0] + "30" }}
          >
            {entry.name.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{entry.name || "Unbenannt"}</h3>
            <p className="text-[10px] text-muted-foreground truncate">{entry.role}</p>
          </div>
        </div>

        {entry.tone && (
          <p className="text-[10px] text-muted-foreground line-clamp-2">{entry.tone}</p>
        )}

        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant="outline" className={`text-[9px] ${scoreColor}`}>
            <Check className="h-2.5 w-2.5 mr-0.5" /> {score}/100
          </Badge>
          {entry.catchPhrases.length > 0 && (
            <Badge variant="outline" className="text-[9px]">
              {entry.catchPhrases.length} Phrases
            </Badge>
          )}
          {entry.worldRules.length > 0 && (
            <Badge variant="outline" className="text-[9px]">
              {entry.worldRules.length} Regeln
            </Badge>
          )}
        </div>

        {entry.colorPalette.length > 0 && (
          <div className="flex items-center gap-1">
            {entry.colorPalette.slice(0, 5).map((c, i) => (
              <div key={i} className="h-3 w-3 rounded-full border border-border/50" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CharacterBiblePage() {
  const [entries, setEntries] = useState<CharacterBibleEntry[]>(() => loadEntries());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const selected = entries.find(e => e.id === selectedId);

  const addCharacter = () => {
    const entry = emptyEntry();
    setEntries(prev => [entry, ...prev]);
    setSelectedId(entry.id);
    setEditMode(true);
  };

  const updateSelected = (patch: Partial<CharacterBibleEntry>) => {
    if (!selectedId) return;
    setEntries(prev => prev.map(e =>
      e.id === selectedId ? { ...e, ...patch, version: e.version + 1 } : e
    ));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    if (!confirm("Charakter wirklich löschen?")) return;
    setEntries(prev => prev.filter(e => e.id !== selectedId));
    setSelectedId(null);
    setEditMode(false);
  };

  const addPhrase = () => {
    if (!selected) return;
    updateSelected({ catchPhrases: [...selected.catchPhrases, ""] });
  };

  const updatePhrase = (i: number, val: string) => {
    if (!selected) return;
    const phrases = [...selected.catchPhrases];
    phrases[i] = val;
    updateSelected({ catchPhrases: phrases });
  };

  const removePhrase = (i: number) => {
    if (!selected) return;
    updateSelected({ catchPhrases: selected.catchPhrases.filter((_, idx) => idx !== i) });
  };

  const addRule = () => {
    if (!selected) return;
    updateSelected({ worldRules: [...selected.worldRules, ""] });
  };

  const updateRule = (i: number, val: string) => {
    if (!selected) return;
    const rules = [...selected.worldRules];
    rules[i] = val;
    updateSelected({ worldRules: rules });
  };

  const removeRule = (i: number) => {
    if (!selected) return;
    updateSelected({ worldRules: selected.worldRules.filter((_, idx) => idx !== i) });
  };

  const addColor = () => {
    if (!selected) return;
    updateSelected({ colorPalette: [...selected.colorPalette, "#000000"] });
  };

  const updateColor = (i: number, val: string) => {
    if (!selected) return;
    const palette = [...selected.colorPalette];
    palette[i] = val;
    updateSelected({ colorPalette: palette });
  };

  const removeColor = (i: number) => {
    if (!selected) return;
    updateSelected({ colorPalette: selected.colorPalette.filter((_, idx) => idx !== i) });
  };

  const exportPromptPack = () => {
    if (!selected) return;
    const pack = [
      `# CHARACTER BIBLE: ${selected.name}`,
      `**Rolle:** ${selected.role}`,
      "",
      `## Visual Prompt`,
      selected.visualPrompt,
      "",
      `## Negative Prompt`,
      selected.negativePrompt || "(leer)",
      "",
      `## Tone / Voice`,
      selected.tone,
      "",
      `## Catchphrases`,
      ...selected.catchPhrases.map(p => `- "${p}"`),
      "",
      `## Backstory`,
      selected.backstory,
      "",
      `## World Rules`,
      ...selected.worldRules.map(r => `- ${r}`),
      "",
      `## Farbpalette`,
      ...selected.colorPalette.map(c => `- ${c}`),
      "",
      `## Musik-Stil`,
      selected.musicStyle || "(leer)",
      "",
      `## Kamera-Stil`,
      selected.cameraStyle || "(leer)",
    ].join("\n");
    navigator.clipboard.writeText(pack);
    toast.success("Prompt-Pack kopiert");
  };

  const useInSeries = () => {
    if (!selected) return;
    localStorage.setItem("series-builder-character", JSON.stringify(selected));
    toast.info(`${selected.name} für Series Builder hinterlegt`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gold-text" style={{ fontFamily: "var(--font-heading)" }}>
          Character Bible
        </h1>
        <p className="text-sm text-muted-foreground">
          Figuren, Welten, Stimmen und Prompts dauerhaft stabil halten. Franchises brauchen Wiedererkennung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Character List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Charaktere ({entries.length})</h2>
            <Button size="sm" onClick={addCharacter}>
              <Plus className="h-3 w-3 mr-1" /> Neu
            </Button>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {entries.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CharacterCard
                    entry={entry}
                    isSelected={selectedId === entry.id}
                    onSelect={() => { setSelectedId(entry.id); setEditMode(false); }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {entries.length === 0 && (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-6 text-center">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Noch kein Charakter</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Detail Editor */}
        <div className="lg:col-span-2">
          {!selected ? (
            <Card className="border-dashed border-border/50 h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Wähle einen Charakter oder erstelle einen neuen</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/30">
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 space-y-2 min-w-[200px]">
                    <Input
                      value={selected.name}
                      onChange={(e) => updateSelected({ name: e.target.value })}
                      placeholder="Charakter-Name"
                      className="text-lg font-bold"
                      readOnly={!editMode}
                    />
                    <Input
                      value={selected.role}
                      onChange={(e) => updateSelected({ role: e.target.value })}
                      placeholder="Rolle (z.B. Protagonistin · Serie X)"
                      className="text-sm"
                      readOnly={!editMode}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant={editMode ? "default" : "outline"} onClick={() => setEditMode(!editMode)}>
                      {editMode ? <><Save className="h-3 w-3 mr-1" /> Fertig</> : <><Edit3 className="h-3 w-3 mr-1" /> Bearbeiten</>}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={deleteSelected}>
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Consistency Score */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Konsistenz-Score</span>
                      <span className="font-semibold">{scoreConsistency(selected)}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${scoreConsistency(selected)}%` }}
                      />
                    </div>
                  </div>
                  {scoreConsistency(selected) < 70 && (
                    <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30 shrink-0">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Fülle weitere Felder aus
                    </Badge>
                  )}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="visual">
                  <TabsList className="w-full grid grid-cols-4 md:grid-cols-7 h-auto">
                    <TabsTrigger value="visual" className="text-[10px]">Look</TabsTrigger>
                    <TabsTrigger value="voice" className="text-[10px]">Voice</TabsTrigger>
                    <TabsTrigger value="phrases" className="text-[10px]">Phrases</TabsTrigger>
                    <TabsTrigger value="story" className="text-[10px]">Story</TabsTrigger>
                    <TabsTrigger value="world" className="text-[10px]">World</TabsTrigger>
                    <TabsTrigger value="colors" className="text-[10px]">Farben</TabsTrigger>
                    <TabsTrigger value="style" className="text-[10px]">Stil</TabsTrigger>
                  </TabsList>

                  <TabsContent value="visual" className="mt-3 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Visual Prompt (für Bild-KI)</label>
                      <Textarea
                        value={selected.visualPrompt}
                        onChange={(e) => updateSelected({ visualPrompt: e.target.value })}
                        rows={4}
                        readOnly={!editMode}
                        placeholder="cinematic female protagonist, age 28-34, sharp cheekbones..."
                      />
                      <CopyButton text={selected.visualPrompt} label="Visual Prompt" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Negative Prompt</label>
                      <Textarea
                        value={selected.negativePrompt || ""}
                        onChange={(e) => updateSelected({ negativePrompt: e.target.value })}
                        rows={2}
                        readOnly={!editMode}
                        placeholder="cartoon, anime, extra fingers, text, watermark"
                      />
                      <CopyButton text={selected.negativePrompt || ""} label="Negative Prompt" />
                    </div>
                  </TabsContent>

                  <TabsContent value="voice" className="mt-3 space-y-2">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Tone / Sprechstil</label>
                    <Textarea
                      value={selected.tone}
                      onChange={(e) => updateSelected({ tone: e.target.value })}
                      rows={4}
                      readOnly={!editMode}
                      placeholder="ruhig, präzise, leicht ironisch — spricht wie jemand, der mehr weiß als alle im Raum"
                    />
                  </TabsContent>

                  <TabsContent value="phrases" className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-semibold text-muted-foreground">Catchphrases</label>
                      {editMode && (
                        <Button size="sm" variant="outline" onClick={addPhrase}>
                          <Plus className="h-3 w-3 mr-1" /> Hinzufügen
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selected.catchPhrases.map((p, i) => (
                        <div key={i} className="flex gap-1">
                          <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-2" />
                          <Input
                            value={p}
                            onChange={(e) => updatePhrase(i, e.target.value)}
                            placeholder="Typische Redewendung"
                            readOnly={!editMode}
                            className="text-sm"
                          />
                          {editMode && (
                            <Button size="sm" variant="ghost" onClick={() => removePhrase(i)}>
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="story" className="mt-3">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 block">Backstory</label>
                    <Textarea
                      value={selected.backstory}
                      onChange={(e) => updateSelected({ backstory: e.target.value })}
                      rows={6}
                      readOnly={!editMode}
                      placeholder="Wer ist diese Figur? Warum handelt sie so?"
                    />
                  </TabsContent>

                  <TabsContent value="world" className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-semibold text-muted-foreground">World Rules</label>
                      {editMode && (
                        <Button size="sm" variant="outline" onClick={addRule}>
                          <Plus className="h-3 w-3 mr-1" /> Regel
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selected.worldRules.map((r, i) => (
                        <div key={i} className="flex gap-1">
                          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-2" />
                          <Input
                            value={r}
                            onChange={(e) => updateRule(i, e.target.value)}
                            placeholder="z.B. Nie direkte Einkommensclaims"
                            readOnly={!editMode}
                            className="text-sm"
                          />
                          {editMode && (
                            <Button size="sm" variant="ghost" onClick={() => removeRule(i)}>
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-semibold text-muted-foreground">Farbpalette</label>
                      {editMode && (
                        <Button size="sm" variant="outline" onClick={addColor}>
                          <Plus className="h-3 w-3 mr-1" /> Farbe
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selected.colorPalette.map((c, i) => (
                        <ColorSwatch
                          key={i}
                          color={c}
                          onChange={editMode ? (v) => updateColor(i, v) : undefined}
                          onDelete={editMode ? () => removeColor(i) : undefined}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="mt-3 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                        <Music className="h-3 w-3" /> Musik-Stil
                      </label>
                      <Input
                        value={selected.musicStyle || ""}
                        onChange={(e) => updateSelected({ musicStyle: e.target.value })}
                        placeholder="cinematic synthwave, tension pulses"
                        readOnly={!editMode}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                        <Camera className="h-3 w-3" /> Kamera-Stil
                      </label>
                      <Input
                        value={selected.cameraStyle || ""}
                        onChange={(e) => updateSelected({ cameraStyle: e.target.value })}
                        placeholder="schnelle Push-ins, Crash-Zoom"
                        readOnly={!editMode}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-border/50">
                  <Button size="sm" variant="outline" onClick={exportPromptPack}>
                    <Copy className="h-3 w-3 mr-1" /> Prompt-Pack
                  </Button>
                  <Button size="sm" className="btn-gold" onClick={useInSeries}>
                    <Film className="h-3 w-3 mr-1" /> In Serie verwenden
                  </Button>
                  <Button size="sm" variant="outline" disabled>
                    <Eye className="h-3 w-3 mr-1" /> Shot-Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4 text-xs">
          <p className="font-semibold text-amber-400 mb-1">🔧 Optional an Manus:</p>
          <p className="text-muted-foreground">
            Aktuell localStorage-basiert (pro Browser). Für Multi-User + DB-Persistenz: neue tRPC-Routes <code>characterBible.generate</code>, <code>characterBible.scoreConsistency</code>, <code>characterBible.exportPromptPack</code> + DB-Tabelle <code>characters</code>. Spec in docs/VIRAL_STRATEGY.md.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
