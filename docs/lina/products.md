# Produktbilder

> **Route:** `/products` | **Frontend:** `ProductsPage.tsx` | **Status:** ✅ Aktiv

## 1. Kurzbeschreibung
Offizielle LR-Produktbibliothek mit 226 Produkten und Originalfotos. Kategorien: Aloe Vera, Körperpflege, ZEITGARD, Parfum, Nahrungsergänzung, Haarpflege. Beim Post-Erstellen als Vorlage auswählbar.
**Beleg:** Sidebar `"Offizielle LR Produktfotos"` — `DashboardLayout.tsx:85`

## 4. User-Flow
1. Kategorie-Filter oder Suchfeld nutzen
2. Produkt anklicken → Detail-Dialog
3. **„Kopieren/Download"** (`Zeile 313/326`) — Bild-URL kopieren oder Bild herunterladen
4. Admin: **„Neu importieren"** (`Zeile 110`)

## 11. Technische Referenz
- **tRPC:** `products.categories` (45), `products.count` (46), `products.list` (49), `products.import` (56)
