import { Rocket, ArrowLeft } from "lucide-react";

/**
 * Impressum — Pflichtseite für Werbeschaltung (DE, §5 TMG / §18 MStV).
 *
 * WICHTIG (Mathias): Platzhalter in eckigen Klammern VOR dem Ad-Start
 * mit echten Daten ersetzen. Ohne vollständiges Impressum drohen Abmahnungen.
 */
export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background bg-grid text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
        </a>

        <div className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold gradient-text-gold" style={{ fontFamily: "var(--font-heading)" }}>
            Impressum
          </h1>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
            <p className="text-muted-foreground">
              Mathias Vinzing<br />
              [Straße und Hausnummer]<br />
              [PLZ und Ort]<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Kontakt</h2>
            <p className="text-muted-foreground">
              Telefon: [Telefonnummer]<br />
              E-Mail: info@sozialmedia.best
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Tätigkeit</h2>
            <p className="text-muted-foreground">
              Selbstständiger Vertriebspartner der LR Health &amp; Beauty Systems GmbH.
              Diese Website ist eine unabhängige Team-Plattform und kein offizielles
              Angebot der LR Health &amp; Beauty Systems GmbH.
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Umsatzsteuer-ID</h2>
            <p className="text-muted-foreground">
              Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
              [USt-IdNr. eintragen oder Abschnitt entfernen, falls Kleinunternehmer]
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p className="text-muted-foreground">
              Mathias Vinzing<br />
              [Anschrift wie oben]
            </p>
          </section>

          <section>
            <h2 className="font-semibold mb-2">EU-Streitschlichtung</h2>
            <p className="text-muted-foreground">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
