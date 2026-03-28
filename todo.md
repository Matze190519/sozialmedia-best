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
- [x] End-to-End-Test: 5 Posts erfolgreich auf Instagram gepostet
- [x] Freigabe-Workflow klar: Sidebar "Freigabe" mit Badge-Counter + Dashboard-Link
- [x] Posting-Queue: Dashboard zeigt "Warten auf Freigabe" mit direktem Link
- [ ] Posting-Zeiten: Automatisch optimal oder manuell festlegen?
- [x] Automatisches Posting mit Blotato getestet und funktioniert
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
- [x] Lifestyle-Content-Engine: Freiheit, Autos, Erfolg, Business Bilder/Videos
- [x] Quick-Start Onboarding-Seite mit 5-Schritt Setup und Fortschrittsanzeige
- [x] Sidebar-Navigation optimiert: 4 Gruppen (Workflow, Intelligence, Ressourcen, System)
- [x] Dashboard: 3-Step-Pipeline + "Warten auf Freigabe" + Content-Mix Autopilot
- [x] Blotato-Test: 5/5 Posts erfolgreich auf Instagram gepostet

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
- [x] Datenbasierte optimale Posting-Zeiten pro Plattform (nicht statisch)
- [x] Evergreen Recycling: Top-Posts automatisch nach X Wochen wiederverwenden

## Finale Game-Changer Features (27.03.2026)
- [x] Smart Hashtag-Engine: KI-generierte trendbasierte Hashtags pro Plattform + Instagram Recherche
- [x] Hashtag-Pools: Vordefinierte LR-spezifische Hashtag-Sets pro Pillar (6 Kategorien)
- [x] Monatsplan-Generator: 30 Posts auf Knopfdruck für den ganzen Monat (Agent Brain Wochenplan)
- [x] Evergreen Recycling: Top-Posts automatisch nach X Wochen wiederverwenden (mit KI-Variation)
- [x] Tests: 164/164 bestanden (13 Test-Dateien)

## Finale Runde (27.03.2026)
- [x] Blotato End-to-End Test: 5 Posts mit Bildern erfolgreich auf Instagram gepostet
- [x] Datenbasierte Posting-Zeiten: Dynamische Berechnung wann Zielgruppe am aktivsten ist
- [x] Lifestyle-Content-Engine: Automatisch Bilder/Videos zu Freiheit, Autos, Erfolg, Business finden und generieren

## Datenbasierte Posting-Zeiten (27.03.2026)
- [x] Backend: Smart Posting Times Engine mit Engagement-Daten pro Plattform
- [x] Backend: Feedback-Daten (Bewertungen) für Zeitslot-Optimierung nutzen
- [x] Backend: Plattform-spezifische Algorithmen (Instagram vs TikTok vs LinkedIn etc.)
- [x] Router: tRPC Endpoints für optimale Zeiten abrufen
- [x] Integration: Optimale Zeit automatisch bei Freigabe vorschlagen
- [x] Frontend: Optimale Zeiten im Approval-Flow und Einstellungen anzeigen
- [x] Tests: Vitest für Posting-Zeiten Engine

## Blotato Calendar API Integration (27.03.2026)
- [x] Blotato Calendar API recherchieren - Endpoints und Dokumentation
- [x] Backend: Calendar API Funktionen in externalApis.ts einbauen (GET/PATCH/DELETE /schedules)
- [x] Backend: tRPC Router für Calendar-Operationen (list, get, update, reschedule, delete, byDate)
- [x] Frontend: Kalender-View mit Blotato-Daten synchronisieren (Tabs: Blotato + Dashboard)
- [x] Frontend: Edit-Dialog (Post-Text bearbeiten), Reschedule-Dialog, Delete-Funktion
- [x] Tests: Calendar API Integration getestet (14 Tests bestanden)

## Blotato End-to-End Test (27.03.2026)
- [x] End-to-End: 5 Posts mit Nano Banana Pro Bildern erfolgreich über Blotato auf Instagram gepostet
- [x] Blotato Slot-Fallback: useNextFreeSlot durch konkreten Zeitpunkt ersetzt (Smart Posting Times)

## Blotato AI Agent Features (27.03.2026) - GESTRICHEN
- [x] NICHT NÖTIG: fal.ai deckt alles ab (Nano Banana Pro + Veo 3.1 + Kling 3.0 Pro)
- [x] Kosten: Mathias zahlt fal.ai, Partner zahlen nur 25€ Blotato zum Posten

## Lina-Integration mit Botpress (27.03.2026)
- [ ] Content Hub API-Endpoint für Botpress Lina erstellen (öffentlich)
- [ ] Endpoint liefert: neueste Posts, Kategorien, Status
- [ ] Anleitung für Botpress Studio: API-Aufruf einrichten
- [ ] Testen ob Lina den Content Hub korrekt abruft

## Premium KI-Modelle Upgrade (27.03.2026)
- [x] Bild: Nano Banana Pro (immer das Beste, $0.15/Bild)
- [x] Video: Veo 3.1 Fast (Standard, bis 8s, 4K, Audio) + Kling 3.0 Pro (Fallback >8s, bis 15s)
- [x] Automatische Modellwahl: Veo 3.1 für kurze Videos, Kling 3.0 Pro für lange
- [x] Blotato Visual Templates als Zusatz-Option (Carousels, Quote Cards)

## Live-Test + Mobile Fix (27.03.2026)
- [x] Alte Test-Posts aus DB löschen (aufräumen)
- [x] Echten Premium-Post mit Nano Banana Pro Bild generieren und in Freigabe schieben
- [x] Mobile Ansicht verbessern (responsive Sidebar, bessere Touch-Bedienung)
- [x] Alle generierten Texte auf Deutsch sicherstellen
- [x] Live-Test: 5/5 Posts erfolgreich auf Instagram gepostet via Blotato

## Fixes nach Live-Test (27.03.2026)
- [x] Bild 2 (Autokonzept) lädt nicht - neu generiert mit Veo 3.1 Video
- [x] Hashtags auf max 5 reduziert (Instagram-Empfehlung 2026)
- [x] Videos: Veo 3.1 Video für Autokonzept-Post generiert (4s, 9:16)
- [x] Bilder: NO TEXT Anweisung automatisch an jeden Prompt
- [x] System-weit: Hashtag-Limit auf 5 für Instagram gesetzt
- [x] System-weit: Bild-Prompts OHNE Text-Anweisungen
- [x] GoViralBitch Content auf Deutsch gesetzt (language: deutsch)
- [x] Veo 3.1 Duration-Fix (nur 4s/6s/8s erlaubt)

## Dashboard Fertigstellung (27.03.2026 Nacht)
- [x] Freigabe-Flow: Bilder + Videos müssen in der Freigabe sichtbar sein (groß, nicht nur Link)
- [x] Freigabe-Flow: Nach Freigabe → Blotato posten ODER im Dashboard speichern (für Partner ohne Blotato)
- [x] Video-Generierung: Veo 3.1 Videos automatisch bei Content-Erstellung generieren
- [x] Trend-basierter Content: Virale Trends recherchieren → Content daraus klonen
- [x] Virale Hashtags: Trend-basierte Hashtags automatisch einbauen
- [x] Content-Bibliothek: Alle Posts im Dashboard gespeichert (Copy+Paste für Partner ohne Blotato)
- [x] Dashboard-UI nach Postiz-Vorlage überarbeiten (sauberer, selbsterklärender)
- [x] Alle Texte auf Deutsch
- [x] End-to-End über Dashboard-UI testen (nicht über Script)

## Live-Ready für 10 Partner Testphase (28.03.2026)
- [x] Echter Content-Test: Trend scannen → Autopilot → Text + Bild + Video + Hashtags prüfen
- [x] Lina-Integration abschließen: Öffentlicher API-Endpoint für Botpress
- [x] Full QA: Jede Seite testen, alle Fehler fixen
- [x] Partner-Freischaltung testen (Registrierung → Admin-Freigabe → Zugang)
- [x] Alte Test-Posts aufräumen

## Kritische Verbesserungen (28.03.2026)
- [x] Trend-Content klonen: Virale Posts aus Trend-Scanner direkt als Vorlage in Generator übernehmen
- [x] Trend-Content klonen: "Als Vorlage verwenden" Button bei jedem Trend-Ergebnis
- [x] Trend-Content klonen: Virale Hashtags und Hooks automatisch übernehmen
- [x] Dashboard-UI aufräumen: Sauberere, selbsterklärende Oberfläche
- [x] Dashboard-UI aufräumen: Bessere Card-Layouts und Spacing
- [x] Dashboard-UI aufräumen: Mobile-optimierte Ansicht verbessern
- [x] End-to-End UI Test: Post erstellen, Bild+Video in Freigabe prüfen, freigeben, Bibliothek kontrollieren

## Freigabe-Logik Umbau (28.03.2026)
- [x] Freigabe: Jeder Partner gibt seinen EIGENEN Content frei (nicht Admin für alle)
- [x] Freigabe: Admin (Mathias) gibt nur seinen eigenen Content frei
- [x] Freigabe: approve/reject/publish von adminProcedure auf owner-based protectedProcedure umbauen
- [x] Freigabe: ApprovalPage zeigt nur eigene Posts (Partner sieht nur seine, Admin sieht nur seine)
- [x] Freigabe: Tests aktualisieren
- [x] Alle Features von adminProcedure auf protectedProcedure umgestellt (Partner haben vollen Zugriff)
- [x] Nur Team-Management (Partner freischalten/sperren/Rollen) bleibt Admin-only
- [x] 195/195 Tests bestehen (15 Test-Dateien)

## Zugangsschutz - isApproved Gate (28.03.2026)
- [x] Backend: isApproved-Prüfung auf alle approvedProcedures (nicht-freigeschaltete User blockieren)
- [x] Frontend: Nicht-freigeschaltete User auf "Zugang ausstehend" Warte-Seite umleiten
- [x] Testen: 5 Access-Gate-Tests + 200/200 Tests bestehen (16 Test-Dateien)

## Blotato Setup-Anleitung für Partner (28.03.2026)
- [x] Onboarding-Seite: Komplette Blotato-Anleitung Schritt-für-Schritt (4 Schritte mit Links)
- [x] Blotato: Account erstellen + Kanäle verbinden Anleitung (8 Plattformen erklärt)
- [x] Blotato: API Key finden und kopieren Anleitung (mit Blotato Help Center Links)
- [x] Dashboard: Wo API Key einfügen (Einstellungen-Seite) klar erklärt
- [x] Hinweis für Partner ohne Blotato (manuell kopieren aus Bibliothek)
- [x] Zugang über Lina erklärt auf OnboardingPage
- [ ] Auch über Lina den Link zur Anleitung bereitstellen
