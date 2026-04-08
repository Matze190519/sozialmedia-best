/**
 * Smart Compliance Shield - MLM-spezifische Rechtskonformitätsprüfung
 * 
 * Prüft Content auf:
 * 1. Heilversprechen (HWG - Heilmittelwerbegesetz)
 * 2. Einkommensversprechen (UWG - Gesetz gegen unlauteren Wettbewerb)
 * 3. Impressumspflicht (TMG/DDG)
 * 4. MLM-spezifische Compliance (IHK-Richtlinien)
 * 5. Markenrecht (LR Health & Beauty Markenregeln)
 * 6. Datenschutz (DSGVO Hinweise)
 * 7. Wettbewerbsrecht (Vergleichende Werbung)
 */

export interface ComplianceCheck {
  category: string;
  severity: "critical" | "warning" | "info" | "pass";
  rule: string;
  message: string;
  suggestion?: string;
  legalReference?: string;
}

export interface ComplianceResult {
  passed: boolean;
  score: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  checks: ComplianceCheck[];
  summary: string;
  autoFixSuggestions: string[];
}

// ═══════════════════════════════════════════════════════════════
// HEILVERSPRECHEN-DETEKTOR (HWG §3, §11)
// ═══════════════════════════════════════════════════════════════

const HEALTH_CLAIM_PATTERNS = [
  // Direkte Heilversprechen
  { pattern: /heilt?\b/i, rule: "HWG §3 - Keine Heilversprechen", fix: "Ersetze durch 'unterstützt' oder 'kann beitragen zu'" },
  { pattern: /kur(iert|en)\b/i, rule: "HWG §3 - Keine Heilversprechen", fix: "Ersetze durch 'pflegt' oder 'unterstützt'" },
  { pattern: /beseitigt?\s+(Krankheit|Schmerz|Leiden)/i, rule: "HWG §3", fix: "Formuliere um: 'kann zum Wohlbefinden beitragen'" },
  { pattern: /garantiert\s+(gesund|Heilung|Wirkung)/i, rule: "HWG §3 - Keine Garantien", fix: "Entferne 'garantiert' - keine Wirkungsgarantien erlaubt" },
  { pattern: /100%\s*(wirksam|Wirkung|Erfolg|Heilung)/i, rule: "HWG §3", fix: "Keine absoluten Wirkungsaussagen" },
  
  // Indirekte Heilversprechen
  { pattern: /Wundermittel/i, rule: "HWG §3 - Übertriebene Wirkungsaussagen", fix: "Entferne 'Wundermittel'" },
  { pattern: /Allheilmittel/i, rule: "HWG §3", fix: "Entferne 'Allheilmittel'" },
  { pattern: /nie\s*wieder\s*(krank|Schmerz)/i, rule: "HWG §3", fix: "Keine absoluten Gesundheitsversprechen" },
  { pattern: /gegen\s+(Krebs|Diabetes|Depression|Alzheimer)/i, rule: "HWG §12 - Schwere Krankheiten", fix: "SOFORT ENTFERNEN - Werbung mit schweren Krankheiten verboten!" },
  { pattern: /Anti[-\s]?Aging\s*(Wunder|Garantie|sicher)/i, rule: "HWG §3", fix: "Nur 'kann das Hautbild unterstützen'" },
  
  // Vorher-Nachher mit Gesundheitsbezug
  { pattern: /vorher.*nachher.*(Krankheit|Heilung|gesund)/i, rule: "HWG §11 Abs.1 Nr.5", fix: "Vorher-Nachher nur für kosmetische Ergebnisse, nicht für Gesundheit" },
  
  // Wissenschaftliche Falschaussagen
  { pattern: /klinisch\s*bewiesen/i, rule: "HWG §3 - Nur mit Studiennachweis", fix: "Nur verwenden wenn Studie vorliegt, sonst 'Fresenius-geprüft'" },
  { pattern: /wissenschaftlich\s*bewiesen/i, rule: "HWG §3", fix: "Nur mit konkretem Studiennachweis verwenden" },
  { pattern: /Ärzte\s*empfehlen/i, rule: "HWG §11 Abs.1 Nr.2", fix: "Keine pauschalen Arzt-Empfehlungen" },
];

// ═══════════════════════════════════════════════════════════════
// EINKOMMENSVERSPRECHEN-DETEKTOR (UWG §5, §5a)
// ═══════════════════════════════════════════════════════════════

const INCOME_CLAIM_PATTERNS = [
  // Konkrete Geldbeträge
  { pattern: /\d+[\.,]?\d*\s*€\s*(pro|im|monatlich|täglich|wöchentlich)/i, rule: "UWG §5 - Keine konkreten Einkommensversprechen", fix: "Entferne konkrete Geldbeträge" },
  { pattern: /\d+[\.,]?\d*\s*Euro\s*(pro|im|monatlich|verdien)/i, rule: "UWG §5", fix: "Keine konkreten Verdienstangaben" },
  { pattern: /verdien(st|en|t)\s*\d/i, rule: "UWG §5", fix: "Keine konkreten Verdienstangaben in Werbung" },
  
  // Einkommensgarantien
  { pattern: /garantiert(es)?\s*(Einkommen|Verdienst|Geld|Gehalt)/i, rule: "UWG §5 - Keine Einkommensgarantien", fix: "Entferne 'garantiert' bei Einkommensaussagen" },
  { pattern: /sicher(es)?\s*(Einkommen|Nebeneinkommen|Verdienst)/i, rule: "UWG §5", fix: "Ersetze durch 'Möglichkeit zum Nebeneinkommen'" },
  { pattern: /reich\s*werden/i, rule: "UWG §5 - Übertriebene Versprechen", fix: "Ersetze durch 'finanzielle Ziele erreichen'" },
  { pattern: /schnell(es)?\s*Geld/i, rule: "UWG §5", fix: "Kein 'schnelles Geld' versprechen" },
  { pattern: /passives?\s*Einkommen\s*(garantiert|sicher|ohne\s*Arbeit)/i, rule: "UWG §5", fix: "Passives Einkommen nur mit Disclaimer" },
  
  // Lifestyle-Versprechen als Einkommensversprechen
  { pattern: /jeder\s*kann\s*(reich|Millionär|finanziell\s*frei)/i, rule: "UWG §5", fix: "Nicht jeder kann - individuelle Ergebnisse variieren" },
  { pattern: /ohne\s*(Risiko|Investition|Arbeit)\s*(verdien|Geld|Einkommen)/i, rule: "UWG §5a - Irreführung durch Unterlassung", fix: "Ehrlich über Aufwand und Risiko sein" },
  { pattern: /Einstieg.*kostet.*nur/i, rule: "UWG §5a", fix: "Keine Preise in Social Media Posts" },
];

// ═══════════════════════════════════════════════════════════════
// MLM-SPEZIFISCHE COMPLIANCE (IHK + DSSV)
// ═══════════════════════════════════════════════════════════════

const MLM_COMPLIANCE_PATTERNS = [
  // Pyramidensystem-Nähe
  { pattern: /Schneeballsystem/i, rule: "MLM-Compliance - Begriffsvermeidung", fix: "SOFORT ENTFERNEN" },
  { pattern: /Pyramidensystem/i, rule: "MLM-Compliance", fix: "SOFORT ENTFERNEN" },
  { pattern: /MLM[-\s]?Scam/i, rule: "MLM-Compliance", fix: "SOFORT ENTFERNEN" },
  { pattern: /Ponzi/i, rule: "MLM-Compliance", fix: "SOFORT ENTFERNEN" },
  
  // Rekrutierungs-Fokus statt Produkt-Fokus
  { pattern: /nur\s*(rekrutier|anwerb|Leute\s*bring)/i, rule: "IHK MLM-Richtlinie - Produktfokus", fix: "Content muss Produkte in den Vordergrund stellen, nicht Rekrutierung" },
  { pattern: /Downline\s*(aufbau|verdien)/i, rule: "IHK MLM-Richtlinie", fix: "Vermeide MLM-Jargon, sprich von 'Team aufbauen'" },
  { pattern: /Upline/i, rule: "IHK MLM-Richtlinie", fix: "Vermeide MLM-Jargon, sprich von 'Mentor' oder 'Team-Leader'" },
  
  // Falsche Zertifizierungen (LR-spezifisch)
  { pattern: /TÜV[-\s]?(geprüft|zertifiziert|Siegel)/i, rule: "LR Markenrecht - Falsche Zertifizierung", fix: "LR ist NICHT TÜV-geprüft! Nur 'Fresenius-geprüft' und 'Dermatest-zertifiziert'" },
  { pattern: /Stiftung\s*Warentest.*(empf|Siegel|geprüft)/i, rule: "LR Markenrecht", fix: "Nur offizielle LR-Zertifizierungen verwenden" },
  
  // Druck-Taktiken
  { pattern: /letzte\s*Chance/i, rule: "UWG §5 - Künstliche Verknappung", fix: "Keine künstliche Dringlichkeit erzeugen" },
  { pattern: /nur\s*noch\s*\d+\s*(Plätze|Stellen|Slots)/i, rule: "UWG §5", fix: "Keine künstliche Verknappung" },
  { pattern: /jetzt\s*oder\s*nie/i, rule: "UWG §5", fix: "Keine Drucktaktiken" },
];

// ═══════════════════════════════════════════════════════════════
// WETTBEWERBSRECHT (UWG §6 - Vergleichende Werbung)
// ═══════════════════════════════════════════════════════════════

const COMPETITION_PATTERNS = [
  { pattern: /besser\s*als\s*(Herbalife|Amway|Forever\s*Living|Juice\s*Plus|PM[-\s]?International)/i, rule: "UWG §6 - Vergleichende Werbung", fix: "Keine direkten Wettbewerber-Vergleiche" },
  { pattern: /(Herbalife|Amway|Forever\s*Living|Juice\s*Plus)\s*(schlecht|Betrug|Scam)/i, rule: "UWG §6 - Herabsetzung", fix: "Keine Herabsetzung von Wettbewerbern" },
  { pattern: /einzige[sr]?\s*(Firma|Unternehmen|Anbieter)/i, rule: "UWG §5 - Alleinstellungsbehauptung", fix: "Alleinstellungsbehauptungen nur mit Nachweis" },
];

// ═══════════════════════════════════════════════════════════════
// DATENSCHUTZ-CHECK (DSGVO)
// ═══════════════════════════════════════════════════════════════

const PRIVACY_PATTERNS = [
  { pattern: /Telefonnummer\s*(hier|unten|in\s*die\s*Kommentare)/i, rule: "DSGVO Art.6 - Personenbezogene Daten", fix: "Keine öffentliche Abfrage von Telefonnummern" },
  { pattern: /E[-\s]?Mail\s*(hier|unten|in\s*die\s*Kommentare)/i, rule: "DSGVO Art.6", fix: "Keine öffentliche Abfrage von E-Mail-Adressen" },
  { pattern: /Adresse\s*(hier|schreib|kommentier)/i, rule: "DSGVO Art.6", fix: "Keine öffentliche Abfrage von Adressen" },
];

// ═══════════════════════════════════════════════════════════════
// HAUPTFUNKTION: runComplianceCheck
// ═══════════════════════════════════════════════════════════════

export function runComplianceCheck(content: string, platform: string): ComplianceResult {
  const checks: ComplianceCheck[] = [];
  let score = 100;
  const autoFixSuggestions: string[] = [];

  // 1. Heilversprechen prüfen
  for (const pattern of HEALTH_CLAIM_PATTERNS) {
    const match = content.match(pattern.pattern);
    if (match) {
      const isCritical = pattern.rule.includes("§12") || pattern.rule.includes("Schwere Krankheiten");
      checks.push({
        category: "Heilversprechen",
        severity: isCritical ? "critical" : "warning",
        rule: pattern.rule,
        message: `Gefunden: "${match[0]}"`,
        suggestion: pattern.fix,
        legalReference: "Heilmittelwerbegesetz (HWG)",
      });
      score -= isCritical ? 30 : 15;
      autoFixSuggestions.push(pattern.fix);
    }
  }
  if (!checks.some(c => c.category === "Heilversprechen")) {
    checks.push({ category: "Heilversprechen", severity: "pass", rule: "HWG §3", message: "Keine Heilversprechen erkannt" });
  }

  // 2. Einkommensversprechen prüfen
  for (const pattern of INCOME_CLAIM_PATTERNS) {
    const match = content.match(pattern.pattern);
    if (match) {
      checks.push({
        category: "Einkommensversprechen",
        severity: "warning",
        rule: pattern.rule,
        message: `Gefunden: "${match[0]}"`,
        suggestion: pattern.fix,
        legalReference: "Gesetz gegen unlauteren Wettbewerb (UWG)",
      });
      score -= 15;
      autoFixSuggestions.push(pattern.fix);
    }
  }
  if (!checks.some(c => c.category === "Einkommensversprechen")) {
    checks.push({ category: "Einkommensversprechen", severity: "pass", rule: "UWG §5", message: "Keine problematischen Einkommensaussagen" });
  }

  // 3. MLM-Compliance prüfen
  for (const pattern of MLM_COMPLIANCE_PATTERNS) {
    const match = content.match(pattern.pattern);
    if (match) {
      const isCritical = pattern.fix === "SOFORT ENTFERNEN";
      checks.push({
        category: "MLM-Compliance",
        severity: isCritical ? "critical" : "warning",
        rule: pattern.rule,
        message: `Gefunden: "${match[0]}"`,
        suggestion: pattern.fix,
        legalReference: "IHK MLM-Richtlinien / LR Markenrecht",
      });
      score -= isCritical ? 25 : 10;
      autoFixSuggestions.push(pattern.fix);
    }
  }
  if (!checks.some(c => c.category === "MLM-Compliance")) {
    checks.push({ category: "MLM-Compliance", severity: "pass", rule: "IHK MLM-Richtlinie", message: "MLM-Compliance OK" });
  }

  // 4. Wettbewerbsrecht prüfen
  for (const pattern of COMPETITION_PATTERNS) {
    const match = content.match(pattern.pattern);
    if (match) {
      checks.push({
        category: "Wettbewerbsrecht",
        severity: "warning",
        rule: pattern.rule,
        message: `Gefunden: "${match[0]}"`,
        suggestion: pattern.fix,
        legalReference: "UWG §6 - Vergleichende Werbung",
      });
      score -= 15;
      autoFixSuggestions.push(pattern.fix);
    }
  }
  if (!checks.some(c => c.category === "Wettbewerbsrecht")) {
    checks.push({ category: "Wettbewerbsrecht", severity: "pass", rule: "UWG §6", message: "Keine problematischen Wettbewerber-Vergleiche" });
  }

  // 5. Datenschutz prüfen
  for (const pattern of PRIVACY_PATTERNS) {
    const match = content.match(pattern.pattern);
    if (match) {
      checks.push({
        category: "Datenschutz",
        severity: "warning",
        rule: pattern.rule,
        message: `Gefunden: "${match[0]}"`,
        suggestion: pattern.fix,
        legalReference: "DSGVO Art.6",
      });
      score -= 10;
      autoFixSuggestions.push(pattern.fix);
    }
  }
  if (!checks.some(c => c.category === "Datenschutz")) {
    checks.push({ category: "Datenschutz", severity: "pass", rule: "DSGVO", message: "Keine Datenschutz-Probleme erkannt" });
  }

  // 6. Preise-Check (LR-spezifisch)
  const pricePatterns = [/\d+\s*€/, /\d+\s*Euro/, /\d+\s*EUR/, /Einstieg.*\d/, /nur.*\d+.*€/i, /ab.*\d+.*€/i, /kostet.*\d/i];
  const hasPrice = pricePatterns.some(p => p.test(content));
  if (hasPrice) {
    checks.push({
      category: "Preisangaben",
      severity: "critical",
      rule: "LR Markenrichtlinie - Keine Preise in Social Media",
      message: "Preisangaben in Social Media Posts sind bei LR verboten",
      suggestion: "Entferne alle Preisangaben. Preise ändern sich und wirken unseriös.",
      legalReference: "LR Partner-Richtlinien",
    });
    score -= 25;
    autoFixSuggestions.push("Alle Preisangaben entfernen");
  } else {
    checks.push({ category: "Preisangaben", severity: "pass", rule: "LR Richtlinie", message: "Keine Preise im Text" });
  }

  // 7. Kennzeichnungspflicht (TMG/DDG)
  if (platform === "instagram" || platform === "tiktok" || platform === "youtube") {
    const hasAdMarker = /\b(Werbung|Anzeige|#ad|#werbung|#anzeige|Bezahlte\s*Partnerschaft)\b/i.test(content);
    const looksLikeAd = /\b(Link\s*in\s*Bio|Rabattcode|Gutschein|Affiliate|Provision)\b/i.test(content);
    if (looksLikeAd && !hasAdMarker) {
      checks.push({
        category: "Kennzeichnungspflicht",
        severity: "warning",
        rule: "TMG §6 / DDG §22 - Werbekennzeichnung",
        message: "Content enthält werbliche Elemente ohne Kennzeichnung",
        suggestion: "Füge '#Werbung' oder 'Bezahlte Partnerschaft' hinzu wenn es sich um Werbung handelt",
        legalReference: "Telemediengesetz §6 / Digitale-Dienste-Gesetz §22",
      });
      score -= 10;
      autoFixSuggestions.push("Werbekennzeichnung hinzufügen wenn zutreffend");
    } else {
      checks.push({ category: "Kennzeichnungspflicht", severity: "pass", rule: "TMG §6", message: "Kennzeichnung OK oder nicht erforderlich" });
    }
  }

  // Score normalisieren
  score = Math.max(0, Math.min(100, score));

  // Risk Level bestimmen
  const hasCritical = checks.some(c => c.severity === "critical");
  const warningCount = checks.filter(c => c.severity === "warning").length;
  const riskLevel: ComplianceResult["riskLevel"] = hasCritical ? "critical" : warningCount >= 3 ? "high" : warningCount >= 1 ? "medium" : "low";

  // Summary generieren
  const criticalCount = checks.filter(c => c.severity === "critical").length;
  const passCount = checks.filter(c => c.severity === "pass").length;
  const totalChecks = checks.filter(c => c.severity !== "pass").length;

  let summary: string;
  if (riskLevel === "critical") {
    summary = `KRITISCH: ${criticalCount} schwerwiegende Verstöße gefunden. Content sollte NICHT veröffentlicht werden ohne Korrektur.`;
  } else if (riskLevel === "high") {
    summary = `HOHES RISIKO: ${warningCount} Warnungen gefunden. Content vor Veröffentlichung überarbeiten.`;
  } else if (riskLevel === "medium") {
    summary = `MITTLERES RISIKO: ${warningCount} Warnung(en). Empfehlung: Vor Veröffentlichung prüfen.`;
  } else {
    summary = `KONFORM: Alle ${passCount} Prüfungen bestanden. Content kann veröffentlicht werden.`;
  }

  return {
    passed: riskLevel === "low",
    score,
    riskLevel,
    checks,
    summary,
    autoFixSuggestions: Array.from(new Set(autoFixSuggestions)),
  };
}

// ═══════════════════════════════════════════════════════════════
// KI-BASIERTE DEEP COMPLIANCE (für komplexe Fälle)
// ═══════════════════════════════════════════════════════════════

export async function runDeepComplianceCheck(content: string, platform: string): Promise<{
  analysis: string;
  riskAreas: Array<{ area: string; risk: string; suggestion: string }>;
  complianceScore: number;
  legalDisclaimer: string;
}> {
  const { invokeLLM } = await import("./_core/llm");

  const llmResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein Rechtsexperte für Network Marketing / MLM Compliance in Deutschland. 
Analysiere den folgenden Social Media Content auf rechtliche Risiken.

Prüfe auf:
1. HWG (Heilmittelwerbegesetz) - Heilversprechen, Gesundheitsaussagen
2. UWG (Gesetz gegen unlauteren Wettbewerb) - Einkommensversprechen, irreführende Werbung
3. DSGVO - Datenschutz bei Lead-Generierung
4. TMG/DDG - Werbekennzeichnung
5. MLM-spezifische Regeln (IHK-Richtlinien)
6. LR Health & Beauty Partnerrichtlinien (Fresenius-geprüft, NICHT TÜV!)

Gib die Analyse als JSON zurück.`
      },
      {
        role: "user",
        content: `Analysiere diesen ${platform}-Post auf rechtliche Compliance:\n\n"${content}"`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "compliance_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            analysis: { type: "string", description: "Zusammenfassung der rechtlichen Analyse (2-3 Sätze)" },
            riskAreas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string", description: "Rechtsgebiet (z.B. HWG, UWG, DSGVO)" },
                  risk: { type: "string", description: "Beschreibung des Risikos" },
                  suggestion: { type: "string", description: "Konkrete Verbesserung" },
                },
                required: ["area", "risk", "suggestion"],
                additionalProperties: false,
              },
            },
            complianceScore: { type: "integer", description: "Compliance-Score 0-100 (100 = voll konform)" },
            legalDisclaimer: { type: "string", description: "Empfohlener rechtlicher Disclaimer für den Post" },
          },
          required: ["analysis", "riskAreas", "complianceScore", "legalDisclaimer"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = llmResponse.choices?.[0]?.message?.content;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {
        analysis: "Analyse konnte nicht durchgeführt werden.",
        riskAreas: [],
        complianceScore: 50,
        legalDisclaimer: "",
      };
    }
  }
  return {
    analysis: "Analyse nicht verfügbar.",
    riskAreas: [],
    complianceScore: 50,
    legalDisclaimer: "",
  };
}
