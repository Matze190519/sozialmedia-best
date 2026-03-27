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
