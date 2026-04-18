# VIRAL STRATEGY

Stand: 17.04.2026  
Scope: reine Strategie- und Handoff-Dokumentation, kein Code

## 1. Tool-Prioritäten

| Tool | Zweck | Impact-Score | Prio | Bauzeit Frontend | Bauzeit Backend | Kosten/Monat | Abhängigkeiten |
|---|---|---|---|---|---|---|---|
| Trend Radar | Zieht täglich plattformübergreifend Signale aus TikTok, YouTube, Reddit und internen Gewinnern. Es beantwortet nicht nur "was trendet", sondern "welcher Trend passt zu LR und welcher Trend ist schon zu spät". | Follower 9, Engagement 8, Leads 6 | Must | 2-3 Tage | 3-5 Tage | 80-220 EUR | `trends.top`, `trends.latest`, `trends.scan`, `trends.generateIdeas`, optional `creatorSpy.latest` |
| Hook Engine | Macht aus einem Thema, Produkt oder Trend sofort 10-50 hookfähige Einstiege nach Stil, Funnel-Ziel und Plattform. Das Tool wird zum täglichen Startpunkt für jede Clip-Produktion. | Follower 8, Engagement 10, Leads 7 | Must | 2-3 Tage | 2-4 Tage | 40-120 EUR | `brandVoice.getHooks`, `content.generate`, optional `complianceShield.check` |
| Series Builder | Übersetzt eine Einzelidee in eine echte Franchise mit Episodenbogen, Cliffhangern, CTA-Logik und Veröffentlichungsplan. Es verhindert Einmal-Content und erzwingt Wiedererkennung. | Follower 9, Engagement 9, Leads 8 | Must | 3-4 Tage | 3-5 Tage | 50-140 EUR | Trend Radar, Hook Engine, Character Bible |
| Character Bible | Hält Figuren, Look, Voice, Catchphrases, Backstory, Negativ-Prompts und World Rules stabil. Das ist der Hebel für echte Serienfähigkeit statt visuellem Zufall. | Follower 8, Engagement 8, Leads 5 | Must | 2-3 Tage | 2-4 Tage | 30-90 EUR | optional Bild-/Video-Gen-Services, Series Builder |
| Shot Planner | Zerlegt eine Episode in 5-12 Shots mit Kamera, On-Screen-Text, Cut-Tempo und B-Roll-Ideen. Es spart Drehzeit und hält die ersten 3 Sekunden aggressiv stark. | Follower 6, Engagement 8, Leads 5 | Should | 2-3 Tage | 1-2 Tage | 20-60 EUR | Series Builder, Character Bible |
| Variant Factory | Nimmt einen Gewinner und erzeugt systematisch 10-30 neue Varianten nach Hook, CTA, Plattform, Charakter und Sprachraum. Das ist der Multiplikator für 50 Clips pro Woche. | Follower 8, Engagement 8, Leads 8 | Must | 3-4 Tage | 3-5 Tage | 60-180 EUR | Hook Engine, Series Builder, Winner Detector, Localization |
| Comment-to-Lead Router | Übersetzt Kommentare wie "Info", "Preis?", "Wie geht das?" in Funnel-Intentionen, empfohlene Antworten und CRM- oder DM-Aktionen. Das Tool macht aus Reichweite planbare Gespräche. | Follower 3, Engagement 7, Leads 10 | Must | 2-3 Tage | 4-6 Tage | 40-130 EUR | Compliance-Check, Vorlagen/Library, optional Lina/Bot-Bridge nur als spätere Phase |
| Winner Detector | Erkennt bei veröffentlichtem oder geplantem Content, was repliziert, verlängert, lokalisiert oder gestoppt werden soll. Es ersetzt Bauchgefühl durch wiederholbare Signale. | Follower 7, Engagement 8, Leads 7 | Must | 2-3 Tage | 3-4 Tage | 30-110 EUR | Creator Spy, Analytics-Daten, Variant Factory |
| Localization | Übersetzt Gewinner in Sprach-, Dialekt- und Zielgruppenvarianten ohne Verlust von Hook, Timing und CTA. Es ist kein reiner Übersetzer, sondern ein kultureller Adapter. | Follower 5, Engagement 6, Leads 7 | Could | 2 Tage | 2-3 Tage | 30-100 EUR | Variant Factory, Character Bible |

### Priorisierte Bau-Reihenfolge

1. Hook Engine
2. Series Builder
3. Character Bible
4. Trend Radar
5. Winner Detector
6. Variant Factory
7. Comment-to-Lead Router
8. Shot Planner
9. Localization

### Warum diese Reihenfolge

- Hook Engine liefert sofort Output-Geschwindigkeit und verbessert bestehende Workflows ohne Systembruch.
- Series Builder plus Character Bible verwandeln Einzelclips in wiedererkennbare Franchises.
- Trend Radar und Winner Detector sorgen dafür, dass nicht nur produziert, sondern korrekt priorisiert wird.
- Variant Factory und Comment-to-Lead Router monetarisieren die Gewinnerwelle.

## 2. Die 3 Flagship-Serien für LR

### Serie 1: LR Parallelwelt

**Premise**  
Eine scheinbar normale Welt kippt in ein visuell überzeichnetes Sci-Fi-LR-Universum, in dem jede Routine, jedes Gespräch und jede Entscheidung plötzlich Konsequenzen für Energie, Fokus, Community und Freiheit hat. Jede Episode endet mit einer Störung im System, die den Zuschauer in die nächste Folge zieht.

**Charakter-Profil**

- Name: Nova Lenz
- Aussehen: `cinematic female protagonist, age 28-34, sharp cheekbones, athletic but elegant, platinum-dark-blonde hair with subtle silver strands, confident eyes, futuristic matte black jacket with gold luminous seams, minimal premium LR-inspired accessories, high detail skin texture, realistic fashion editorial lighting, clean sci-fi background, consistent face, no cartoon, no extra fingers, no text`
- Stimme/Tonalität: ruhig, präzise, leicht ironisch, nie hektisch; spricht wie jemand, der mehr weiß als alle im Raum
- Typische Redewendungen: "Das ist nicht normal.", "Schau genau hin.", "Hier kippt die Realität.", "Das ist Ebene zwei."
- Hintergrund-Story: Nova war früher komplett im Funktionsmodus gefangen, bis sie verstanden hat, dass Routinen, Umfeld und Systeme wichtiger sind als Motivation. Jetzt navigiert sie die "Parallelwelt", in der jede LR-Entscheidung wie ein Upgrade wirkt.

**Visuelle Welt**

- Setting: futuristische Großstadt, spiegelnde Flure, Neon-Lab, Rooftops, Auto-Interior, digitale Portale
- Farbschema: `#0B1020`, `#1F2A44`, `#D4AF37`, `#F4E8B2`, `#7EE7F2`
- Musik-Stil: cinematic synthwave, tension pulses, rise-and-drop
- Kamera-Stil: schnelle Push-ins, Crash-Zoom auf Hook-Wörter, Whip-Pans, POV-Cuts, Close-ups mit Lichtreflexen

**Episoden-Plan**

1. Titel: Der Fehler im Morgen  
   Hook: "Heute Morgen ist meine Realität zweimal abgestürzt."  
   Story-Arc: Nova zeigt zwei Morgenroutinen parallel, eine chaotisch, eine fokussiert. Die Unterschiede werden wie Systemfehler visualisiert.  
   Cliffhanger: Auf ihrem Spiegel erscheint "Ebene 2 freigeschaltet".  
   CTA / Lead-Mechanik: "Kommentiere `MORGEN`, wenn du meine Routine-Vorlage willst."  
   Geschätzte Länge: 28-35 Sek.  
   LR-Produkt-Integration: Aloe-Vera-/Morning-Routine als Ritual, nicht als Heilversprechen.

2. Titel: Das goldene Signal  
   Hook: "Dieses eine Signal trennt Mitläufer von Machern."  
   Story-Arc: Nova erklärt, woran sie Menschen erkennt, die nur scrollen, und jene, die handeln. Visualisiert durch ein leuchtendes Signal im Feed.  
   Cliffhanger: Das Signal blinkt plötzlich über einer fremden Person.  
   CTA / Lead-Mechanik: "Schreib `SIGNAL`, wenn du die 3 Kriterien willst."  
   Geschätzte Länge: 25-30 Sek.  
   LR-Produkt-Integration: Community-/Business-Integration, kein Einkommensclaim.

3. Titel: Zugang zum Nebenraum  
   Hook: "Die meisten sehen nur den ersten Raum."  
   Story-Arc: Nova läuft durch einen Büroflur, öffnet eine unsichtbare Tür und zeigt die zweite Ebene: Content, Vertrieb, Community, Auto-Konzept.  
   Cliffhanger: Hinter der dritten Tür steht ihr altes Ich.  
   CTA / Lead-Mechanik: Story-Poll oder Kommentar `RAUM`.  
   Geschätzte Länge: 30-40 Sek.  
   LR-Produkt-Integration: Einstieg in Partner-Modell als System-Wahl.

4. Titel: Die Person aus meinem alten Leben  
   Hook: "Dann stand plötzlich mein altes Ich vor mir."  
   Story-Arc: Nova führt einen Dialog mit ihrem gestressten früheren Selbst über Zeit, Geld und Fokus.  
   Cliffhanger: Das alte Ich fragt: "Was hast du verändert?"  
   CTA / Lead-Mechanik: "DM `PLAN`, wenn du die ersten 3 Schritte sehen willst."  
   Geschätzte Länge: 35-45 Sek.  
   LR-Produkt-Integration: LR als Struktur- und Community-Entscheidung.

5. Titel: Das Auto ohne Erklärung  
   Hook: "Das Auto war da, bevor ich bereit war, es zu erklären."  
   Story-Arc: Nova steigt in ein Auto, ohne direkt das Konzept zu erklären. Stattdessen zeigt sie die Reaktionen anderer.  
   Cliffhanger: "Soll ich dir zeigen, wie dieses Modell wirklich funktioniert?"  
   CTA / Lead-Mechanik: Kommentar `AUTO`.  
   Geschätzte Länge: 20-28 Sek.  
   LR-Produkt-Integration: Autokonzept als Neugier-Objekt, keine Einkommensgarantie.

6. Titel: Das rote Protokoll  
   Hook: "Warum scheitern so viele? Weil sie das rote Protokoll nie sehen."  
   Story-Arc: Nova blendet Fehlerbilder ein: kein Content-System, kein Follow-up, falsches Umfeld, keine Routine.  
   Cliffhanger: Sie zieht eine Akte mit der Aufschrift "Nur für Ebene 3".  
   CTA / Lead-Mechanik: "Kommentiere `PROTOKOLL`."  
   Geschätzte Länge: 30-35 Sek.  
   LR-Produkt-Integration: Business-Aufbau über Konsistenz.

7. Titel: Frequenzwechsel  
   Hook: "Ich habe nichts an meinem Kalender geändert und trotzdem hat sich alles verändert."  
   Story-Arc: Nova zeigt, wie derselbe Tag anders aussieht, wenn Content, Gespräche und Energie bewusst geplant werden.  
   Cliffhanger: Ein Alarm meldet "Fremdfrequenz erkannt".  
   CTA / Lead-Mechanik: Freebie "Wochenstruktur" gegen Kommentar `FREQUENZ`.  
   Geschätzte Länge: 25-32 Sek.  
   LR-Produkt-Integration: Routine-Produkte als Trigger für Struktur.

8. Titel: Die stille Rekrutierung  
   Hook: "Die besten Gespräche beginnen nicht im Zoom-Call."  
   Story-Arc: Nova zeigt, wie ein Kommentar, eine Story-Reaktion und ein kurzes DM organisch zu Interesse werden.  
   Cliffhanger: Eine unbekannte Nachricht poppt auf: "Ich glaube, ich bin bereit."  
   CTA / Lead-Mechanik: "Kommentiere `DM`, wenn du meine Antwort-Skripte willst."  
   Geschätzte Länge: 30 Sek.  
   LR-Produkt-Integration: Partnergewinnung ohne Hard-Sell.

9. Titel: Die verbotene Abkürzung  
   Hook: "Alle suchen die Abkürzung. Genau das macht sie langsam."  
   Story-Arc: Nova zerstört den Glauben an virale Einmaltreffer und zeigt Serienlogik.  
   Cliffhanger: Auf dem Monitor erscheint "Serie aktiviert".  
   CTA / Lead-Mechanik: Kommentar `SERIE`.  
   Geschätzte Länge: 28-34 Sek.  
   LR-Produkt-Integration: Content-System rund um LR-Produkte und Opportunity.

10. Titel: Ebene Drei  
    Hook: "Heute zeige ich dir, warum die meisten nie Ebene drei erreichen."  
    Story-Arc: Recap aller Signale, Routinen und Entscheidungen. Nova deutet das eigentliche Team-System an.  
    Cliffhanger: "Wenn du willst, öffne ich die Karte."  
    CTA / Lead-Mechanik: DM `KARTE` für Gespräch oder PDF.  
    Geschätzte Länge: 35-45 Sek.  
    LR-Produkt-Integration: weicher Übergang in Team-/Call-Einladung.

**Beispiel-Captions**

- "Was wie Zufall aussieht, ist oft nur ein System, das andere nie sehen. Wenn du Ebene 2 sehen willst: `MORGEN`."
- "Die meisten leben in der ersten Version ihres Alltags. Ich zeige dir die zweite."
- "Nicht härter arbeiten. Anders strukturieren. Wenn du wissen willst wie: `PLAN`."

**Hashtag-Strategie**

- Primär: `#LR #LRBusiness #Nebenberuf #ContentSystem #Morgenroutine`
- Serien-Tag: `#LRParallelwelt`
- Discovery: `#POVDeutsch #StoryReel #BusinessTokDE #CreatorDeutsch`
- Rotationsregel: 3 Brand-, 3 Serien-, 3 Discovery-, 1 CTA-Tag

### Serie 2: Supplement Avengers

**Premise**  
LR-Produkte werden als überzeichnete Filmcharaktere inszeniert, die jeweils eine klar erkennbare Persönlichkeit und Funktion im "Team" haben. Die Serie funktioniert wie ein Cinematic Universe: jede Figur hat Solo-Folgen, Konflikte und Team-Ups.

**Charakter-Profil**

- Name: Captain Aloe
- Aussehen: `heroic male-female ambiguous premium superhero, age 30, luminous green-gold suit inspired by aloe leaf geometry, clean futuristic armor details, warm charismatic face, athletic posture, cinematic studio lighting, glossy product-grade texture, realistic human proportions, premium blockbuster style, consistent character design, no logos, no text`
- Stimme/Tonalität: spielerisch, charismatisch, leicht überhöht, blockbuster-nah
- Typische Redewendungen: "Team first.", "Das ist mein Einsatz.", "Wir gehen nicht solo.", "Das war erst Phase eins."
- Hintergrund-Story: Captain Aloe ist der Anker eines Teams von Routine-Charakteren. Jede Figur steht nicht für Wunder, sondern für einen anderen Platz im Alltag: Start, Fokus, Pflege, Community, Momentum.

**Visuelle Welt**

- Setting: Hero-HQ, Trainingshalle, Produkt-Lab, City-Night Rooftops, Split-Screen-Missionen
- Farbschema: `#0F172A`, `#1D4ED8`, `#22C55E`, `#FBBF24`, `#F8FAFC`
- Musik-Stil: hybrid trailer music, heroic percussion, bass hits
- Kamera-Stil: low-angle hero shots, fast rack focus, comic-style smash cuts, freeze frames mit Charaktertitel

**Episoden-Plan**

1. Titel: Wer ist Captain Aloe?  
   Hook: "Wenn Aloe ein Superheld wäre, sähe er so aus."  
   Story-Arc: Einführung der Figur mit Stärken, Outfit und Mission: tägliche Routine retten.  
   Cliffhanger: Ein Alarm kündigt den ersten Gegner an: Chaos-Morgen.  
   CTA / Lead-Mechanik: "Kommentiere `HERO`, wenn du das ganze Team sehen willst."  
   Geschätzte Länge: 20-28 Sek.  
   LR-Produkt-Integration: Aloe als Symbolfigur der Routine.

2. Titel: Angriff der Ausreden  
   Hook: "Der gefährlichste Gegner trägt keinen Umhang. Er heißt Ausrede."  
   Story-Arc: Captain Aloe bekämpft typische Einwände als Charaktere.  
   Cliffhanger: "Warte, bis du Fokus-Fury triffst."  
   CTA / Lead-Mechanik: `AUSREDE` kommentieren für Einwand-Skript.  
   Geschätzte Länge: 25-30 Sek.  
   LR-Produkt-Integration: Produkte als Ritual-Bausteine.

3. Titel: Fokus-Fury tritt ein  
   Hook: "Dieser Charakter macht aus 20 offenen Tabs einen klaren Plan."  
   Story-Arc: Fokus-Fury betritt die Szene und strukturiert einen chaotischen Arbeitstag.  
   Cliffhanger: Ein Villain hackt das Team-System.  
   CTA / Lead-Mechanik: DM `FOKUS`.  
   Geschätzte Länge: 22-30 Sek.  
   LR-Produkt-Integration: Fokus-/Routine-Erzählung statt Wirkversprechen.

4. Titel: Glow Commander  
   Hook: "Sie betritt den Raum und plötzlich sieht alles nach Main Character aus."  
   Story-Arc: Glow Commander steht für Pflege, Präsenz und Kamera-Confidence.  
   Cliffhanger: Sie entdeckt einen Verräter im HQ.  
   CTA / Lead-Mechanik: `GLOW` für Routine-Guide.  
   Geschätzte Länge: 20-26 Sek.  
   LR-Produkt-Integration: Beauty-/Pflege-Produkte.

5. Titel: Team-Up Protokoll  
   Hook: "Ein Produkt allein ist nett. Das Team ist die eigentliche Story."  
   Story-Arc: Drei Figuren kombinieren ihre Rollen und zeigen Morning-to-Meeting-Flow.  
   Cliffhanger: Die Stadt verliert Energie.  
   CTA / Lead-Mechanik: Kommentar `TEAM`.  
   Geschätzte Länge: 25-35 Sek.  
   LR-Produkt-Integration: Produkt-Bundles und Reihenfolge.

6. Titel: Die Ursprungsgeschichte  
   Hook: "Niemand wird als Hero geboren. Auch nicht Captain Aloe."  
   Story-Arc: Backstory der Hauptfigur, mit Vorher-Nachher im Filmton.  
   Cliffhanger: Ein Schattenbild sagt: "Ich kenne deine Schwäche."  
   CTA / Lead-Mechanik: `ORIGIN`.  
   Geschätzte Länge: 30-40 Sek.  
   LR-Produkt-Integration: Einstieg in persönliche Story.

7. Titel: Mission Kommentarspalte  
   Hook: "Der eigentliche Kampf findet nicht im Video statt, sondern darunter."  
   Story-Arc: Das Team reagiert auf Kommentare wie Fragen, Skepsis, Hate, Kaufinteresse.  
   Cliffhanger: Ein Kommentar mit nur einem Wort verändert alles: "Start?"  
   CTA / Lead-Mechanik: `START` oder Story-Fragebox.  
   Geschätzte Länge: 24-32 Sek.  
   LR-Produkt-Integration: Kommentar-zu-DM-Mechanik.

8. Titel: Der Doppelgänger  
   Hook: "Dann tauchte eine billige Kopie von Captain Aloe auf."  
   Story-Arc: Kontrast zwischen generischem Werbe-Content und echtem Character-Content.  
   Cliffhanger: Die Kopie infiltriert das HQ.  
   CTA / Lead-Mechanik: `ECHT` kommentieren für Checkliste.  
   Geschätzte Länge: 22-28 Sek.  
   LR-Produkt-Integration: Qualität, Originalität, Vertrauen.

9. Titel: Das geheime Recruiting-Portal  
   Hook: "Niemand hat gemerkt, dass das hier längst kein Produktvideo mehr war."  
   Story-Arc: Ein Hero-Video verwandelt sich in ein Recruiting-Video.  
   Cliffhanger: Das Portal öffnet sich nur für "geeignete Kandidaten".  
   CTA / Lead-Mechanik: DM `PORTAL`.  
   Geschätzte Länge: 28-35 Sek.  
   LR-Produkt-Integration: Opportunity-Soft-CTA.

10. Titel: Endgame der Routine  
    Hook: "Das hier ist nicht die stärkste Figur. Das ist die stärkste Gewohnheit."  
    Story-Arc: Das Team erkennt, dass nicht ein Produkt, sondern Wiederholung die Superkraft ist.  
    Cliffhanger: "Season 2: die Anti-Heroes kommen."  
    CTA / Lead-Mechanik: Kommentar `SEASON2`.  
    Geschätzte Länge: 30-38 Sek.  
    LR-Produkt-Integration: nachhaltige Routine statt Wunder-Story.

**Beispiel-Captions**

- "Wenn Produkte wie Charaktere gedacht werden, wird Content plötzlich erinnerbar. Wer soll als Nächstes ins Team?"
- "Nicht das Produkt ist viral. Die Figur drumherum ist viral."
- "Captain Aloe ist nicht hier, um zu erklären. Er ist hier, um eine Routine zu retten."

**Hashtag-Strategie**

- Primär: `#LRProdukte #Routine #SkincareRoutine #SupplementRoutine #NetworkMarketing`
- Serien-Tag: `#SupplementAvengers`
- Discovery: `#MarvelStyle #CinematicReel #CharacterContent #DeutschReels`
- Rotationsregel: pro Post 2 Produkt-, 2 Serien-, 4 Discovery-, 2 CTA-Tags

### Serie 3: POV Vertriebsgespräch eskaliert

**Premise**  
Eine cringe-komische Mini-Serie zeigt typische Gespräche rund um LR, Nebenberuf, Produkte und Einwände als eskalierende POV-Szenen. Die Zuschauer erkennen sich in den Figuren wieder, lachen darüber und kommentieren ihre eigene Version.

**Charakter-Profil**

- Name: Matz der Überforderte
- Aussehen: `relatable german male content character, age 30-38, slightly messy but stylish business-casual outfit, expressive eyebrows, comedic facial reactions, natural smartphone lighting, everyday apartment or car interior, realistic skin, meme-ready expressions, consistent face, no text, no watermark`
- Stimme/Tonalität: schnell, trocken, selbstironisch, beobachtend
- Typische Redewendungen: "Ganz kurz.", "Das meinte ich doch gar nicht.", "Jetzt wird's wild.", "Und dann wurde es unangenehm."
- Hintergrund-Story: Matz versucht eigentlich nur normale Gespräche zu führen, landet aber ständig in absurden Vertriebs-, Kommentar- oder Familienmomenten. Genau daraus entstehen seine besten Clips.

**Visuelle Welt**

- Setting: Auto, Küche, DM-Screenshot-Look, Split-Screen, WhatsApp-ähnliche Overlays, Parkplatz, Familienfeier
- Farbschema: `#111827`, `#EF4444`, `#F59E0B`, `#10B981`, `#FFFFFF`
- Musik-Stil: awkward comedy beats, bass drops, meme stingers
- Kamera-Stil: Frontkamera, harte Jump Cuts, Punch-Zooms, Reaction Freeze Frames, Text-Overlays

**Episoden-Plan**

1. Titel: "Ich will nur Infos"  
   Hook: "POV: Jemand schreibt 'nur kurz Infos' und du weißt genau, was kommt."  
   Story-Arc: Aus einer harmlosen Nachricht entwickelt sich ein 14-Nachrichten-Hin-und-Her.  
   Cliffhanger: Die Person schreibt plötzlich: "Und wie ist das mit dem Auto?"  
   CTA / Lead-Mechanik: Kommentar `INFO`, um eine saubere DM-Antwort zu bekommen.  
   Geschätzte Länge: 20-26 Sek.  
   LR-Produkt-Integration: Einstiegsgespräch ohne Druck.

2. Titel: Tante Sabine hat Bedenken  
   Hook: "POV: Familienfeier und plötzlich fragt dich Tante Sabine nach Network Marketing."  
   Story-Arc: Matz beantwortet 4 typische Vorurteile in 20 Sekunden.  
   Cliffhanger: Onkel Thomas hört mit.  
   CTA / Lead-Mechanik: `TANTE` kommentieren für Einwand-Liste.  
   Geschätzte Länge: 24-32 Sek.  
   LR-Produkt-Integration: Opportunity-Aufklärung.

3. Titel: "Ich habe keine Zeit"  
   Hook: "POV: Jemand sagt, er hat keine Zeit, während er 3 Stunden scrollt."  
   Story-Arc: Cut-gegen-Cut zwischen Einwand und Tagesrealität.  
   Cliffhanger: "Soll ich dir zeigen, wie 30 Minuten reichen?"  
   CTA / Lead-Mechanik: DM `30MIN`.  
   Geschätzte Länge: 18-24 Sek.  
   LR-Produkt-Integration: Nebenberuflichkeit.

4. Titel: Die Preisfrage  
   Hook: "POV: Das Gespräch kippt exakt bei der Preisfrage."  
   Story-Arc: Matz zeigt die falsche und die richtige Reaktion auf "zu teuer".  
   Cliffhanger: Die Person fragt zurück: "Was ist denn der Unterschied?"  
   CTA / Lead-Mechanik: `PREIS` für Antwort-Skript.  
   Geschätzte Länge: 22-28 Sek.  
   LR-Produkt-Integration: Wert vor Preis.

5. Titel: Der Ghosting-Moment  
   Hook: "POV: Alles lief gut und dann... nichts."  
   Story-Arc: Matz zeigt, wie man auf Ghosting reagiert, ohne needy zu wirken.  
   Cliffhanger: Drei Tage später kommt nur ein Emoji zurück.  
   CTA / Lead-Mechanik: Kommentar `FOLLOWUP`.  
   Geschätzte Länge: 20-25 Sek.  
   LR-Produkt-Integration: Follow-up-Prozess.

6. Titel: Produkt oder Business?  
   Hook: "POV: Du willst über ein Produkt reden und plötzlich geht's ums Business."  
   Story-Arc: Das Gespräch switcht von Kundin zu potenzieller Partnerin.  
   Cliffhanger: "Okay, und wenn ich mehr wissen will?"  
   CTA / Lead-Mechanik: DM `WEITER`.  
   Geschätzte Länge: 24-30 Sek.  
   LR-Produkt-Integration: Produkt-zu-Opportunity-Bridge.

7. Titel: Der Screenshot, den man nicht posten sollte  
   Hook: "POV: Du willst einen Chat posten und merkst in letzter Sekunde, wie heikel das wäre."  
   Story-Arc: Comedy über Datenschutz, Übertreibung und unkluge Social-Proofs.  
   Cliffhanger: Matz sagt: "Ich zeig dir lieber die sichere Version."  
   CTA / Lead-Mechanik: `SAFE` kommentieren.  
   Geschätzte Länge: 18-24 Sek.  
   LR-Produkt-Integration: saubere Social-Proof-Kommunikation.

8. Titel: Der Skeptiker wird neugierig  
   Hook: "POV: Der größte Hater in deinem Umfeld stellt plötzlich ehrliche Fragen."  
   Story-Arc: Matz bleibt ruhig, macht keinen Sieg daraus, sondern öffnet ein Gespräch.  
   Cliffhanger: "Kannst du mir das morgen mal richtig zeigen?"  
   CTA / Lead-Mechanik: Kommentar `SKEPTIKER`.  
   Geschätzte Länge: 25-32 Sek.  
   LR-Produkt-Integration: Umgang mit Skepsis.

9. Titel: Kommentar eskaliert  
   Hook: "POV: Unter deinem Reel bricht in 8 Minuten kompletter Ausnahmezustand aus."  
   Story-Arc: Unterschied zwischen schlechten, guten und exzellenten Kommentar-Antworten.  
   Cliffhanger: Ein Kommentar bringt fünf neue Leute rein.  
   CTA / Lead-Mechanik: `KOMMENTAR` für Antwort-Vorlagen.  
   Geschätzte Länge: 22-30 Sek.  
   LR-Produkt-Integration: Comment-to-Lead-Routing.

10. Titel: Das eigentlich perfekte Gespräch  
    Hook: "POV: Das beste Vertriebsgespräch fühlt sich überhaupt nicht nach Vertrieb an."  
    Story-Arc: Matz zeigt die leise, natürliche Version eines guten Gesprächs.  
    Cliffhanger: "Wenn du willst, poste ich die komplette Struktur morgen."  
    CTA / Lead-Mechanik: `STRUKTUR` kommentieren.  
    Geschätzte Länge: 28-35 Sek.  
    LR-Produkt-Integration: Gesprächslogik für Produkt und Business.

**Beispiel-Captions**

- "Je unangenehmer das Gespräch, desto besser oft der Content. Welche Nachricht hast du schon 100x bekommen?"
- "Wenn du im Vertrieb immer alles perfekt sagen willst, klingst du oft am wenigsten echt."
- "Die Kommentarspalte ist kein Nebenraum. Sie ist der eigentliche Sales-Floor."

**Hashtag-Strategie**

- Primär: `#Vertrieb #NetworkMarketingDE #Nebenberuf #DMStrategie #Einwandbehandlung`
- Serien-Tag: `#POVEskaliert`
- Discovery: `#CringeComedy #POVDeutsch #RelatableReels #SalesTokDE`
- Rotationsregel: 4 Problem-Tags, 2 Serien-Tags, 3 Discovery-Tags, 1 CTA-Tag

## 3. Hook Library Expansion

Ziel: Ausbau des bestehenden `Viral Vault` von ca. 50+ auf 500 Hooks.  
Format-Logik wie in `client/src/pages/ViralVaultPage.tsx`: Kategorie + Hook-String, direkt kopierbar, ohne lange Erklärung.

### Kategorie 1: Schock & Harte Wahrheit

1. Niemand hat dir gesagt, dass Konstanz in diesem Business mehr schlägt als Talent
2. Die meisten scheitern nicht an LR, sondern an 14 Tagen Funkstille
3. Deine Timeline zeigt, warum dein Wachstum stehen bleibt
4. Wenn niemand auf deinen Content reagiert, ist nicht der Algorithmus zuerst das Problem
5. Harte Wahrheit: Ein stilles Profil verkauft nichts
6. Nicht dein Produkt ist unsichtbar, sondern deine Story
7. Wer nur konsumiert, sieht irgendwann überall Chancen und nutzt keine
8. Die meisten wollen Nebeneinkommen, aber keinen sichtbaren Lernprozess
9. Kein Mensch vertraut einem Profil ohne Gesicht
10. Wenn du dich nicht traust zu posten, trainierst du Unsichtbarkeit
11. Dein Umfeld bremst dich oft nicht aktiv, sondern beiläufig
12. Viele sagen "später", wenn sie eigentlich "nie" meinen
13. Du brauchst nicht mehr Motivation, du brauchst weniger Ausreden
14. Der teuerste Fehler ist ein Monat ohne Follow-up
15. Die Wahrheit über Reichweite: Die ersten 3 Sekunden entscheiden fast alles
16. Wenn jeder Post wie Werbung aussieht, wird keiner wie Vertrauen wirken
17. Nicht jeder Interessent ist ein Lead, aber jeder Kommentar ist ein Signal
18. Die meisten verlieren Leads zwischen Kommentar und DM
19. Wer immer nur informiert, wird selten erinnert
20. Ein Profil ohne Serie ist ein Profil ohne Gedächtnis
21. Das Problem ist nicht fehlende Zeit, sondern fehlende Priorität
22. Du kannst keine Community aufbauen, wenn du nur sendest
23. Ein gutes Reel ohne CTA ist oft nur Entertainment für Fremde
24. Viele posten täglich und sagen trotzdem nichts
25. Nicht der Hater schadet deinem Wachstum, sondern deine Angst vor ihm
26. Deine Inhalte sind vielleicht nett, aber nicht zwingend
27. Ohne Charakter bleibt auch guter Content austauschbar
28. Die meisten warten auf Perfektion und trainieren damit Stillstand
29. Wer nur Produkte zeigt, wird selten Gespräche gewinnen
30. Der Unterschied zwischen Hobby-Postern und Gewinnern ist System
31. Schlechter Content ist reparierbar, fehlender Output nicht
32. Deine DMs sind oft leer, weil deine Captions zu höflich sind
33. Kein Mensch kommentiert aus Langeweile, sondern aus Trigger
34. Viele verlieren Geld, weil sie keine einfachen Einstiege anbieten
35. Harte Wahrheit: Dein CTA ist wahrscheinlich zu weich
36. Was du "Authentizität" nennst, ist manchmal nur Planlosigkeit
37. Die meisten reden über Freiheit und zeigen nur Produktfotos
38. Wenn du nie aneckst, wirst du selten erinnert
39. 80 Prozent deiner Wirkung liegen im Einstieg, nicht im Mittelteil
40. Viele wollen viral gehen, aber keiner will wiederholbar werden
41. Ein Reel kann Reichweite bringen, eine Serie baut Nachfrage
42. Der beste Zeitpunkt für dein erstes Gesichtsvideo war vor 30 Tagen
43. Deine Storyviews sind kein Zufall, sie sind ein Spiegel
44. Ohne klare Positionierung ziehst du Neugierige, aber selten Richtige an
45. Nicht jedes "Interesse" ist kaufbereit und das ist okay
46. Der größte Leak im Funnel ist schlechtes Nachfassen
47. Wenn dein Content nichts riskiert, gewinnt er selten
48. Die meisten unterschätzen, wie stark wiederkehrende Formate verkaufen
49. Nicht jedes Nein ist Ablehnung, oft ist es nur Unklarheit
50. Wer keine Daten liest, wiederholt seine Fehler auf schönere Weise

### Kategorie 2: Witz & Selbstironie

1. Ich wollte nur kurz ein Reel posten und hatte plötzlich 17 neue Ideen und null Akku
2. POV: Ich erkläre "nur kurz" LR und baue aus Versehen einen 12-Minuten-Monolog
3. Mein Algorithmus denkt inzwischen, ich lebe nur noch aus Ringlicht und Kaffee
4. Ich: "Heute mache ich frei." Auch ich: drehe 4 Reels im Auto
5. Wenn du "ganz entspannt" posten willst und plötzlich eine Mini-Serie planst
6. Meine Kamera kennt meine Zweifel inzwischen besser als ich
7. Ich wollte Content vorbereiten und hatte am Ende eine Existenzkrise plus Hook-Liste
8. Wenn deine Notizen-App voller CTA-Ideen ist, aber dein Kühlschrank leer
9. Ich nenne es nicht Overthinking, ich nenne es Hook-Qualitätskontrolle
10. Mein Gesicht, wenn jemand "Ist das nicht ein Schneeballsystem?" sagt und ich tief Luft hole
11. Ich wollte nur ein Produkt zeigen und plötzlich war es ein Cinematic Universe
12. Wenn du 8 Takes aufnimmst und der erste der beste war
13. Mein Lieblingssport ist inzwischen Kommentar lesen und emotional stabil bleiben
14. Ich habe keinen Content-Plan, ich habe ein kontrolliertes kreatives Durcheinander
15. Wenn du sagst "nur ein kurzes Update" und 23 Story-Slides draus werden
16. Ich filme mich seit Wochen und tue immer noch so, als wäre das normal
17. Wenn du einen Hook schreibst und dein innerer Cringe direkt mitliest
18. Meine Mutter fragt, ob ich arbeite. Ich sage: "Ja, ich spreche mit meinem Handy."
19. Wenn du ein Reel postest und danach im Minutentakt so tust, als würdest du nicht nachschauen
20. Ich beim Kommentarbeantworten: halb Sales, halb Seelsorge
21. Wenn jemand "Info?" schreibt und du kurz so tust, als wäre das völlig routiniert
22. Ich wollte heute seriös sein, dann kam mir ein besserer POV-Hook
23. Mein Team nennt es Strategie, mein Handy nennt es Speicherproblem
24. Wenn du "authentisch" sein willst und dabei aus Versehen komplett seltsam rüberkommst
25. Ich liebe einfache Systeme, solange ich sie nicht selbst konsequent nutzen muss
26. Wenn der Drehort wieder mal Parkplatz deluxe heißt
27. Ich plane 3 Posts und bekomme 11 B-Roll-Ideen gratis dazu
28. Wenn dein Umfeld denkt, du machst Social Media nebenbei und du innerlich lachst
29. Ich brauche keine Therapie, ich brauche einen besseren Hook für Folge 4
30. Wenn dein Gesichtsausdruck beim Preis-Einwand schon ein eigenes Meme ist
31. Ich erkläre nicht zu viel, ich liefere nur versehentlich Director's Cut
32. Wenn du mitten im Reel merkst, dass die Pointe eigentlich stärker ist als die Message
33. Mein Lieblingsfilter ist inzwischen guter Schnitt
34. Wenn du sagst "ich zeig nur meine Routine" und landest bei Storytelling
35. Ich habe aus Versehen ein Vertriebsgespräch in eine Comedy-Serie verwandelt
36. Wenn du 14 Captions testest und am Ende die frechste gewinnt
37. Ich wollte weniger denken, dann habe ich die Kommentarspalte geöffnet
38. Wenn dein Content-Kalender ordentlicher aussieht als dein Leben
39. Ich nenne es nicht peinlich, ich nenne es relatable
40. Wenn dein bestes Reel aus dem schlechtesten Tag entstanden ist
41. Ich beim Drehen von POVs: Schauspielschule aus dem Handschuhfach
42. Wenn du ernst bleiben willst und deine eigene Hook dich zum Lachen bringt
43. Mein Handy weiß jetzt mehr über meine Mimik als manche Freunde
44. Wenn du dich selber überzeugst, während du den CTA sprichst
45. Ich bin nicht dauernd online, ich bin nur strategisch überall
46. Wenn "mal eben Content" wieder 2 Stunden Lichtsuche bedeutet
47. Ich: kein Druck. Auch ich: analysiere jede Sekunde Retention
48. Wenn aus "nur Infos" plötzlich ein ganzer Funnel wird
49. Ich wollte kein Main Character sein und jetzt habe ich eine Serie
50. Wenn du merkst, dass deine peinlichste Story am meisten Vertrauen gebaut hat

### Kategorie 3: Vergleich & Kontrast

1. Tag 1 vs. Tag 90 als LR Partner und ja, die Unterschiede sind größer als du denkst
2. Das ist der Unterschied zwischen Posten und Positionieren
3. So sieht ein Profil mit System aus und so eins ohne
4. Ein Reel ohne Hook vs. ein Reel mit Hook in 3 Sekunden
5. Produktvideo vs. Charaktervideo und warum eins fast immer gewinnt
6. So klingt ein needy CTA und so ein magnetischer CTA
7. Nebenbei posten vs. mit echter Serienlogik posten
8. Ein Gespräch ohne Struktur vs. ein Gespräch mit sauberem Einstieg
9. Vorher: Informationen. Nachher: Interesse
10. Das hier ist der Unterschied zwischen Content, den man sieht, und Content, den man merkt
11. Eine Story ohne Gesicht vs. eine Story mit echter Person
12. So unterscheidet sich Reichweite von Relevanz
13. Einzelpost vs. Franchise und was im Kopf bleibt
14. Soft-Sell vs. versteckter Hard-Sell
15. Ein skeptischer Kommentar vor und nach der richtigen Antwort
16. So sieht ein guter Opener aus und so ein verschenkter
17. Ein Profil für alle vs. ein Profil für die Richtigen
18. Produktfokus vs. Problemlöse-Fokus
19. Trend kopieren vs. Trend übersetzen
20. Einwilligung zum Gespräch vs. Druck zum Gespräch
21. So wirkt ein generischer Business-Post und so ein persönlicher
22. Video mit Spannung vs. Video mit Erklärung am Anfang
23. Diese zwei Captions unterscheiden oft 3 Kommentare von 30
24. Ein Team mit Content-System vs. Team mit Zufallsposts
25. So sieht "ich hab keine Zeit" aus und so sieht Priorisierung aus
26. Harte Behauptung vs. kluge Neugier
27. Reel für Follower vs. Reel für Leads
28. Die gleiche Idee für TikTok, Instagram und Story in drei Varianten
29. Ein DM-Einstieg, der blockiert, und einer, der öffnet
30. So unterscheiden sich Viewer und echte Interessenten
31. Ein viraler Moment vs. eine virale Serie
32. Reaktion auf Kritik: verteidigen vs. führen
33. Einwandbehandlung mit Druck vs. mit Ruhe
34. Reiner Produktnutzer-Content vs. Opportunity-Bridge
35. Vorher-Nachher ohne Story vs. mit Story
36. Was du zeigst, wenn du verkaufen willst, und was du zeigst, wenn du Vertrauen willst
37. Kurzvideo mit Chaos vs. Kurzvideo mit Schnitt-Intention
38. Gleicher Hook, anderer CTA und komplett anderer Outcome
39. Das ist der Unterschied zwischen Aufmerksamkeit und Erinnerung
40. Ein Post für Freunde vs. ein Post für Fremde
41. Das gleiche Reel mit und ohne Cliffhanger
42. Schönes Video vs. nützliches Video
43. Ein Kommentar-Trigger vs. ein Link-in-Bio-CTA
44. Routine kommunizieren vs. Wunder kommunizieren
45. Dieser kleine Wechsel macht aus Info plötzlich Spannung
46. Community-Aufbau vs. Reichweiten-Jagd
47. Brand-loser Content vs. Content mit eigener Welt
48. Was Partner posten und was Top-Partner wiederholt posten
49. Ein interessierter Lead vor und nach dem ersten Follow-up
50. Sympathisch sein vs. erinnerbar sein

### Kategorie 4: Myth-Busting

1. Mythos: Network Marketing ist nur für geborene Verkäufer
2. Mythos: Du musst sofort dein Umfeld ansprechen
3. Mythos: Du brauchst täglich Stunden, um sichtbar zu werden
4. Mythos: Produkte allein machen den Content stark
5. Mythos: Wer laut ist, gewinnt automatisch
6. Mythos: Ohne großes Publikum lohnt sich Content nicht
7. Mythos: Kommentare sind nur Vanity-Metrik
8. Mythos: Ein Reel muss perfekt aussehen, um zu performen
9. Mythos: Wenn du keine Story hast, kannst du nicht starten
10. Mythos: Nur harte Verkaufsvideos bringen Leads
11. Mythos: Wenn jemand skeptisch ist, ist er raus
12. Mythos: Du brauchst unbedingt ein Studio für guten LR-Content
13. Mythos: Mehr posten heißt automatisch besser posten
14. Mythos: Einwände sind immer Ablehnung
15. Mythos: Man darf im Business nie anecken
16. Mythos: Produkte und Opportunity dürfen nie in derselben Serie vorkommen
17. Mythos: Deutsche Reels müssen trocken und sachlich sein
18. Mythos: Humor macht dich weniger seriös
19. Mythos: Man muss jedes Produktdetail sofort erklären
20. Mythos: Wenn dein Umfeld nicht mitzieht, kannst du nicht wachsen
21. Mythos: Ein kleines Profil kann keine Marke bauen
22. Mythos: Social Proof heißt immer Screenshots zeigen
23. Mythos: Wer viele Fragen stellt, ist unsicher
24. Mythos: CTA wirkt immer aufdringlich
25. Mythos: Storytelling ist nur was für Lifestyle-Influencer
26. Mythos: Trend-Content passt nicht zu LR
27. Mythos: Du darfst dein Business nicht unterhaltsam machen
28. Mythos: Leads kommen erst bei großer Reichweite
29. Mythos: Wenn jemand nur Infos will, hat er kein echtes Interesse
30. Mythos: Produktcontent funktioniert nur mit Vorher-Nachher
31. Mythos: Man muss sich entscheiden zwischen Community und Sales
32. Mythos: Eine gute Caption rettet einen schlechten Einstieg
33. Mythos: Wer neu ist, sollte erst posten, wenn alles sitzt
34. Mythos: Du musst jeden Kommentar beantworten
35. Mythos: Kritik im Kommentarbereich schadet immer
36. Mythos: Nur weibliche Beauty- oder nur männliche Business-Content-Modelle funktionieren
37. Mythos: Ein Funnel beginnt erst im DM
38. Mythos: Wer keine Kamera-Confidence hat, kann keine Reels bauen
39. Mythos: Produkt-Routinen sind langweilig
40. Mythos: Erfolg im Content kommt aus Talent statt Wiederholung
41. Mythos: Ein guter Hook muss immer laut sein
42. Mythos: Die erste Nachricht im DM muss lang und erklärend sein
43. Mythos: Ein viraler Clip ist automatisch ein guter Clip
44. Mythos: Man braucht erst Branding, dann Content
45. Mythos: Nur Junge reagieren auf kurze Reels
46. Mythos: Serien funktionieren nur bei Comedy
47. Mythos: Wer informieren will, darf keine Spannung aufbauen
48. Mythos: Jeder Lead will sofort telefonieren
49. Mythos: Ohne Trend kein Wachstum
50. Mythos: Ohne großes Team kein Sog

### Kategorie 5: POV & Alltag

1. POV: Du öffnest Instagram und merkst, dass dein bester Lead gestern schon kommentiert hat
2. POV: Dein Morgen kippt und genau daraus wird dein bestes Reel
3. POV: Jemand fragt nach LR und du entscheidest dich diesmal gegen den Roman
4. POV: Du filmst im Auto und es sieht plötzlich besser aus als dein letzter Studioclip
5. POV: Du postest zum ersten Mal mit Gesicht und überlebst
6. POV: Aus einer Story-Reaktion wird ein echtes Gespräch
7. POV: Du merkst, dass dein Produktvideo eigentlich eine Business-Story ist
8. POV: Du erklärst das Auto-Konzept ohne das Wort Auto-Konzept zu sagen
9. POV: Dein Umfeld schaut skeptisch und du bleibst trotzdem sichtbar
10. POV: Du beantwortest den gleichen Einwand zum 27. Mal, diesmal aber smart
11. POV: Du nutzt einen Trend und wirkst trotzdem nicht wie jeder andere
12. POV: Du bekommst den ersten Kommentar "Info?" nach 10 stillen Posts
13. POV: Dein Reel geht nicht viral, bringt aber zwei saubere Gespräche
14. POV: Du setzt zum ersten Mal einen klaren CTA und merkst sofort den Unterschied
15. POV: Deine Routine ist gerade das Spannendste an deinem Tag
16. POV: Du realisierst, dass Serien leichter sind als ständig neue Einzelideen
17. POV: Du zeigst ein Produkt und die Kommentare drehen sich ums Business
18. POV: Ein skeptischer Kommentar liefert dir Hook-Material für die ganze Woche
19. POV: Du baust aus einem schlechten Gespräch drei gute Clips
20. POV: Dein Handy ist heute deine Kamera, dein Skript und dein Vertriebspartner
21. POV: Du bist neu und wirkst trotzdem nicht wie Anfänger-Content
22. POV: Deine Story hat mehr verkauft als dein letzter "Verkaufs"-Post
23. POV: Jemand fragt nach dem Preis und du führst das Gespräch endlich richtig
24. POV: Das Team fragt nach Vorlagen und du gibst lieber Prinzipien plus Skripte
25. POV: Du wolltest nur Routine zeigen und plötzlich schaltet die Community sich ein
26. POV: Dein Kommentarbereich wird heute wichtiger als dein Feed
27. POV: Du merkst, dass du nicht mehr Content, sondern mehr Wiederholung brauchst
28. POV: Du drehst in 15 Minuten Material für 5 Clips
29. POV: Du findest deine Main-Character-Energie zwischen Küche und Parkplatz
30. POV: Ein Reel bringt keinen Hype, aber einen sauberen Kalendertermin
31. POV: Du hörst auf, alles zu erklären, und fängst an, besser zu führen
32. POV: Dein Profil sieht zum ersten Mal nach System statt Sammelsurium aus
33. POV: Du merkst, dass deine Storyviews seit dem Serienformat steigen
34. POV: Ein kurzer Satz macht aus Scrollern plötzlich Leser
35. POV: Du führst ein Gespräch, das sich null nach Vertrieb anfühlt
36. POV: Dein alter Content war nett und dein neuer ist merkbar
37. POV: Du drehst dieselbe Szene in drei Varianten für drei Zielgruppen
38. POV: Du beantwortest Hate mit Humor und gewinnst Kommentare
39. POV: Deine Hook trägt den ganzen Clip
40. POV: Du erklärst ein Produkt über den Alltag statt über Inhaltsstoffe
41. POV: Aus "Was ist das?" wird "Wie startet man da?"
42. POV: Dein zweiter Take klingt nicht besser, nur glatter
43. POV: Du lernst gerade, dass Authentizität und Struktur zusammengehen
44. POV: Der beste Trigger für Leads ist heute eine freche Caption
45. POV: Du nimmst die Kamera mit zur Familienfeier und findest Content überall
46. POV: Ein Kommentar liefert dir die perfekte nächste Episode
47. POV: Du postest nicht für Likes, sondern für Reaktionen mit Substanz
48. POV: Dein Team kopiert plötzlich dein Format
49. POV: Du testest einen neuen Charakter und merkst sofort das Potenzial
50. POV: Du gehst heute nicht viral, aber richtig klar

### Kategorie 6: Story Open Loop

1. Ich dachte erst, das wäre nur ein normaler Kommentar, bis ich die zweite Nachricht gelesen habe
2. Dieses Gespräch ist komplett anders ausgegangen, als ich erwartet hatte
3. Warum ich diesen Clip fast nicht gepostet hätte
4. Das Merkwürdigste an dieser LR-Anfrage kam erst ganz am Ende
5. Ich zeige dir gleich den Moment, in dem das Gespräch gekippt ist
6. Erst sah alles nach Standardfrage aus und dann kam diese Wendung
7. Der wichtigste Satz fiel in Sekunde 18
8. Ich habe denselben Fehler monatelang gemacht, bis mir das hier aufgefallen ist
9. Das Problem war nie das Produkt, sondern etwas ganz anderes
10. Die eigentliche Pointe kommt erst nach dem scheinbar harmlosen Einstieg
11. Ich hätte nie gedacht, dass aus genau diesem Kommentar ein Lead wird
12. Was ich in diesem Screenshot weggelassen habe, ist der wichtigste Teil
13. Warte auf die Reaktion nach meiner zweiten Antwort
14. Diese Szene ergibt erst am Ende Sinn
15. Genau an diesem Punkt verlieren die meisten die Aufmerksamkeit
16. Was danach passiert ist, hat mein ganzes Format verändert
17. Am Anfang dachte ich, das wird nur wieder ein Nein
18. Dieser Einwand war am Ende ein Geschenk
19. Ich wollte nur etwas erklären und habe stattdessen ein System entdeckt
20. Die eigentliche Erkenntnis kommt im letzten Satz
21. Dieser Clip startet mit einer Kleinigkeit und endet bei einer größeren Frage
22. Ich hätte die Nachricht fast ignoriert und genau das wäre dumm gewesen
23. Der Hook ist gar nicht der stärkste Teil, der kommt danach
24. Was in Folge 1 harmlos wirkte, eskaliert hier komplett
25. Ich musste den Anfang kürzen, damit du das Ende wirklich spürst
26. Das Verrückte ist nicht die Frage, sondern wer sie gestellt hat
27. Ich habe zuerst falsch reagiert und zeige dir gleich warum
28. Diese Story beginnt im Auto und endet im Kalender
29. Ich weiß, wie das klingt, aber sieh dir die zweite Hälfte an
30. Dieser Clip ist nur die halbe Geschichte
31. Der Moment, an dem ich verstanden habe, was hier wirklich gefragt wurde
32. Ich dachte, ich rede über Routine, eigentlich ging es um Mut
33. Am Ende war nicht die Antwort entscheidend, sondern die Pause davor
34. Genau dieser Perspektivwechsel macht den Unterschied
35. Es fängt klein an und wird in 20 Sekunden groß
36. Die Frage war billig, die Absicht dahinter nicht
37. Ich habe die Reihenfolge geändert und plötzlich hat es funktioniert
38. Dieser Clip beantwortet nicht alles, aber genau das ist der Punkt
39. Was du zuerst siehst, ist nicht das eigentliche Thema
40. Das klingt nach Produktvideo und endet als Recruiting-Story
41. Ich wollte dir nur einen Unterschied zeigen und habe drei gefunden
42. An diesem Punkt war klar, dass die Folge 2 kommen muss
43. Das hier ist nicht der Anfang der Story, sondern der Moment vor dem Anfang
44. Ich habe die Pointe nach vorne gezogen und alles wurde stärker
45. Dieser Kommentar hat eine ganze Serie ausgelöst
46. Das Entscheidende ist die Reaktion nach dem Lachen
47. Du wirst gleich sehen, warum ich dieses Wort nie am Anfang sage
48. Die beste Antwort war nicht die, die ich vorbereitet hatte
49. Das Video erklärt nichts fertig, weil genau das Interesse erzeugt
50. Wenn du bis zum letzten Satz bleibst, verstehst du die eigentliche Frage

### Kategorie 7: Listen & Schrittpläne

1. 3 Dinge, die ich posten würde, wenn ich heute mit LR neu starte
2. 5 Fehler, die dein Profil unnötig schwer verkäuflich machen
3. 3 Sätze, die ich nie wieder an einen Interessenten schicken würde
4. 4 Hooks, die bei skeptischen Zielgruppen besser funktionieren als Hype
5. 5 Content-Ideen, die gleichzeitig Produkt und Business anschneiden
6. 3 Schritte, um aus Kommentaren echte Gespräche zu machen
7. 4 Serienformate, die du sofort für LR adaptieren kannst
8. 5 Dinge, die ein gutes Story-Reel in den ersten 3 Sekunden leisten muss
9. 3 Wege, wie ich einen Trend LR-tauglich machen würde
10. 5 Anzeichen, dass dein CTA zu schwach ist
11. 4 Gründe, warum dein Content zwar nett, aber nicht merkbar ist
12. 3 Fragen, die ich vor jedem Reel stelle
13. 5 Caption-Strukturen, die mehr Kommentare auslösen
14. 4 Arten von Leads, die du im Kommentarbereich erkennst
15. 3 Routinen, die mir jede Woche Content-Zeit sparen
16. 5 Clips, die du aus einem einzigen Dreh ziehen kannst
17. 4 Story-Aufbauten für LR ohne Werbesprech
18. 3 Einwände, die du im Content statt im DM lösen solltest
19. 5 Dinge, die ich an einem kleinen Profil zuerst optimieren würde
20. 4 Signale, dass aus einer Produktanfrage ein Business-Lead werden könnte
21. 3 Arten von Humor, die im LR-Content funktionieren
22. 5 Momente aus dem Alltag, die stärker sind als jede Stock-Aufnahme
23. 4 Kommentar-Antworten, die Gespräche öffnen
24. 3 Clips, mit denen ich eine neue Serie starten würde
25. 5 Kennzahlen, die wichtiger sind als reine Views
26. 4 Dinge, die du vor dem Posten noch prüfen solltest
27. 3 Themen, aus denen du sofort 10 Episoden bauen kannst
28. 5 Möglichkeiten, Produktcontent nicht nach Produktcontent aussehen zu lassen
29. 4 Gründe, warum Charaktere besser erinnern als Angebote
30. 3 CTAs, die weniger pushy und stärker zugleich sind
31. 5 Lead-Trigger, die direkt aus Captions entstehen
32. 4 Elemente, die ein Gewinner-Reel fast immer gemeinsam hat
33. 3 Einstiege, wenn du kameramüde bist
34. 5 Dinge, die ich einem neuen Teammitglied zuerst geben würde
35. 4 Wege, einen skeptischen Kommentar zu nutzen
36. 3 Reaktionsmuster, mit denen du Ghosting sauber beantwortest
37. 5 Nischenwinkel für dasselbe LR-Produkt
38. 4 Arten von Serien, die ich 2026 priorisieren würde
39. 3 Gründe, warum dein schöner Content nicht konvertiert
40. 5 Sätze, die sofort nach Alltag und nicht nach Werbung klingen
41. 4 Ideen, wie du das Auto-Konzept subtil anteaserst
42. 3 Fragen, die ein guter Lead sich selbst stellt, bevor er schreibt
43. 5 Themen für eine komplette Reel-Woche
44. 4 Hinweise, dass deine Community bereit für tieferen Content ist
45. 3 Möglichkeiten, eine Routine in Spannung zu verwandeln
46. 5 Wege, einen Gewinner-Clip zu recyceln
47. 4 Fehler beim Einstieg in DMs
48. 3 einfache Systeme, um 50 Clips pro Woche vorzudenken
49. 5 Content-Säulen, die LR langfristig tragfähig machen
50. 4 Bausteine, die aus Aufmerksamkeit echte Nachfrage machen

### Kategorie 8: Einwandbehandlung

1. "Ich habe keine Zeit" ist selten die ganze Wahrheit
2. Wenn jemand "zu teuer" sagt, meint er oft etwas anderes
3. "Ich will erstmal nur schauen" ist kein Ende, sondern ein Startsignal
4. So reagiere ich, wenn jemand "funktioniert das wirklich?" fragt
5. Was ich sage, wenn jemand keine Lust auf Verkaufen hat
6. Dieser Einwand zeigt oft Interesse, nicht Ablehnung
7. Wenn jemand Angst vor seinem Umfeld hat, fängt das Gespräch hier an
8. So entkräfte ich "Ich bin nicht der Typ für sowas", ohne zu drücken
9. Die Preisfrage beantworte ich nie isoliert
10. "Ich kenne da jemanden, bei dem es nicht lief" ist mein Lieblings-Einstieg
11. Was ich antworte, wenn jemand sagt, er sei nicht fotogen genug
12. "Ich will nichts aufschwatzen" höre ich ständig und antworte immer ähnlich
13. Wenn jemand sagt, er habe schon zu viele Produkte getestet
14. So verschiebe ich das Gespräch von Skepsis zu Neugier
15. "Ich hab schon genug um die Ohren" braucht keine Motivation, sondern Struktur
16. Die Angst vor Ablehnung löst du nicht mit Druck, sondern mit neuen Bildern
17. Wenn jemand nur am Produkt interessiert scheint, höre ich auf die zweite Ebene
18. "Was, wenn ich niemanden kenne?" ist einfacher als viele denken
19. Mein Umgang mit "Ich muss erstmal mit meinem Partner reden"
20. So beantworte ich "Ich hab keine Reichweite"
21. Was ich sage, wenn jemand Network Marketing mit alten Klischees gleichsetzt
22. "Ich bin nicht diszipliniert genug" ist ein guter Punkt zum Einstieg
23. Wenn jemand nicht sofort telefonieren will, dränge ich nie und genau deshalb
24. Diese Antwort hilft bei "Ich bin noch nicht bereit"
25. Wer sagt "später vielleicht", bekommt von mir nicht denselben Follow-up wie alle anderen
26. "Ist das seriös?" beantworte ich immer in drei Schritten
27. So gehe ich mit "Ich will nichts posten" um
28. Wenn jemand nur Ergebnisse sehen will, führe ich zurück zum Prozess
29. "Ich bin zu alt/zu jung dafür" ist meist kein echtes Hindernis
30. Meine Antwort auf "Ich kenne mich mit Social Media nicht aus"
31. Wenn jemand Angst vor Kameras hat, fange ich nie mit der Kamera an
32. "Ich kenne niemanden" lässt sich selten über Kontakte lösen, sondern über Content
33. So lenke ich "zu riskant" in ein ehrliches Gespräch
34. Wenn jemand fragt, ob das nicht alles übertrieben ist
35. Diese Formulierung nutze ich bei "Ich bin schon in etwas anderem"
36. Was ich bei "Ich will erstmal Kunde bleiben" wirklich höre
37. So beantworte ich Einwände, ohne Verteidigungsmodus
38. Wenn jemand schlechte Erfahrungen mit Vertrieb gemacht hat
39. "Was verdiene ich denn da?" beantworte ich nur auf diese Weise
40. So halte ich das Gespräch sauber, wenn jemand nach Wundern fragt
41. Wenn jemand keine Lust auf Teamcalls hat
42. "Ich kann nicht reden wie du" ist nie ein echter Blocker
43. So löse ich den Einwand "Ich will niemanden nerven"
44. Wenn jemand zu viele Fragen stellt, ist das oft ein gutes Zeichen
45. Mein Lieblingssatz bei "Ich denke mal drüber nach"
46. "Ich kenne die Produkte noch zu wenig" ist ein idealer Startpunkt
47. So reagiere ich, wenn jemand sofort einen Beweis verlangt
48. Wer sagt "Ich bin kein Verkäufer", bekommt von mir dieses Bild
49. Wenn jemand schon einmal ausgestiegen ist
50. Gute Einwandbehandlung fühlt sich nie wie Kampf an

### Kategorie 9: Produkt & Routine

1. Meine Morgenroutine mit LR in 20 Sekunden und warum ich sie nicht mehr improvisiere
2. Dieses Produkt ist nicht das Highlight, die Gewohnheit darum ist es
3. Warum meine Routine heute einfacher ist als vor einem Jahr
4. Das ist der Teil meiner Morgenroutine, den fast niemand sieht
5. Mein Alltag wird nicht durch Motivation stabil, sondern durch Wiederholung
6. Drei kleine LR-Momente, die meinen Tag klarer starten lassen
7. So integriere ich Produkte, ohne daraus Werbefernsehen zu machen
8. Meine Routine ist langweilig geworden und genau deshalb funktioniert sie
9. Dieses Produktvideo beginnt nicht mit dem Produkt
10. Ich zeige dir lieber den Platz im Alltag als das Etikett
11. Warum ich meine Routine filmen kann, ohne sie künstlich zu machen
12. Wenn du Produkte nur zeigst, fehlt oft die eigentliche Story
13. Meine Morgenroutine vor der Kamera ist exakt dieselbe wie ohne Kamera
14. Das hier ist kein Wundermittel, das ist mein Startsignal
15. Wie ich Produkte in Storys einbaue, ohne dass sie nach Sales aussehen
16. Diese zwei Routine-Schritte machen meinen Content glaubwürdiger
17. Ich erkläre nie alles auf einmal und genau deshalb fragen Leute nach
18. So erzähle ich Produktcontent über Situationen statt über Features
19. Meine Routine sagt mehr über mein Business als jede Folie
20. Wenn du Produkt und Alltag trennst, verschenkst du Relevanz
21. Das ist mein Setup für einen ruhigen Start in einen vollen Tag
22. Warum ich ein Produkt immer im Kontext zeige
23. Diese Routine eignet sich besser für Reels als jedes klassische Vorher-Nachher
24. Ein gutes Produktvideo lässt Raum für die eigene Fantasie des Zuschauers
25. So baue ich eine Woche lang Produktcontent ohne Wiederholung
26. Warum meine Abendroutine fast mehr Fragen auslöst als meine Morgenroutine
27. Das hier ist keine Produktempfehlung, sondern ein Einblick in meinen Ablauf
28. Wenn Routine sichtbar wird, wird Vertrauen leichter
29. Dieses Produkt ist in meinem Content nur der Auslöser, nicht die ganze Story
30. Ich zeige dir nicht, was du glauben sollst, sondern wie ich es nutze
31. Produktcontent funktioniert besser, wenn man ihn über Momente erzählt
32. Meine Kamera filmt nicht das Produkt, sondern die Bedeutung dahinter
33. Das ist mein unaufgeregtester Clip und genau deshalb fragen Leute nach
34. Drei Routinewinkel, aus denen du sofort 9 Clips machen kannst
35. Warum ich Produkte selten frontal "verkaufe"
36. Dieses Produkt kommt in meiner Story erst in der zweiten Hälfte
37. Mein Lieblingsclip beginnt mit Chaos und endet bei Routine
38. So filme ich dasselbe Produkt drei Tage hintereinander ohne Langeweile
39. Wenn ein Produkt Teil deines Lebens wird, wird Content darüber leichter
40. Nicht jedes Produkt braucht eine Demonstration, manche brauchen einen Kontext
41. Diese kleine Gewohnheit ist bei mir der stärkere Hook als das Produkt selbst
42. Warum die besten Produktclips oft halb Routineclip sind
43. Ich will nicht zeigen, was toll ist, sondern was sich bewährt hat
44. Produkt-Routinen schlagen Produkt-Statements fast immer
45. Das ist der Unterschied zwischen zeigen und inszenieren
46. Mein Produktcontent funktioniert besser, seit ich ihn weniger erklären will
47. Routine ist für mich die ehrlichste Form von Social Proof
48. Diese zwei Fragen stelle ich mir vor jedem Produkt-Reel
49. So führe ich von Routine zu Gespräch, ohne Sprung
50. Die beste Produktintegration ist oft die leiseste

### Kategorie 10: Lead-Trigger & Kommentar-Magneten

1. Kommentiere `INFO`, wenn du die einfache Erklärung willst
2. Schreib `START`, wenn du meine 3 ersten Schritte sehen willst
3. Kommentiere `MORGEN`, wenn du meine Routine-Vorlage willst
4. Schreib `AUTO`, wenn dich das Modell hinter dem Auto wirklich interessiert
5. Kommentiere `PLAN`, wenn du wissen willst, wie ich Content und Alltag strukturiere
6. Schreib `DM`, wenn du meine beste erste Antwort im Chat willst
7. Kommentiere `HOOK`, wenn du 10 Einstiege für deine Nische brauchst
8. Schreib `SERIE`, wenn du sehen willst, wie man aus 1 Idee 10 Folgen macht
9. Kommentiere `PREIS`, wenn du meine Preis-Antwort willst
10. Schreib `FOLLOWUP`, wenn du oft nach der ersten Nachricht hängen bleibst
11. Kommentiere `RAUM`, wenn du meine Business-Ebenen erklärt haben willst
12. Schreib `TEAM`, wenn du das Team-Konzept besser verstehen willst
13. Kommentiere `SAFE`, wenn du saubere Antworten ohne Übertreibung willst
14. Schreib `FOKUS`, wenn du meine Wochenstruktur sehen willst
15. Kommentiere `GLOW`, wenn du meine einfache Pflege-Routine willst
16. Schreib `PORTAL`, wenn dich der Business-Part hinter dem Clip interessiert
17. Kommentiere `ECHT`, wenn du lernen willst, wie Content glaubwürdig wirkt
18. Schreib `AUSREDE`, wenn du meine Antwort auf den häufigsten Einwand willst
19. Kommentiere `STRUKTUR`, wenn du ein sauberes Vertriebsgespräch führen willst
20. Schreib `KOMMENTAR`, wenn du Vorlagen für neugierige Kommentare brauchst
21. Kommentiere `YES`, wenn ich Folge 2 posten soll
22. Schreib `CHECKLISTE`, wenn du meine 7 Prüfsteine vor dem Posten willst
23. Kommentiere `GUIDE`, wenn du die lange Version als PDF willst
24. Schreib `SKRIPT`, wenn du den genauen Wortlaut haben willst
25. Kommentiere `PLAN B`, wenn du keine Lust auf Druck-Vertrieb hast
26. Schreib `ROUTINE`, wenn du die Abfolge sehen willst
27. Kommentiere `CLIP`, wenn du das Format für dein Team brauchst
28. Schreib `LEVEL2`, wenn du die Parallelwelt-Version erklärt haben willst
29. Kommentiere `NEXT`, wenn ich die Fortsetzung zeigen soll
30. Schreib `1`, wenn dich eher Produkte interessieren, `2`, wenn eher Business
31. Kommentiere `PDF`, wenn du die Übersicht kompakt willst
32. Schreib `MAP`, wenn du die Serienstruktur sehen willst
33. Kommentiere `BEISPIEL`, wenn du echte Gesprächsbeispiele willst
34. Schreib `BRIEF`, wenn du nur die Kurzversion willst
35. Kommentiere `DETAIL`, wenn du die tiefe Version sehen willst
36. Schreib `HOOKS`, wenn ich dir 20 Hook-Ideen schicken soll
37. Kommentiere `TEAMCALL`, wenn du sehen willst, wie so ein Gespräch abläuft
38. Schreib `KURZ`, wenn du nur 30-Minuten-Prozesse willst
39. Kommentiere `REPLAY`, wenn du die Kernaussage nochmal kompakt willst
40. Schreib `TEST`, wenn du die Variante für kleine Accounts willst
41. Kommentiere `DMME`, wenn du lieber privat schreiben willst
42. Schreib `VORLAGE`, wenn du die Textvorlage direkt willst
43. Kommentiere `FRAGE`, wenn du nicht weißt, was du als Erstes fragen sollst
44. Schreib `VIDEO`, wenn du das Thema als längere Erklärung willst
45. Kommentiere `AUTO2`, wenn ich das Auto-Thema neutral aufschlüsseln soll
46. Schreib `OHNEDRUCK`, wenn du natürliche Gesprächsführung lernen willst
47. Kommentiere `TEAMFIT`, wenn du wissen willst, für wen das Modell passt
48. Schreib `TUTORIAL`, wenn du den Workflow Schritt für Schritt willst
49. Kommentiere `PROFIL`, wenn du Feedback zu deinem Profilaufbau willst
50. Schreib `WELLE`, wenn du wissen willst, wie aus einem Clip eine ganze Woche wird

## 4. Produktionspipeline 50 Clips/Woche

### Wochenplan Mo-So

| Tag | Fokus | Ziel-Output |
|---|---|---|
| Montag | Trend-Sichtung + Gewinner-Auswertung | 10 Hook-Skizzen, 3 Trend-Angles, 1 Wochenbriefing |
| Dienstag | Serien-Skripting | 10 Episoden-Skripte oder Beat-Sheets |
| Mittwoch | Drehblock A | 15-20 Rohclips für Serie 1 und 2 |
| Donnerstag | Drehblock B | 15-20 Rohclips für Serie 3 + B-Roll + CTA-Varianten |
| Freitag | Edit + Variant Factory | 15 fertige Kernclips + 15 Varianten |
| Samstag | Caption, Kommentar-Trigger, Scheduling | 10-12 Clips publish-ready |
| Sonntag | Performance-Review + Localization + Recycling | 5-8 Reposts/Edits, nächste Gewinnerliste |

### Rollen

- Mathias: Gesicht der Leitserien, finale Freigabe von Tonalität, 1-2 Kern-Drehblöcke, High-trust-CTAs
- Partner: liefern Alltagsszenen, Reaktionsmaterial, lokale Varianten, Kommentare und Einwand-Material
- System: Trend Radar, Hook Engine, Series Builder, Character Bible, Variant Factory, Winner Detector, Comment-to-Lead Router

### Tools pro Schritt

| Schritt | Tool |
|---|---|
| Trend-Check | Trend Radar, Winner Detector, Creator Spy |
| Themenauswahl | Hook Engine, Trend Radar |
| Serienplanung | Series Builder, Character Bible |
| Shotliste | Shot Planner |
| Produktion | Character Bible, Shot Planner |
| Varianten | Variant Factory, Localization |
| Compliance-Screening | `complianceShield.check`, manuelle Endprüfung |
| Kommentar-/Lead-Handling | Comment-to-Lead Router |
| Retro | Winner Detector |

### Quality Gates

1. Hook-Check: erste 3 Sekunden müssen Frage, Bruch oder Konflikt enthalten
2. Serien-Check: Clip muss als Einzelclip funktionieren und auf Folge/Format einzahlen
3. Charakter-Check: Look, Stimme, Phrase und Welt bleiben konsistent
4. Compliance-Check: keine Heil-, Einkommens- oder Garantiesprache
5. CTA-Check: pro Clip genau ein primärer Lead-Trigger
6. Variant-Check: jede Variante ändert nur 1-2 Hebel gleichzeitig
7. Publish-Check: Thumbnail-Frame, Untertitel und Caption müssen ohne Ton funktionieren

### Time-to-Publish pro Clip

- Trend/Idee bis Hook: 5-8 Minuten
- Hook bis Beat-Sheet: 7-10 Minuten
- Beat-Sheet bis Shot-Plan: 5 Minuten
- Dreh pro Clip im Batch: 6-12 Minuten
- Rohschnitt: 8-15 Minuten
- Variantenbau: 3-6 Minuten je zusätzliche Version
- Compliance + Caption + CTA: 4-7 Minuten
- Realistische Gesamtzeit pro Kernclip: 30-50 Minuten
- Realistische Gesamtzeit pro Variantenclip: 10-18 Minuten

### Betriebsmodell für 50 Clips/Woche

- 10 Kernideen pro Woche
- Pro Kernidee 1 Hauptclip + 2 Varianten + 2 Kurzfassungen = 5 Assets
- 10 x 5 = 50 Clips

## 5. Tool-Specs für Claude

Die folgenden Specs sind bewusst auf neue Seiten/Komponenten beschränkt. Bestehende Kern-Dateien bleiben unberührt.

=============================
TOOL: Hook Engine  
BRANCH: claude/hook-engine  
DATEI: client/src/pages/HookEnginePage.tsx

PROMPT AN CLAUDE:
---
Hi Claude, bau mir eine neue Seite Hook Engine.  
Repo: matze190519/sozialmedia-best  
Branch: claude/hook-engine (neu anlegen vom main)  
Datei: client/src/pages/HookEnginePage.tsx

Zweck:  
Die Seite soll aus Thema, Ziel, Plattform, Funnel-Intent und Tonalität sofort 10-30 Hooks erzeugen.  
Sie ist das tägliche Einstiegs-Tool für Reels, Serien und CTA-Tests.

UI-Anforderungen:
- Hero mit klarer Nutzenbotschaft: "Hooks für LR, Reels, Kommentare und Leads"
- Eingabeformular für Thema, Produkt, Zielgruppe, Plattform, Funnel-Ziel, Stil, Risiko-Level
- Ergebnisbereich mit Tabs: Hook, Caption-Openers, CTA-Trigger, Varianten
- Copy-Buttons, Favoriten-Status, "in Generator übernehmen", "als Serie weiterdenken"
- Sidebar mit bestehenden Hook-Kategorien als Inspiration ähnlich Viral Vault
- Qualitätsleiste pro Hook: Scroll-Stop, Kommentar-Potenzial, Lead-Potenzial, Compliance-Risiko

Interaktionen/Flows:
- User gibt Thema + Stil ein -> System erzeugt Hook-Sets
- User klickt auf Hook -> Detailpanel zeigt 3 Varianten, 2 CTA-Versionen und passende Caption-Starts
- User klickt "Als Serie ausbauen" -> Prefill für spätere Series-Builder-Seite
- User klickt "Compliance prüfen" -> Hook wird durch Compliance-Route vorbewertet
- User klickt "In Generator öffnen" -> Übergabe per Query-Param an bestehenden Generator

Daten-Struktur (TypeScript interface):
interface HookRequest {
  topic: string;
  product?: string;
  audience?: string;
  platform: "instagram" | "tiktok" | "facebook" | "youtube";
  funnelGoal: "follower" | "engagement" | "lead";
  hookStyle: "shock" | "story" | "pov" | "myth" | "comparison" | "comedy";
  tone: "bold" | "warm" | "curious" | "premium";
  riskTolerance: "low" | "medium";
}

interface HookResult {
  id: string;
  text: string;
  angle: string;
  ctaTrigger: string;
  captionStarter: string;
  scores: {
    scrollStop: number;
    commentPotential: number;
    leadPotential: number;
    complianceRisk: number;
  };
}

Wo moeglich, nutze bestehende tRPC-APIs:
- brandVoice.getHooks (server/routers.ts:751)
- content.generate (server/routers.ts:80)
- complianceShield.check (server/routers.ts:2720)

Wo neue Backend-Routes noetig -> dokumentiere nur als Spec, bau nicht selbst:
- hookEngine.generateSet
- hookEngine.score
- hookEngine.expandVariant

KEIN Originalcode anfassen:
- Keine Aenderung an App.tsx, DashboardLayout.tsx, CommandPalette.tsx, routers.ts
- Nur NEUE Dateien in client/src/pages/ oder client/src/components/
- Draft-PR am Ende, Manus integriert spaeter.

Design-System: shadcn/ui (Radix), TailwindCSS, Lucide Icons.  
Sprache: Deutsch (User-facing Text), Code auf Englisch.
---
=============================

=============================
TOOL: Trend Radar  
BRANCH: claude/trend-radar  
DATEI: client/src/pages/TrendRadarPage.tsx

PROMPT AN CLAUDE:
---
Hi Claude, bau mir eine neue Seite Trend Radar.  
Repo: matze190519/sozialmedia-best  
Branch: claude/trend-radar (neu anlegen vom main)  
Datei: client/src/pages/TrendRadarPage.tsx

Zweck:  
Die Seite soll Trend-Daten aus dem bestehenden Trend-Scanner in eine strategische Priorisierung übersetzen.  
Nicht nur "was trendet", sondern "welcher Trend passt zu LR, welcher Trend hat Serienpotenzial und welcher Trend ist nur Lärm".

UI-Anforderungen:
- Dashboard mit drei Hauptzonen: "Jetzt nutzen", "Beobachten", "Ignorieren"
- Score-Karten für Trend-Fit, Serienpotenzial, Kommentarpotenzial, CTA-Fit
- Filter nach Plattform, Pillar, Stage, Zielgruppe, Produktbezug
- Detailpanel pro Trend mit LR-Angle, Hook-Vorschlag, Serie-Idee, Risiko-Hinweis
- Heatmap oder Matrix "Trend-Hype vs. LR-Fit"
- Aktionen: "Hook daraus bauen", "Als Serie anlegen", "In Autopilot übergeben"

Interaktionen/Flows:
- User zieht aktuelle Trends -> Matrix und Priorisierung werden berechnet
- User klickt auf einen Trend -> Detailansicht mit LR-Angle und 3 Hook-Vorschlägen
- User markiert Trend als "bearbeitet", "zu spaet" oder "weiter testen"
- User klickt "Serie starten" -> Übergabe an Series Builder

Daten-Struktur (TypeScript interface):
interface TrendRadarItem {
  id: number;
  title: string;
  platform: string;
  pillar?: string;
  viralScore?: number;
  sourceUrl?: string;
  fitScore: number;
  seriesPotential: number;
  leadPotential: number;
  urgency: "now" | "watch" | "skip";
  lrAngle: string;
  suggestedHook: string;
}

Wo moeglich, nutze bestehende tRPC-APIs:
- trends.top (server/routers.ts:1661)
- trends.latest (server/routers.ts:1656)
- trends.scan (server/routers.ts:1628)
- trends.scanPillar (server/routers.ts:1635)
- trends.generateIdeas (server/routers.ts:1666)
- trends.autopilot (server/routers.ts:1691)

Wo neue Backend-Routes noetig -> dokumentiere nur als Spec, bau nicht selbst:
- trendRadar.scoreFit
- trendRadar.classifyUrgency
- trendRadar.createSeriesSeed

KEIN Originalcode anfassen:
- Keine Aenderung an App.tsx, DashboardLayout.tsx, CommandPalette.tsx, routers.ts
- Nur NEUE Dateien in client/src/pages/ oder client/src/components/
- Draft-PR am Ende, Manus integriert spaeter.

Design-System: shadcn/ui (Radix), TailwindCSS, Lucide Icons.  
Sprache: Deutsch (User-facing Text), Code auf Englisch.
---
=============================

=============================
TOOL: Series Builder  
BRANCH: claude/series-builder  
DATEI: client/src/pages/SeriesBuilderPage.tsx

PROMPT AN CLAUDE:
---
Hi Claude, bau mir eine neue Seite Series Builder.  
Repo: matze190519/sozialmedia-best  
Branch: claude/series-builder (neu anlegen vom main)  
Datei: client/src/pages/SeriesBuilderPage.tsx

Zweck:  
Die Seite soll aus einer Einzelidee, einem Trend oder einem Gewinner-Clip eine 5-, 10- oder 20-teilige Serie bauen.  
Sie muss Cliffhanger, CTA-Logik, World Rules und Veröffentlichungsfrequenz mitdenken.

UI-Anforderungen:
- Wizard oder Step-Layout: Ausgangsidee -> Format -> Charakter/Welt -> Episodenbogen -> CTA-Plan
- Serien-Canvas mit Season-Übersicht und Episode Cards
- Felder für Hook, Konflikt, Payoff, Cliffhanger, CTA, LR-Integration je Episode
- Export-Ansichten: Kalender, Beat-Sheets, Shot-Ready, Variant-Ready
- Statusbadges: "Hook steht", "CTA steht", "Character konsistent", "Publishing bereit"

Interaktionen/Flows:
- User gibt Thema oder Trend ein -> Serie mit 10 Episoden wird vorgeschlagen
- User ändert Episode 3 -> Folge 4-10 werden optional neu abgestimmt
- User klickt "Shot Plan erzeugen" -> Daten an Shot Planner übergeben
- User klickt "Varianten bauen" -> Gewinner- oder Episode-Seed an Variant Factory übergeben

Daten-Struktur (TypeScript interface):
interface SeriesPlan {
  id: string;
  title: string;
  premise: string;
  format: "sci-fi" | "comedy" | "hero" | "lifestyle" | "story";
  target: "follower" | "engagement" | "lead";
  episodes: SeriesEpisode[];
}

interface SeriesEpisode {
  episodeNumber: number;
  title: string;
  hook: string;
  storyArc: string;
  cliffhanger: string;
  cta: string;
  estimatedLengthSec: number;
  productIntegration: string;
}

Wo moeglich, nutze bestehende tRPC-APIs:
- content.generate (server/routers.ts:80)
- trends.generateIdeas (server/routers.ts:1666)
- complianceShield.check (server/routers.ts:2720)

Wo neue Backend-Routes noetig -> dokumentiere nur als Spec, bau nicht selbst:
- seriesBuilder.generateSeason
- seriesBuilder.rewriteEpisode
- seriesBuilder.exportBeatSheet

KEIN Originalcode anfassen:
- Keine Aenderung an App.tsx, DashboardLayout.tsx, CommandPalette.tsx, routers.ts
- Nur NEUE Dateien in client/src/pages/ oder client/src/components/
- Draft-PR am Ende, Manus integriert spaeter.

Design-System: shadcn/ui (Radix), TailwindCSS, Lucide Icons.  
Sprache: Deutsch (User-facing Text), Code auf Englisch.
---
=============================

=============================
TOOL: Character Bible  
BRANCH: claude/character-bible  
DATEI: client/src/pages/CharacterBiblePage.tsx

PROMPT AN CLAUDE:
---
Hi Claude, bau mir eine neue Seite Character Bible.  
Repo: matze190519/sozialmedia-best  
Branch: claude/character-bible (neu anlegen vom main)  
Datei: client/src/pages/CharacterBiblePage.tsx

Zweck:  
Die Seite soll Figuren, visuelle Welt, Sprachmuster, Catchphrases und Prompt-Regeln stabil speichern.  
Sie verhindert, dass Serienfiguren je Folge anders aussehen, anders klingen oder ihre Rolle verlieren.

UI-Anforderungen:
- Kartenansicht pro Charakter mit Avatar-Platzhalter, Kurzprofil, Status und Einsatzgebiet
- Tabs für Look Prompt, Negative Prompt, Voice, Phrases, Backstory, World Rules, Produktrolle
- Vergleichsansicht "bisherige Version vs. neue Version"
- Prompt-Blöcke mit Copy-Buttons für Bild und Video
- Konsistenz-Score je Charakter und Warnhinweis bei zu starken Abweichungen

Interaktionen/Flows:
- User legt Charakter an -> System erzeugt strukturierte Bible
- User editiert Phrase oder Look -> Versionierung sichtbar
- User klickt "in Serie verwenden" -> Übergabe an Series Builder
- User klickt "Shot-konform prüfen" -> Übergabe relevanter Regeln an Shot Planner

Daten-Struktur (TypeScript interface):
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
}

Wo moeglich, nutze bestehende tRPC-APIs:
- content.generate (server/routers.ts:80)
- complianceShield.check (server/routers.ts:2720)

Wo neue Backend-Routes noetig -> dokumentiere nur als Spec, bau nicht selbst:
- characterBible.generate
- characterBible.scoreConsistency
- characterBible.exportPromptPack

KEIN Originalcode anfassen:
- Keine Aenderung an App.tsx, DashboardLayout.tsx, CommandPalette.tsx, routers.ts
- Nur NEUE Dateien in client/src/pages/ oder client/src/components/
- Draft-PR am Ende, Manus integriert spaeter.

Design-System: shadcn/ui (Radix), TailwindCSS, Lucide Icons.  
Sprache: Deutsch (User-facing Text), Code auf Englisch.
---
=============================

=============================
TOOL: Winner Detector  
BRANCH: claude/winner-detector  
DATEI: client/src/pages/WinnerDetectorPage.tsx

PROMPT AN CLAUDE:
---
Hi Claude, bau mir eine neue Seite Winner Detector.  
Repo: matze190519/sozialmedia-best  
Branch: claude/winner-detector (neu anlegen vom main)  
Datei: client/src/pages/WinnerDetectorPage.tsx

Zweck:  
Die Seite soll bestehende Posts, Serienfolgen und Creator-Spy-Signale bewerten und klare Handlungsempfehlungen geben.  
Sie beantwortet: replizieren, variieren, lokalisieren, pausieren oder als Serie ausbauen.

UI-Anforderungen:
- Tabelle oder Karten mit Content-Items und Status "Winner", "Maybe", "Stop"
- Score-Module für Hook, Kommentarquote, Saves, CTA-Response, Lead-Signal, Serienpotenzial
- Aktionspanel "nächster Move": Variante bauen, Folge 2, lokalisieren, CTA wechseln
- Filter für Plattform, Format, Serie, Ziel, Zeitraum
- Bereich "Patterns diese Woche" mit wiederkehrenden Gewinner-Mustern

Interaktionen/Flows:
- User wählt Zeitraum oder Serie -> Gewinnerliste aktualisiert sich
- User klickt auf einen Gewinner -> System zeigt exakte Gründe und nächste Experimente
- User klickt "Variante bauen" -> Übergabe an Variant Factory
- User klickt "in Hook Engine" -> nur der Opener wird extrahiert und weiterentwickelt

Daten-Struktur (TypeScript interface):
interface WinnerItem {
  id: string;
  title: string;
  platform: string;
  format: string;
  score: number;
  label: "winner" | "maybe" | "stop";
  strengths: string[];
  risks: string[];
  recommendedNextMove: "replicate" | "variant" | "localize" | "series" | "stop";
}

Wo moeglich, nutze bestehende tRPC-APIs:
- creatorSpy.latest (server/routers.ts:968)
- creatorSpy.reports (server/routers.ts:964)
- creatorSpy.analyze (server/routers.ts:970)
- trends.top (server/routers.ts:1661)

Wo neue Backend-Routes noetig -> dokumentiere nur als Spec, bau nicht selbst:
- winnerDetector.scoreContent
- winnerDetector.extractPattern
- winnerDetector.queueVariant

KEIN Originalcode anfassen:
- Keine Aenderung an App.tsx, DashboardLayout.tsx, CommandPalette.tsx, routers.ts
- Nur NEUE Dateien in client/src/pages/ oder client/src/components/
- Draft-PR am Ende, Manus integriert spaeter.

Design-System: shadcn/ui (Radix), TailwindCSS, Lucide Icons.  
Sprache: Deutsch (User-facing Text), Code auf Englisch.
---
=============================

=============================
TOOL: Variant Factory  
BRANCH: claude/variant-factory  
DATEI: client/src/pages/VariantFactoryPage.tsx

PROMPT AN CLAUDE:
---
Hi Claude, bau mir eine neue Seite Variant Factory.  
Repo: matze190519/sozialmedia-best  
Branch: claude/variant-factory (neu anlegen vom main)  
Datei: client/src/pages/VariantFactoryPage.tsx

Zweck:  
Die Seite soll aus einem Gewinner-Clip systematisch neue Fassungen nach Hook, CTA, Perspektive, Zielgruppe und Plattform erzeugen.  
Sie ist der Kern für Skalierung von 10 Kernideen auf 50 Clips pro Woche.

UI-Anforderungen:
- Input für Ursprungsclip, Gewinner-Signal, Zielplattform und Variantenzahl
- Variant-Grid nach Hebeln: Hook, Character, CTA, Länge, Sprachstil, Local Angle
- Vergleichsansicht Original vs. Variante
- Quick-Labels: "nur Hook tauschen", "CTA tauschen", "POV drehen", "Comedy-Version", "Premium-Version"
- Export-Buttons: Copy, als Batch planen, in Localization schicken

Interaktionen/Flows:
- User lädt einen Gewinner-Seed ein -> 10 Varianten werden vorgeschlagen
- User sperrt bestimmte Elemente wie CTA oder Charakter -> nur andere Hebel variieren
- User markiert Varianten als A/B-Test oder Recycle
- User klickt "Compliance prüfen" -> Varianten werden vorbewertet

Daten-Struktur (TypeScript interface):
interface VariantSeed {
  id: string;
  originalHook: string;
  originalCta: string;
  originalAngle: string;
  platform: string;
  goal: "follower" | "engagement" | "lead";
}

interface VariantResult {
  id: string;
  variantType: "hook" | "cta" | "audience" | "character" | "platform" | "language";
  text: string;
  explanation: string;
  estimatedImpact: number;
}

Wo moeglich, nutze bestehende tRPC-APIs:
- content.generate (server/routers.ts:80)
- content.generateBatch (server/routers.ts:219)
- complianceShield.check (server/routers.ts:2720)

Wo neue Backend-Routes noetig -> dokumentiere nur als Spec, bau nicht selbst:
- variantFactory.generate
- variantFactory.compare
- variantFactory.batchPlan

KEIN Originalcode anfassen:
- Keine Aenderung an App.tsx, DashboardLayout.tsx, CommandPalette.tsx, routers.ts
- Nur NEUE Dateien in client/src/pages/ oder client/src/components/
- Draft-PR am Ende, Manus integriert spaeter.

Design-System: shadcn/ui (Radix), TailwindCSS, Lucide Icons.  
Sprache: Deutsch (User-facing Text), Code auf Englisch.
---
=============================

=============================
TOOL: Comment-to-Lead Router  
BRANCH: claude/comment-to-lead-router  
DATEI: client/src/pages/CommentToLeadRouterPage.tsx

PROMPT AN CLAUDE:
---
Hi Claude, bau mir eine neue Seite Comment-to-Lead Router.  
Repo: matze190519/sozialmedia-best  
Branch: claude/comment-to-lead-router (neu anlegen vom main)  
Datei: client/src/pages/CommentToLeadRouterPage.tsx

Zweck:  
Die Seite soll Kommentare und DMs nach Lead-Intention clustern und Antwortpfade empfehlen.  
Sie soll aus "Info?", "Preis?", "Wie startest du?" und skeptischen Kommentaren planbare Gesprächseinstiege machen.

UI-Anforderungen:
- Inbox-artige Oberfläche mit Kommentar-Karten und Status-Spalten
- Intent-Badges: Neugier, Preis, Produkt, Business, Skepsis, Warm Lead
- Antwortempfehlungen mit 3 Optionen: kurz, weich, direkt
- CTA-Panel mit nächstem Schritt: DM, Story-Link, Guide, Call, Follow-up
- Compliance-Hinweise sichtbar vor dem Senden
- Bereich "Antwort-Vorlagen lernen aus Gewinnern"

Interaktionen/Flows:
- User fügt Kommentare manuell ein oder simuliert sie
- System klassifiziert Kommentar und schlägt 3 Antworten vor
- User klickt Antwort -> Detailpanel zeigt Folgefrage und Eskalationspfad
- User markiert Kommentar als "Lead", "Follow-up", "nur Community", "nicht verfolgen"

Daten-Struktur (TypeScript interface):
interface LeadCommentInput {
  id: string;
  source: "comment" | "dm";
  platform: "instagram" | "facebook" | "tiktok";
  text: string;
  postContext?: string;
}

interface RoutedLeadResult {
  id: string;
  intent: "curious" | "price" | "product" | "business" | "skeptic" | "hot";
  confidence: number;
  suggestedReplies: string[];
  nextBestAction: "ask-question" | "send-guide" | "move-to-dm" | "book-call" | "do-not-push";
  complianceNotes?: string[];
}

Wo moeglich, nutze bestehende tRPC-APIs:
- complianceShield.check (server/routers.ts:2720)
- content.generate (server/routers.ts:80)

Wo neue Backend-Routes noetig -> dokumentiere nur als Spec, bau nicht selbst:
- commentRouter.classify
- commentRouter.replyOptions
- commentRouter.nextBestAction

KEIN Originalcode anfassen:
- Keine Aenderung an App.tsx, DashboardLayout.tsx, CommandPalette.tsx, routers.ts
- Nur NEUE Dateien in client/src/pages/ oder client/src/components/
- Draft-PR am Ende, Manus integriert spaeter.

Design-System: shadcn/ui (Radix), TailwindCSS, Lucide Icons.  
Sprache: Deutsch (User-facing Text), Code auf Englisch.
---
=============================

## 6. Meine ehrliche Empfehlung

Wenn ich nur ein Tool zuerst bauen duerfte, wuerde ich mit der **Hook Engine** starten, direkt gefolgt von **Series Builder** und **Character Bible**. Die Hook Engine liefert fuer Mathias und das Team den schnellsten spuerbaren Produktivitaetsgewinn im Alltag, der groesste WOW-Faktor entsteht aber durch **Character Bible + Series Builder**, weil damit ploetzlich echtes Franchise-Gefuehl statt Standard-Content moeglich wird. Die schnellste Viral-Welle wird aus meiner Sicht nicht durch den ausgefeiltesten Trend-Scanner, sondern durch eine Kombination aus **starken wiederholbaren Hook-Formaten, klaren Serienfiguren und aggressivem Variant-Testing** ausgeloest.
