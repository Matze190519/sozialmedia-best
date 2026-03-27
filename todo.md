# LR Content Approval Dashboard - TODO

- [x] Datenbank-Schema: contentPosts, contentTemplates, creatorSpyReports, approvalLogs
- [x] Backend: GoViralBitch API Integration (Posts, Reels, Hooks, Ad Copy, Follow-Ups, Batch)
- [x] Backend: Blotato API Integration (Multi-Platform Publishing nach Approval)
- [x] Backend: Approval-Workflow Logik (Pending → Approved/Rejected → Scheduled)
- [x] Backend: Team-Rollen & Permissions (Admin vs. Team-Mitglied)
- [x] Backend: Content-Templates CRUD
- [x] Backend: Creator Spy Reports speichern und abrufen
- [x] Backend: Batch-Content-Generator über GoViralBitch /api/content/batch
- [x] Frontend: Dashboard Layout mit Sidebar-Navigation (3 Sektionen: Content, Strategie, Team)
- [x] Frontend: Content Queue mit Status-Filter (Pending/Approved/Rejected/Scheduled)
- [x] Frontend: Post-Detail-Ansicht mit Bearbeiten, Genehmigen, Ablehnen
- [x] Frontend: Content-Kalender (Wochenansicht mit Plattform-Filter)
- [x] Frontend: Batch-Content-Generator UI
- [x] Frontend: Creator Spy Dashboard mit Hook-Analyse und Performance-Tier
- [x] Frontend: Content-Vorlagen-Bibliothek
- [x] Frontend: Analytics-Übersicht
- [x] Frontend: Team-Management Seite
- [x] Design: Professionelles Dark-Theme mit LR-Branding-Farben
- [x] Media-Support: Bilder und Videos bei Posts hochladen und mit Blotato publishen
- [x] KI-Bild-Generierung: Bilder direkt im Dashboard per KI erstellen (eingebaute Image Generation API)
- [x] KI-Video-Generierung: Videos direkt im Dashboard per KI erstellen
- [x] Vorlagen aus GitHub-Repos (marketingskills, social-content-skill) als Templates einbauen
- [x] Generator: Media-Upload + KI-Bild/Video-Generierung beim Content-Erstellen
- [x] Lead-Generierung: CTAs und Hook-Formulas die Kontakte anziehen
- [x] Virale Content-Strategie: Trends erkennen, duplizieren, optimieren
- [x] Tests: Vitest für Backend-Logik

## Premium Upgrade - Content Maschine
- [x] fal.ai Video-KI Integration (Kling 3.0 Pro, Minimax) - echte Video-Generierung
- [x] Brand Voice System aus Agent Brain (LR-spezifisch pro Plattform, 9 Plattformen)
- [x] Quality Gate vor jedem Post (automatische Prüfung: Länge, Brand Safety, Hook, CTA, Emojis, Hashtags, LR-Branding)
- [x] Viral Script Engine im Dashboard (7 Templates: Reel, Story, Contrarian, List, HowTo, Carousel, YouTube)
- [x] CTA-Templates pro Plattform aus GoViralBitch Vorlagen
- [x] Storyselling Script Templates einbauen
- [x] Audience Blockers / Einwandbehandlung im Dashboard
- [x] Hook Formulas: 5 Stile mit Templates
- [x] Brand Voice Generator: LLM-basiert mit komplettem Brand Voice Context
- [x] Generator Page: 5 Tabs (Brand Voice, GoViral, KI-Bild, KI-Video, Vorlagen)
- [x] fal.ai API Key eingetragen und validiert

## Ultimate Team Upgrade
- [x] Eigene Blotato API Keys pro Team-Mitglied (Einstellungen-Seite mit Anleitung)
- [x] Auto-Post nach Freigabe (Toggle in Einstellungen, braucht Blotato Key)
- [x] Content-Bibliothek: Texte, Bilder, Videos abrufen, kopieren, filtern nach Kategorie/Pillar
- [x] Personalisierung: Eigene Signatur, Hashtags, Vorstellung, CTA pro Team-Mitglied
- [x] Bevorzugte Posting-Zeiten pro Plattform (Einstellungen)
- [x] Feedback-System: Posts bewerten (1-5), Top-Posts anzeigen, Learnings
- [x] A/B Testing: 2 Varianten erstellen, vergleichen, Gewinner bestimmen
- [x] Optimale Posting-Zeiten basierend auf Engagement-Daten
- [x] Lina API-Endpoint für Content-Abruf (öffentlicher Endpoint)
- [x] Navigation in 3 Sektionen: Content, Strategie, Team
- [x] Kosten-Info: fal.ai übernimmt Mathias, Blotato zahlt jeder selbst (25€)
- [x] 60/60 Tests bestanden (6 Test-Dateien)

## Zugang & Sicherheit
- [x] Blotato API Key getestet - 8 Accounts verbunden (Facebook, YouTube, Instagram, LinkedIn, Threads, 2x TikTok, Twitter)
- [x] Blotato Base URL korrigiert (backend.blotato.com/v2)
- [x] Team-Zugang absichern: Partner-Freischaltung mit Partnernummer + Telefon
- [x] Partner-Freischaltung: Admin gibt Partner manuell frei (Name + Partnernummer + WhatsApp)
- [x] Partner sperren: Admin kann Zugang entziehen
- [x] Lina API-Endpoint für Content-Abruf (öffentlicher Endpoint)
- [x] 66/66 Tests bestanden (7 Test-Dateien)

## Produktbild-Bibliothek (Originale LR-Bilder)
- [x] Botpress ProductTable API-Integration: 226 Produkte mit Originalbildern
- [x] Datenbank: products Tabelle mit Name, Kategorie, Preis, Bild-URL, Beschreibungen
- [x] Backend: Produkte importieren und abrufen (tRPC Procedures)
- [x] Frontend: Produktbild-Bibliothek mit Kategorie-Filter und Suche
- [x] Frontend: Produktbilder im Content-Generator auswählen können
- [x] Tests: Vitest für Produkt-Endpoints (12 Tests, 78/78 gesamt bestanden)

## System-Optimierung & Produktionsreif machen (HEUTE!)
- [x] Produkte in Kategorien eingeteilt (Aloe Vera, Körperpflege, ZEITGARD, Parfum, etc.)
- [ ] End-to-End-Test: Content erstellen → Freigabe → automatisch posten
- [x] Freigabe-Workflow klar: Sidebar "Freigabe" mit Badge-Counter + Dashboard-Link
- [x] Posting-Queue: Dashboard zeigt "Warten auf Freigabe" mit direktem Link
- [ ] Posting-Zeiten: Automatisch optimal oder manuell festlegen?
- [ ] Automatisches Posting mit Blotato testen (funktioniert es wirklich?)
- [x] Content-Mix: 86% Lifestyle / 14% Produkt im Dashboard angezeigt
- [ ] System generiert automatisch Text + Bild/Video? Testen!
- [ ] Lina-Integration: Content Hub mit Lina verbinden
- [ ] Team-Verifizierung: Partner-Freischaltung testen

## Mega-Optimierung - System bis an die Zehenspitzen (27.03.2026)
- [x] GitHub-Repos durchsuchen nach Erweiterungen (GoViralBitch, Lina, etc.)
- [x] Navigation radikal vereinfachen - 4 klare Bereiche (Workflow, Intelligence, Ressourcen, System)
- [x] Content-Mix 86/14 automatisiert (Agent Brain: Autokonzept 3x, Business 4x, Lifestyle 3x, Gesundheit 2x, Lina 2x)
- [x] Ein-Klick-Workflow: Generator → Freigabe → Auto-Post mit Toggle
- [x] Smart Scheduling: Zeitpunkt beim Genehmigen wählbar oder sofort posten
- [ ] Lifestyle-Content-Engine: Freiheit, Autos, Erfolg, Business Bilder/Videos
- [x] Quick-Start Onboarding-Seite mit 5-Schritt Setup und Fortschrittsanzeige
- [x] Sidebar-Navigation optimiert: 4 Gruppen (Workflow, Intelligence, Ressourcen, System)
- [x] Dashboard: 3-Step-Pipeline + "Warten auf Freigabe" + Content-Mix Autopilot
- [ ] Blotato-Test: Verifizieren dass Auto-Post funktioniert

## Botpress/Lina Integration
- [x] Botpress Lina Flow analysiert - Menüstruktur und Tabellen dokumentiert
- [x] Anleitung erstellt: Menüpunkt "Leads kaufen" → "Tools" mit 4 Unterkategorien
- [x] Content Hub Dashboard als Unterkategorie definiert (in Anleitung)
- [ ] Content Hub API-Endpoint in Lina verbinden (manuell in Botpress Studio)
- [ ] Testen ob der neue Menüpunkt funktioniert (nach manueller Umsetzung)

## Fortschrittlichstes Content-Tool - Viral-Engine & Vollautomatisierung
- [x] Trend-Scanner: Automatisch virale Trends erkennen (TikTok, YouTube, Reddit) mit Viral Score
- [x] Viral-Content-Engine: Autopilot generiert Content + Bild aus Trends in einem Klick
- [x] Creator Spy: Wettbewerber-Analyse mit Agent Brain Content-Pillars integriert
- [x] Vollautomatische Pipeline: Trend → Content + Bild → Freigabe → Auto-Post via Blotato
- [x] Anleitung für Botpress-Änderungen erstellt (detaillierte Schritt-für-Schritt Anleitung)

## Game-Changer Features - Besser als Predis.ai, Ocoya, Buffer (27.03.2026)
- [x] Content Repurposing: Blotato postet auf alle Plattformen, Brand Voice passt Ton pro Plattform an
- [x] Smart Hashtag-Engine: KI-generierte trendbasierte Hashtags pro Plattform
- [x] Monatsplan-Generator: 30 Posts auf Knopfdruck für den ganzen Monat
- [ ] Datenbasierte optimale Posting-Zeiten pro Plattform (nicht statisch)
- [x] Evergreen Recycling: Top-Posts automatisch nach X Wochen wiederverwenden

## Finale Game-Changer Features (27.03.2026)
- [x] Smart Hashtag-Engine: KI-generierte trendbasierte Hashtags pro Plattform + Instagram Recherche
- [x] Hashtag-Pools: Vordefinierte LR-spezifische Hashtag-Sets pro Pillar (6 Kategorien)
- [x] Monatsplan-Generator: 30 Posts auf Knopfdruck für den ganzen Monat (Agent Brain Wochenplan)
- [x] Evergreen Recycling: Top-Posts automatisch nach X Wochen wiederverwenden (mit KI-Variation)
- [x] Tests: 112/112 bestanden (10 Test-Dateien)
