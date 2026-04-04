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

## Premium UI/UX Overhaul - Lichtjahre voraus (02.04.2026)
- [ ] Premium Dashboard: Animierte Statistik-Karten mit Glassmorphism-Effekt und Glow
- [ ] Animated Number Counter: Zahlen zählen beim Laden hoch (Count-Up Animation)
- [ ] Gradient Glow Borders: Subtile animierte Rahmen um wichtige Karten
- [ ] Micro-Interactions: Hover-Effekte, Pulse-Animationen, Smooth Transitions überall
- [ ] AI Content Score: KI-basierte Bewertung jedes Posts vor Veröffentlichung (Viral-Potenzial)
- [ ] Performance Prediction: KI sagt voraus wie gut ein Post performen wird
- [x] Activity Feed: Echtzeit-Aktivitäts-Stream (wer hat was erstellt/freigegeben)
- [ ] Verbesserte Login-Seite: Premium-Look mit animiertem Hintergrund
- [ ] Sidebar Upgrade: Aktive Seite mit Glow-Indikator und smooth Übergänge
- [ ] Dashboard Greeting: Tageszeit-basierte Begrüßung mit motivierendem Spruch

## MEGA-UPGRADE: AI Content Command Center (02.04.2026)
### Blotato Deep Integration - 9 Kanäle Auto-Publishing
- [ ] Blotato Account-Übersicht: Alle verbundenen Kanäle mit Status anzeigen
- [x] One-Click Multi-Publish: Content auf alle 9 Plattformen gleichzeitig posten
- [x] Plattform-Vorschau: Zeigt wie der Post auf jeder Plattform aussehen wird
- [ ] Blotato Visual Templates: Carousels, Quote Cards, Slideshows direkt erstellen
- [ ] Blotato Content Calendar Sync: Bidirektionale Kalender-Synchronisation
- [ ] Scheduling mit Smart Slots: Automatisch nächsten freien Slot finden
- [ ] Post-Status-Tracking: Live-Status jedes Posts auf jeder Plattform (polling)

### AI Content Factory - Wie von einer anderen Welt
- [ ] Content Wizard: Geführter 3-Schritt-Prozess (Thema → KI generiert → Vorschau → Publish)
- [ ] Multi-Format Generator: Ein Thema → 5 Formate (Post, Reel-Script, Story, Carousel, Thread)
- [ ] Content Remix: Bestehenden Post in andere Formate umwandeln
- [ ] Blotato Source Integration: URLs/YouTube/TikTok als Content-Quelle extrahieren
- [ ] Brand Voice Auto-Apply: Jeder generierte Text automatisch im LR Brand Voice
- [ ] Hashtag Intelligence: Trend-basierte + Nischen-Hashtags pro Plattform

### Team Workflow - Für dein LR Team über Lina
- [x] Team Activity Dashboard: Wer hat was erstellt, freigegeben, gepostet
- [x] Content Pipeline Visualisierung: Kanban-Board (Entwurf → Review → Freigabe → Gepostet)
- [x] Team Leaderboard: Wer postet am meisten, bester Content Score
- [ ] Benachrichtigungen: Push wenn Content freigegeben oder gepostet wurde

### Analytics Command Center
- [ ] Cross-Platform Analytics: Engagement-Daten von allen 9 Plattformen
- [ ] Best Performing Content: Top-Posts nach Engagement sortiert
- [ ] Posting-Heatmap: Wann wird am meisten gepostet, wann am besten
- [ ] Content-Mix Analyse: Welche Themen/Formate performen am besten

## OPTIMIERUNG: Placeholder-Seiten füllen & Team-Isolation
- [ ] Hashtag Engine: Echte KI-basierte Hashtag-Generierung mit Trend-Daten
- [ ] Analytics Dashboard: Echte Cross-Platform Stats statt Placeholder
- [ ] Creator Spy: Echte Wettbewerber-Analyse mit GoViralBitch
- [ ] Templates Library: Echte wiederverwendbare Content-Templates
- [ ] Team Management: Echte Partner-Übersicht mit Freigabe und Performance
- [ ] Per-User Dashboard Isolation: Jeder sieht nur seinen eigenen Content
- [ ] Per-User Blotato-Verbindung: Jeder verbindet seinen eigenen Blotato-Account
- [ ] Admin-Freigabe: Nur von Matze freigegebene Team-Mitglieder haben Zugang
- [ ] Content Calendar: Drag & Drop mit echten Daten
- [ ] Post Queue: Live-Status aller geplanten Posts mit Blotato-Status
- [x] Team Leaderboard: Gamification mit Punkte und Badges
- [x] AI Copilot: KI-Assistent direkt im Content-Editor

## MEGA-OPTIMIERUNG: Das geilste Content-System der Welt
- [x] Karussell-Generator: Instagram/LinkedIn Karussells mit KI erstellen
- [ ] Scroll-Stopping Visuals: Premium Bild-Templates die viral gehen
- [x] Bibliothek Upgrade: Killer Copy-Paste Hub mit Vorschau + One-Click Kopieren
- [x] Direct Post: Von der Seite direkt posten (für Partner ohne Blotato)
- [ ] Content-Qualität: Nur der beste Content - Lichtjahre voraus
- [ ] Partner gibt eigenen Content selbst frei (nicht Admin)
- [ ] Admin gibt nur Partner einmalig frei (Zugang zur Seite)
- [ ] Premium Black-Gold Design durchgängig
- [ ] Mobile-Optimierung aller Seiten

## KORREKTUR: Freigabe-Flow
- [ ] FIX: Jeder Partner gibt seinen EIGENEN Content selbst frei (nicht Admin)
- [ ] FIX: Admin gibt nur einmalig Partner frei (Zugang zur Seite)
- [ ] FIX: Bibliothek zeigt freigegebene Posts von ALLEN Partnern (gemeinsamer Pool)
- [ ] FIX: Dashboard zeigt nur eigenen Content pro Partner
- [x] Direct Post von der Seite (für Partner ohne Blotato)

## EINLADUNGS-TOKEN AUTH SYSTEM (02.04.2026)
- [x] DB-Tabelle: inviteTokens (token, partnerId, name, whatsappNumber, used, userId, createdAt, expiresAt)
- [ ] API-Endpunkt: POST /api/invite/create (für Lina - generiert Token-Link)
- [ ] API-Endpunkt: GET /api/invite/verify/:token (Token prüfen + User erstellen/einloggen)
- [x] Join-Seite: /join/:token (automatisch einloggen wenn Token gültig)
- [ ] Landing-Page für nicht-autorisierte Besucher ("Zugang nur über Lina")
- [x] Token einmalig verwendbar, an Partnernummer + WhatsApp gebunden
- [ ] Bestehenden Manus OAuth als Fallback für Admin (Matze) behalten
- [ ] Admin: Übersicht aller Nutzer (Name, Partnernr, WhatsApp, letzter Login, Content-Anzahl)
- [ ] Admin: Manuell Partner freischalten (Partnernummer + Name + WhatsApp eingeben)
- [ ] Admin: Partner sperren (ein Klick → sofort raus)
- [x] Admin: Token-Übersicht (generiert, genutzt, abgelaufen)

## Blueprint Features - Aus 50+ Links (02.04.2026)

### Content Factory
- [x] AI Copilot im Editor - KI-Assistent direkt beim Schreiben (Postiz-inspiriert)
- [x] Karussell-Generator - Instagram/LinkedIn Slides erstellen
- [x] Plattform-Vorschau - Phone-Mockups (Instagram/TikTok/LinkedIn Preview)

### Team & Gamification
- [x] Team Leaderboard - Wer postet am meisten, bester Content Score
- [x] Gamification - Punkte, Badges, Levels für Team-Motivation
- [x] Content Pipeline Kanban - Visuelles Board (Entwurf → Review → Freigabe → Gepostet)

### Analytics Upgrade
- [x] Cross-Platform Analytics erweitern - Engagement-Daten aggregiert
- [x] Best Performing Content - Top-Posts nach Engagement
- [x] Posting-Heatmap - Wann wird am meisten gepostet
- [x] Content-Mix Analyse - Welche Themen/Formate performen am besten

### Blotato Deep Integration
- [x] One-Click Multi-Publish Vorschau - Vor dem Posten sehen was passiert
- [ ] Post-Status-Tracking - Live-Status jedes Posts

### Premium UI/UX
- [x] Scroll-Stopping Micro-Interactions - Framer Motion überall
- [x] Premium Glassmorphism Cards
- [x] Skeleton Loading States überall
- [x] Empty States mit Illustrationen

## BUG-FIX: Load Failed auf Content Wizard (02.04.2026)
- [x] FIX: "Load failed" Fehler - GlowCard maskComposite entfernt, PlatformPreview vereinfacht
- [x] CHECK: Trend-Scanner ist in der Sidebar unter Recherche vorhanden

## MOBILE FIX: Responsiveness (02.04.2026)
- [x] FIX: Kanban Pipeline auf Mobile - horizontal scrollbar, größere Karten, Swipe-Gesten
- [x] FIX: Content Wizard "Load failed" auf Mobile - GlowCard + PlatformPreview gefixed
- [x] FIX: Alle neuen Seiten mobile-responsive (Leaderboard, Analytics+, Carousel, TeamActivity, InviteTokens, Home)

## Finale Runde: Bestes Social Media System (02.04.2026)
- [x] Post-Status-Tracking: Live-Status jedes Posts auf jeder Plattform (Blotato Polling)
- [x] Push-Benachrichtigungen: Auto-Notify bei Freigabe, Posting, Ablehnung (notifyOwner)
- [x] Lina API-Endpoint: Öffentlicher REST-Endpoint für Botpress Content Hub (11 Endpoints)
- [x] Partner-Selbstfreigabe: POST /api/lina/self-approve
- [x] Admin-Nutzerübersicht: AdminUsersPage mit Stats pro Partner

## Magic Link Auth + WhatsApp Notifications (02.04.2026)
- [x] Magic Link Auth: Partner bekommt Login-Link von Lina → klickt → sofort eingeloggt
- [x] Kein Manus OAuth für Partner nötig - nur Token-basierter Login
- [x] Lina API: POST /api/lina/login-link - generiert persönlichen Login-Link für Partner
- [x] Login-Seite: JoinPage mit Auto-Login nach 2.5s
- [x] Session-Cookie setzen nach Token-Login (JWT via sdk.createSessionToken)
- [x] Lina WhatsApp Notifications: POST /api/lina/notify für Content-Status-Updates
- [x] Admin (Matze) behält Manus OAuth als Login-Methode

## Botpress/Lina Integration (02.04.2026)
- [ ] Botpress: Startsets im Menü ändern
- [ ] Botpress: Lina Menü-Flows mit sozialmedia.best API-Endpoints verbinden
- [ ] Botpress: Prüfen ob alle Flows korrekt funktionieren
- [ ] Botpress: Content Hub öffnen → Magic Login-Link generieren
- [ ] Botpress: Fertiger Content abrufen → /api/lina/content
- [ ] Botpress: Content freigeben → /api/lina/pending + /api/lina/self-approve

## Fehlende Lina REST-API Endpoints (04.04.2026)
- [x] POST /api/lina/generate - Content über WhatsApp generieren lassen
- [x] GET /api/lina/templates - Content-Vorlagen über WhatsApp abrufen
- [x] POST /api/lina/hashtags - Hashtags über WhatsApp generieren
- [x] POST /api/lina/schedule - Posts über WhatsApp planen
- [x] GET /api/lina/weekly-plan - Wochenplan über WhatsApp abrufen
- [x] POST /api/lina/objection - Einwandbehandlung über WhatsApp
- [x] GET /api/lina/health - Health-Check Endpoint
- [x] Alle 19 Lina-Endpoints testen und deployen (17/17 Tests bestanden)

## System-Optimierung (04.04.2026)
- [ ] fal.ai Video/Bild-Alternativen recherchieren
- [x] Claude-Prompt für Botpress WhatsApp-Integration schreiben (CLAUDE_BOTPRESS_PROMPT.md auf GitHub gepusht)
- [x] Blotato Posting verifizieren und fixen (autoPublish=true als Standard + self-approve auto-publishes)

## Auto-Bild/Video bei Content-Erstellung (04.04.2026)
- [x] Content-Generierung automatisch mit Bildgenerierung verbinden
- [x] /api/lina/generate soll automatisch Bild generieren
- [ ] Content Wizard soll automatisch Bild generieren
- [ ] Freigabe-Center: Posts ohne Medien nicht mehr möglich
- [ ] Beste KI-Tools für Video/Bild 2026 recherchieren und vergleichen

## Brevo Benachrichtigungen (04.04.2026)
- [x] Benachrichtigungen von Manus auf Brevo umgestellt (alle 5 notifyOwner Stellen ersetzt)
- [x] Brevo Test-Mail erfolgreich gesendet (messageId bestätigt)
- [x] Sender: LR Lifestyle Team <info@lr-lifestyle.info>
- [x] Empfänger: jedermannhandy@googlemail.com

## SuperProfile Anleitung einbauen (04.04.2026)
- [x] SuperProfile-Anleitung als eigene Seite in sozialmedia.best einbauen
- [x] Navigation/Sidebar-Link "Instagram Growth" hinzufuegen
- [x] Claude-Prompt fuer Lina/Botpress aktualisieren (neuer Menuepunkt)

## Budget-System und Kosten-Kontrolle (04.04.2026)
- [x] DB-Schema: generationUsage Tabelle (userId, type, month, count, cost)
- [x] DB-Schema: globalBudget Tabelle (month, totalSpent, limit)
- [x] Partner-Limits: 20 Bilder/Monat, 5 Videos/Monat pro Partner
- [x] Globaler Monatsdeckel: $200
- [x] Videos MIT Audio/Musik (Kling 3.0 Pro fuer Partner, Veo 3.1 fuer Admin)
- [x] Admin hat kein Budget-Limit + Top-Modell Veo 3.1
- [x] Alles generierte automatisch in Bibliothek speichern (war schon eingebaut)
- [x] Limit-Check in alle Generierungs-Endpoints einbauen (image + video)
- [x] Admin-Dashboard: Kosten-Uebersicht pro Monat anzeigen

## Bibliothek-Filter (04.04.2026)
- [x] Nur vollstaendige Posts in Bibliothek (Text + Bild/Video + Hashtags)
- [x] Reiner Text-Content wird NICHT in Bibliothek gespeichert
- [x] Bestehende Text-only Eintraege aus Bibliothek entfernen (2 geloescht, 14 mit Bild/Video bleiben)
- [x] Partner-Limits auf 40 Bilder / 10 Videos erhoeht (Testphase)

## Bibliothek Cleanup + Admin Kosten + Claude Prompt (04.04.2026)
- [x] Text-only Eintraege aus Bibliothek loeschen (nur Posts mit Bild/Video behalten)
- [x] Admin Kosten-Uebersicht Seite (Monatskosten, Generierungen pro Partner, Budget-Verbrauch)
- [x] Claude-Prompt (CLAUDE_BOTPRESS_KORREKTUR.md) mit allen Aenderungen aktualisieren
- [ ] Alles auf GitHub speichern (Sozial Repo)
