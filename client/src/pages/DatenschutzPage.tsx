import { Rocket, ArrowLeft } from "lucide-react";

/**
 * Datenschutzerklärung — Pflichtseite für Werbeschaltung (DSGVO).
 *
 * WICHTIG (Mathias): Platzhalter prüfen und ggf. mit einem
 * Datenschutz-Generator (z.B. eRecht24) abgleichen, bevor Ads laufen.
 */
export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background bg-grid text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
        </a>

        <div className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold gradient-text-gold" style={{ fontFamily: "var(--font-heading)" }}>
            Datenschutzerklärung
          </h1>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold mb-2">1. Verantwortlicher</h2>
            <p className="text-muted-foreground">
              Mathias Vinzing<br />
              [Anschrift]<br />
              E-Mail: info@sozialmedia.best
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">2. Erhobene Daten</h2>
            <p className="text-muted-foreground">
              Bei Registrierung und Nutzung der Plattform verarbeiten wir: Name, Partnernummer,
              WhatsApp-Nummer sowie die von dir erstellten Inhalte (Posts, Bilder, Videos).
              Server-Logs (IP-Adresse, Zeitstempel, aufgerufene Seiten) werden zur Absicherung
              des Betriebs vorübergehend gespeichert.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">3. Zweck und Rechtsgrundlage</h2>
            <p className="text-muted-foreground">
              Die Verarbeitung erfolgt zur Bereitstellung der Team-Plattform (Art. 6 Abs. 1 lit. b DSGVO)
              sowie auf Grundlage berechtigter Interessen an einem sicheren Betrieb
              (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">4. Eingesetzte Dienstleister</h2>
            <p className="text-muted-foreground">
              Zur Bereitstellung der Funktionen setzen wir technische Dienstleister ein,
              u.a. für Hosting, KI-Generierung von Texten/Bildern/Videos (z.B. fal.ai, HeyGen),
              Social-Media-Veröffentlichung (Blotato) und Chat-Kommunikation (Botpress/WhatsApp).
              Mit den Dienstleistern bestehen, soweit erforderlich, Auftragsverarbeitungsverträge.
              [Liste vor Ad-Start prüfen und vervollständigen.]
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">5. Speicherdauer</h2>
            <p className="text-muted-foreground">
              Daten werden gespeichert, solange dein Zugang besteht. Nach Löschung deines
              Zugangs werden personenbezogene Daten innerhalb von [Frist, z.B. 30 Tagen] entfernt,
              soweit keine gesetzlichen Aufbewahrungspflichten bestehen.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">6. Deine Rechte</h2>
            <p className="text-muted-foreground">
              Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
              Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO) sowie das
              Recht auf Beschwerde bei einer Aufsichtsbehörde. Wende dich dazu an:
              info@sozialmedia.best
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">7. Cookies und Analyse</h2>
            <p className="text-muted-foreground">
              Die Plattform verwendet technisch notwendige Cookies für den Login (Session).
              [Falls Analyse-Tools wie Umami/Meta Pixel aktiv sind: hier ergänzen und ggf.
              Consent-Banner einbauen, bevor Ads mit Tracking laufen.]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
