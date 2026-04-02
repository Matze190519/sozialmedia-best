# Lina REST API - Botpress Integration

**Base URL:** `https://sozialmedia.best/api/lina/`

Diese Dokumentation beschreibt alle REST-Endpoints die Lina (Botpress) aufrufen kann, um mit dem sozialmedia.best Content-System zu interagieren.

---

## WhatsApp-Menü → API-Zuordnung

| Lina Menüpunkt | API Endpoint | Methode | Beschreibung |
|---|---|---|---|
| **Content Hub öffnen** | `/api/lina/login-link` | POST | Generiert Magic Login-Link für Partner |
| **Fertiger Content abrufen** | `/api/lina/content` | GET | Zeigt freigegebene Posts |
| **Content freigeben** | `/api/lina/pending/:nr` + `/api/lina/self-approve` | GET + POST | Zeigt wartende Posts → Partner wählt → freigegeben |
| **Content nach Wunsch** | `/api/lina/login-link` | POST | Link zum Generator auf sozialmedia.best |
| **Einwände meistern** | Botpress intern | - | Einwandbehandlung aus Botpress Knowledge Base |
| **System-Hilfe & FAQ** | `/api/lina/status` | GET | System-Status prüfen |

---

## 1. Magic Login-Link generieren

**Endpoint:** `POST /api/lina/login-link`

Generiert einen einmaligen Login-Link für einen Partner. Der Partner klickt den Link und ist sofort eingeloggt auf sozialmedia.best - kein Passwort, kein E-Mail, kein Manus-Konto nötig.

**Request Body:**
```json
{
  "partnerNumber": "LR12345",
  "name": "Max Mustermann",
  "whatsappNumber": "+491234567890"
}
```

**Response:**
```json
{
  "success": true,
  "loginUrl": "https://sozialmedia.best/api/auth/magic/abc123def456",
  "expiresIn": "24h",
  "message": "Login-Link für Max Mustermann (LR12345) erstellt. 24h gültig."
}
```

**Botpress Flow:**
1. Partner tippt "Content Hub öffnen"
2. Lina ruft `/api/lina/login-link` auf mit der Partnernummer aus der Botpress-Variable
3. Lina sendet den `loginUrl` als klickbaren Link in WhatsApp
4. Partner klickt → sofort eingeloggt auf sozialmedia.best

---

## 2. Fertigen Content abrufen

**Endpoint:** `GET /api/lina/content`

**Query Parameter:**
- `limit` (optional, default: 5) - Anzahl Posts
- `platform` (optional) - Filter nach Plattform (z.B. "instagram")
- `pillar` (optional) - Filter nach Content-Pillar

**Response:**
```json
{
  "success": true,
  "count": 3,
  "posts": [
    {
      "id": 42,
      "text": "Dein Post-Text hier...",
      "type": "social_media_post",
      "platform": ["instagram", "facebook"],
      "imageUrl": "https://cdn.../image.jpg",
      "videoUrl": null,
      "topic": "LR Aloe Vera",
      "pillar": "Produkt",
      "createdAt": "2026-04-02T12:00:00Z"
    }
  ]
}
```

**Botpress Flow:**
1. Partner tippt "Fertiger Content abrufen"
2. Lina ruft `/api/lina/content?limit=3` auf
3. Lina zeigt die Posts als Carousel oder Liste in WhatsApp
4. Partner kann Text kopieren und Bild herunterladen

---

## 3. Wartende Posts anzeigen (für Freigabe)

**Endpoint:** `GET /api/lina/pending/:partnerNumber`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "posts": [
    {
      "id": 15,
      "topic": "LR Aloe Vera Drinking Gel",
      "preview": "Stell dir vor, du könntest deinen Körper jeden Morgen mit...",
      "type": "social_media_post",
      "platforms": ["instagram", "tiktok"],
      "createdAt": "2026-04-02T10:00:00Z"
    }
  ]
}
```

---

## 4. Content selbst freigeben

**Endpoint:** `POST /api/lina/self-approve`

**Request Body:**
```json
{
  "partnerNumber": "LR12345",
  "postId": 15
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post \"LR Aloe Vera Drinking Gel\" wurde freigegeben und ist bereit zum Posten!",
  "postId": 15
}
```

**Botpress Flow:**
1. Partner tippt "Content freigeben"
2. Lina ruft `/api/lina/pending/LR12345` auf
3. Lina zeigt wartende Posts als Auswahl-Optionen (KEINE Texteingabe!)
4. Partner wählt Post aus der Liste
5. Lina ruft `/api/lina/self-approve` auf
6. Lina bestätigt: "Dein Post wurde freigegeben!"

---

## 5. Benachrichtigungen abrufen

**Endpoint:** `POST /api/lina/notify`

**Request Body:**
```json
{
  "partnerNumber": "LR12345"
}
```

**Response:**
```json
{
  "success": true,
  "partnerName": "Max Mustermann",
  "count": 1,
  "notifications": [
    {
      "postId": 42,
      "status": "approved",
      "topic": "LR Aloe Vera",
      "preview": "Stell dir vor, du könntest...",
      "statusText": "Freigegeben! Bereit zum Posten.",
      "updatedAt": "2026-04-02T14:00:00Z"
    }
  ]
}
```

**Botpress Flow:**
- Lina ruft diesen Endpoint auf wenn ein Partner ihr schreibt
- Wenn Benachrichtigungen vorhanden → Lina informiert den Partner proaktiv

---

## 6. Partner-Stats

**Endpoint:** `GET /api/lina/partner-stats/:partnerNumber`

**Response:**
```json
{
  "success": true,
  "partner": {
    "name": "Max Mustermann",
    "partnerNumber": "LR12345",
    "lastLogin": "2026-04-02T12:00:00Z",
    "memberSince": "2026-03-15T10:00:00Z"
  },
  "stats": {
    "totalPosts": 25,
    "approved": 18,
    "pending": 3,
    "published": 12,
    "rejected": 2,
    "lastPostDate": "2026-04-01T15:00:00Z"
  }
}
```

---

## 7. Einladungs-Token erstellen

**Endpoint:** `POST /api/lina/invite`

**Request Body:**
```json
{
  "name": "Neuer Partner",
  "partnerNumber": "LR67890",
  "whatsappNumber": "+491234567890"
}
```

**Response:**
```json
{
  "success": true,
  "token": "abc123def456ghi789jkl012",
  "joinUrl": "https://sozialmedia.best/join/abc123def456ghi789jkl012",
  "expiresAt": "2026-04-09T12:00:00Z",
  "message": "Einladungs-Link für Neuer Partner erstellt."
}
```

---

## 8. System-Status

**Endpoint:** `GET /api/lina/status`

**Response:**
```json
{
  "success": true,
  "status": "online",
  "stats": {
    "totalPosts": 150,
    "pendingApproval": 12,
    "approved": 85,
    "scheduled": 23
  },
  "timestamp": "2026-04-02T12:00:00Z"
}
```

---

## 9. Bibliothek-Inhalte

**Endpoint:** `GET /api/lina/library`

**Query Parameter:**
- `limit` (optional, default: 10)
- `category` (optional) - Filter nach Kategorie

---

## 10. LR-Produkte

**Endpoint:** `GET /api/lina/products`

**Query Parameter:**
- `limit` (optional, default: 20)
- `category` (optional)
- `search` (optional) - Suchbegriff

---

## Wichtige Hinweise für Botpress-Konfiguration

1. **Keine Texteingabe nötig!** Alle Interaktionen über vordefinierte Optionen/Buttons
2. **Partnernummer** wird aus der Botpress-Variable `{{user.partnerNumber}}` gelesen
3. **Magic Links** sind 24h gültig, danach muss ein neuer generiert werden
4. **Benachrichtigungen** werden nur bei der täglichen Interaktion abgerufen (kein Push)
5. **Alle Endpoints** geben `{ success: boolean, ... }` zurück für einfache Fehlerbehandlung
