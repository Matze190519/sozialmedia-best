# Changelog - LINA PRO Bot

## 08.04.2026 - MASTERPLAN: Botpress auf 4 Flows reduziert + Cleanup

### Hauptmenue Reduzierung (gemaess MASTERPLAN_CONTENT_MASCHINE.md)
- Hauptmenue von 11 auf genau 4 Buttons reduziert
- Alle komplexen Features laufen ab jetzt ueber das Dashboard (sozialmedia.best)
- KEINE Flows geloescht — alle bestehenden Flows bleiben erhalten

### Die 4 Buttons
1. Bibliothek -> bestehender Flow Bibliothek (nd-b91f4df201)
2. Einwandbehandlung -> bestehender Flow Einwaende_meistern (nd-41b21d32d2)
3. Schnelle Hilfe -> bestehender Flow Hilfe_FAQ (nd-9b77bd4b82)
4. Mein Dashboard -> NEUER Node MeinDashboard (nd-dashboard-magic01)

### Neuer Node: MeinDashboard
- Execute Code: Liest WhatsApp-Telefonnummer aus event.tags
- Generiert Magic-Login-Link: sozialmedia.best/magic?phone={encodedPhone}
- Text Node: Link + Feature-Liste
- Capture: Zurueck zum Menue

### 9 Duplicate/Test-Flows geloescht
- Partner - Bild erstellen - Copy1
- Partner - Video erstellen - Copy1
- Partner - Bild erstellen - Copy2
- Partner - Bild erstellen - Manus Test
- Partner - Video erstellen - Maunus Test
- Admin - Test Flow
- New workflow1, New workflow2, New workflow3
- Bot von 74 auf 65 Flows reduziert

### Verifizierte Flows
- Bibliothek: 12 Instructions, Image/Video Cards korrekt (isExpression=true, dynamicValue=workflow.item1_imageUrl)
- Einwandbehandlung: 4 Instructions, textbasiert, funktional
- Schnelle Hilfe: 3 Instructions, FAQ-basiert, funktional
- Partner - Bild/Video erstellen: NICHT angefasst

### Status
- Gespeichert (PUT 200) und Published (POST 200)
- WhatsApp-Test durch Matze erforderlich

---

## 08.04.2026 - Bibliothek & Content freigeben Rewrite
- Bibliothek: Execute Code komplett neu (API items wrapper, Image/Video Cards)
- Content freigeben: Execute Code neu (content?status=pending, 4 Freigabe-Buttons)
- ApproveContent Node neu (POST /api/lina/approve)
- Schnellpost: Image/Video Cards hinzugefuegt
