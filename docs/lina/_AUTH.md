# Login & Zugang

## So funktioniert der Login

1. Partner meldet sich bei Lina (WhatsApp)
2. Lina fragt nach Name und Partnernummer
3. Lina prüft und schickt einen **Magic-Login-Link**: `https://sozialmedia.best/join?token=XXXXXXXX`
4. Partner klickt auf den Link → **sofort eingeloggt** (kein Passwort)
5. Partner sieht das Dashboard mit Willkommens-Overlay

## Technisch

- Link enthält einmaligen JWT-Token (jose-Library, 24h gültig)
- Nach Klick: Account ist sofort freigeschaltet (`isApproved = true`)
- User-Info in `localStorage["manus-runtime-user-info"]`

## Häufige Probleme

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Link funktioniert nicht | Abgelaufen (>24h) | Lina auf WhatsApp → neuer Link |
| „Zugang ausstehend" | Account noch nicht freigeschaltet | Lina auf WhatsApp → sofortige Freischaltung |
| Link verloren | Nicht gespeichert | Lina auf WhatsApp → neuer Magic-Link |

## Was sieht ein nicht-freigeschalteter Partner?

Seite mit „Zugang ausstehend – Dein Teamleiter wird dich in Kürze freischalten." Plus „Seite neu laden" Button.

## Was sieht ein nicht-eingeloggter Besucher?

Öffentliche Landing Page mit Beschreibung aller Tools und Hinweis „Dein Zugang kommt automatisch von Lina". Kein Login-Formular.

## Rollen

| Rolle | Kann |
|-------|------|
| **Partner (User)** | Eigene Posts erstellen, freigeben, Bibliothek nutzen, Analytics sehen |
| **Admin (Mathias)** | Alles + Team verwalten, Partner freischalten/sperren, alle Posts sehen |
