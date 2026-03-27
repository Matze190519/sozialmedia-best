import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Settings, Key, Clock, Palette, Send,
  CheckCircle, AlertCircle, ExternalLink, Shield,
} from "lucide-react";

const PLATFORMS_FOR_TIMES = ["instagram", "facebook", "tiktok", "linkedin", "twitter", "threads", "youtube"];

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: settings, isLoading, refetch } = trpc.userSettings.get.useQuery();

  // Blotato Key
  const [blotatoKey, setBlotatoKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Auto-Post
  const [autoPost, setAutoPost] = useState(false);

  // Posting Times
  const [postingTimes, setPostingTimes] = useState<Record<string, string>>({});

  // Personal Branding
  const [signature, setSignature] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [ownIntro, setOwnIntro] = useState("");
  const [customCTA, setCustomCTA] = useState("");

  useEffect(() => {
    if (settings) {
      setAutoPost(settings.autoPostEnabled ?? false);
      if (settings.preferredPostingTimes) {
        setPostingTimes(settings.preferredPostingTimes as Record<string, string>);
      }
      if (settings.personalBranding) {
        const b = settings.personalBranding as any;
        setSignature(b.signature || "");
        setHashtags((b.hashtags || []).join(", "));
        setOwnIntro(b.ownIntro || "");
        setCustomCTA(b.customCTA || "");
      }
    }
  }, [settings]);

  const saveBlotatoKey = trpc.userSettings.saveBlotatoKey.useMutation({
    onSuccess: () => { toast.success("Blotato API Key gespeichert"); refetch(); setBlotatoKey(""); },
    onError: (err) => toast.error(err.message),
  });

  const removeBlotatoKey = trpc.userSettings.removeBlotatoKey.useMutation({
    onSuccess: () => { toast.success("Blotato API Key entfernt"); refetch(); },
  });

  const toggleAutoPost = trpc.userSettings.toggleAutoPost.useMutation({
    onSuccess: () => { toast.success(autoPost ? "Auto-Post deaktiviert" : "Auto-Post aktiviert"); refetch(); },
  });

  const savePostingTimesMut = trpc.userSettings.savePostingTimes.useMutation({
    onSuccess: () => toast.success("Posting-Zeiten gespeichert"),
  });

  const saveBranding = trpc.userSettings.savePersonalBranding.useMutation({
    onSuccess: () => toast.success("Pers\u00f6nliches Branding gespeichert"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1></div>
        {[1,2,3].map(i => (
          <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-32 bg-muted rounded" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground mt-1">Dein pers&ouml;nliches Setup f&uuml;r automatisches Posten und Branding.</p>
      </div>

      {/* Blotato API Key */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Blotato API Key</CardTitle>
              <CardDescription>Dein pers&ouml;nlicher Key f&uuml;r automatisches Posten auf deinen Social-Media-Kan&auml;len.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {settings?.hasBlotatoKey ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="h-3 w-3 mr-1" /> Key hinterlegt
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500 border-amber-500/20">
                <AlertCircle className="h-3 w-3 mr-1" /> Kein Key hinterlegt
              </Badge>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p className="font-medium">So bekommst du deinen Blotato API Key:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Gehe zu <a href="https://blotato.com" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">blotato.com <ExternalLink className="h-3 w-3" /></a></li>
              <li>Erstelle ein Konto (ab 25&euro;/Monat)</li>
              <li>Verbinde deine Social-Media-Accounts</li>
              <li>Gehe zu Einstellungen &rarr; API und kopiere deinen Key</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="Blotato API Key einf&uuml;gen..."
              value={blotatoKey}
              onChange={e => setBlotatoKey(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)} className="shrink-0">
              {showKey ? "Verbergen" : "Anzeigen"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={!blotatoKey || saveBlotatoKey.isPending}
              onClick={() => saveBlotatoKey.mutate({ blotatoApiKey: blotatoKey })}
            >
              <Key className="h-4 w-4 mr-2" /> Key speichern
            </Button>
            {settings?.hasBlotatoKey && (
              <Button variant="outline" className="text-destructive" onClick={() => removeBlotatoKey.mutate()}>
                Key entfernen
              </Button>
            )}
          </div>

          {!settings?.hasBlotatoKey && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-400">
                <strong>Kein Blotato?</strong> Kein Problem! Du kannst trotzdem alle Texte, Bilder und Videos aus der Bibliothek kopieren und manuell auf deinen Kan&auml;len posten.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Post */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Auto-Post nach Freigabe</CardTitle>
              <CardDescription>Wenn aktiviert, wird genehmigter Content automatisch &uuml;ber Blotato gepostet.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-Post {autoPost ? "aktiv" : "inaktiv"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {autoPost ? "Content wird nach Admin-Freigabe automatisch gepostet" : "Du musst Content manuell ver\u00f6ffentlichen"}
              </p>
            </div>
            <Switch
              checked={autoPost}
              onCheckedChange={(checked) => {
                setAutoPost(checked);
                toggleAutoPost.mutate({ enabled: checked });
              }}
              disabled={!settings?.hasBlotatoKey}
            />
          </div>
          {!settings?.hasBlotatoKey && (
            <p className="text-xs text-muted-foreground mt-3">Hinterlege zuerst deinen Blotato API Key um Auto-Post zu aktivieren.</p>
          )}
        </CardContent>
      </Card>

      {/* Posting Times */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Bevorzugte Posting-Zeiten</CardTitle>
              <CardDescription>Wann sollen deine Posts ver&ouml;ffentlicht werden? (Uhrzeit pro Plattform)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLATFORMS_FOR_TIMES.map(platform => (
              <div key={platform} className="flex items-center gap-3">
                <Label className="w-24 text-sm capitalize">{platform}</Label>
                <Input
                  type="time"
                  value={postingTimes[platform] || ""}
                  onChange={e => setPostingTimes(prev => ({ ...prev, [platform]: e.target.value }))}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={() => savePostingTimesMut.mutate({ times: postingTimes })}
            disabled={savePostingTimesMut.isPending}
            className="mt-2"
          >
            <Clock className="h-4 w-4 mr-2" /> Zeiten speichern
          </Button>
        </CardContent>
      </Card>

      {/* Personal Branding */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Pers&ouml;nliches Branding</CardTitle>
              <CardDescription>Mach den Content zu deinem eigenen. Diese Infos werden beim Generieren verwendet.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Deine Signatur / Abschluss</Label>
            <Input placeholder="z.B. 'Dein Mathias vom LR Lifestyle Team'" value={signature} onChange={e => setSignature(e.target.value)} />
            <p className="text-xs text-muted-foreground">Wird am Ende jedes Posts angeh&auml;ngt.</p>
          </div>
          <div className="space-y-2">
            <Label>Deine Hashtags</Label>
            <Input placeholder="z.B. #LRLifestyle, #NetworkMarketing, #DeinName" value={hashtags} onChange={e => setHashtags(e.target.value)} />
            <p className="text-xs text-muted-foreground">Kommagetrennt. Werden automatisch zu deinen Posts hinzugef&uuml;gt.</p>
          </div>
          <div className="space-y-2">
            <Label>Deine Vorstellung</Label>
            <Textarea placeholder="z.B. 'Ich bin seit 2 Jahren bei LR und habe mir ein passives Einkommen von 3.000&euro; aufgebaut...'" value={ownIntro} onChange={e => setOwnIntro(e.target.value)} rows={3} />
            <p className="text-xs text-muted-foreground">Wird in generierten Content eingebaut, damit es nach dir klingt.</p>
          </div>
          <div className="space-y-2">
            <Label>Dein CTA (Call-to-Action)</Label>
            <Input placeholder="z.B. 'Schreib mir eine DM f&uuml;r mehr Infos'" value={customCTA} onChange={e => setCustomCTA(e.target.value)} />
            <p className="text-xs text-muted-foreground">Ersetzt den Standard-CTA in deinen Posts.</p>
          </div>
          <Button
            onClick={() => saveBranding.mutate({
              signature: signature || undefined,
              hashtags: hashtags ? hashtags.split(",").map(h => h.trim()) : undefined,
              ownIntro: ownIntro || undefined,
              customCTA: customCTA || undefined,
            })}
            disabled={saveBranding.isPending}
          >
            <Palette className="h-4 w-4 mr-2" /> Branding speichern
          </Button>
        </CardContent>
      </Card>

      {/* Info for Admin */}
      {user?.role === "admin" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Admin-Info</p>
              <p className="text-muted-foreground mt-1">
                Als Admin kannst du Content f&uuml;r das ganze Team freigeben. Die fal.ai Kosten f&uuml;r Bild- und Video-KI &uuml;bernimmst du zentral. Jedes Team-Mitglied braucht nur seinen eigenen Blotato Key (25&euro;/Monat) f&uuml;r automatisches Posten. Wer kein Blotato hat, kann alles aus der Bibliothek kopieren und manuell posten.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
