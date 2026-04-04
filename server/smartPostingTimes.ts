/**
 * Smart Posting Times Engine
 * Berechnet die optimalen Posting-Zeiten pro Plattform basierend auf:
 * 1. Industrie-Benchmarks (Social Media Studien 2025/2026)
 * 2. Feedback-Daten aus dem System (welche Posts performen am besten)
 * 3. Plattform-spezifische Algorithmus-Eigenheiten
 * 4. Wochentag-Optimierung (Montag vs. Wochenende)
 * 5. DACH-Region Zielgruppe (UTC+1/UTC+2)
 */

// ═══════════════════════════════════════════════════════════════
// INDUSTRIE-BENCHMARKS 2025/2026 (DACH-Region, UTC+1)
// Quellen: Hootsuite, Sprout Social, Later, Buffer Studien
// ═══════════════════════════════════════════════════════════════

export interface TimeSlot {
  hour: number;       // 0-23
  minute: number;     // 0 oder 30
  score: number;      // 0-100 Engagement-Score
  reason: string;     // Warum diese Zeit gut ist
}

export interface DaySchedule {
  dayOfWeek: number;  // 0=Sonntag, 1=Montag, ... 6=Samstag
  dayName: string;
  slots: TimeSlot[];
  bestSlot: TimeSlot;
  isTopDay: boolean;  // Gehört zu den besten Tagen der Woche
}

export interface PlatformSchedule {
  platform: string;
  displayName: string;
  emoji: string;
  timezone: string;
  weekSchedule: DaySchedule[];
  globalBestTimes: TimeSlot[];  // Top 3 Zeiten über die ganze Woche
  peakDays: string[];           // Beste Tage
  avoidTimes: string[];         // Zeiten die man meiden sollte
  algorithmNotes: string;       // Plattform-spezifische Hinweise
}

const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

// ═══════════════════════════════════════════════════════════════
// INSTAGRAM - Visuell, Story-driven, Reels-fokussiert
// ═══════════════════════════════════════════════════════════════

const INSTAGRAM_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: false, bestSlot: { hour: 10, minute: 0, score: 65, reason: "Sonntagmorgen Scroll-Zeit" }, slots: [
    { hour: 9, minute: 0, score: 55, reason: "Frühes Aufstehen am Wochenende" },
    { hour: 10, minute: 0, score: 65, reason: "Brunch-Zeit, entspanntes Scrollen" },
    { hour: 17, minute: 0, score: 60, reason: "Sonntagnachmittag Couch-Zeit" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: true, bestSlot: { hour: 6, minute: 0, score: 82, reason: "Montag-Motivation, erste Scroll-Session" }, slots: [
    { hour: 6, minute: 0, score: 82, reason: "Wecker klingelt, Instagram öffnen" },
    { hour: 11, minute: 0, score: 75, reason: "Vormittags-Pause" },
    { hour: 18, minute: 0, score: 78, reason: "Feierabend-Scroll" },
    { hour: 21, minute: 0, score: 70, reason: "Abend-Routine" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: true, bestSlot: { hour: 7, minute: 0, score: 85, reason: "Höchstes Engagement der Woche" }, slots: [
    { hour: 7, minute: 0, score: 85, reason: "Morgen-Routine, Pendeln" },
    { hour: 12, minute: 0, score: 80, reason: "Mittagspause - Peak" },
    { hour: 18, minute: 0, score: 77, reason: "Feierabend" },
    { hour: 21, minute: 30, score: 72, reason: "Abend-Scroll" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: true, bestSlot: { hour: 7, minute: 0, score: 83, reason: "Mitte der Woche, hohe Aktivität" }, slots: [
    { hour: 7, minute: 0, score: 83, reason: "Morgen-Pendeln" },
    { hour: 11, minute: 0, score: 76, reason: "Vormittags-Break" },
    { hour: 17, minute: 0, score: 74, reason: "Nachmittags-Tief überwinden" },
    { hour: 20, minute: 0, score: 71, reason: "Prime Time Abend" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: false, bestSlot: { hour: 12, minute: 0, score: 78, reason: "Mittagspause-Peak" }, slots: [
    { hour: 7, minute: 0, score: 72, reason: "Morgen-Routine" },
    { hour: 12, minute: 0, score: 78, reason: "Mittagspause" },
    { hour: 18, minute: 30, score: 73, reason: "Feierabend" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: false, bestSlot: { hour: 11, minute: 0, score: 70, reason: "Freitag-Stimmung" }, slots: [
    { hour: 8, minute: 0, score: 65, reason: "Letzter Arbeitstag, entspannt" },
    { hour: 11, minute: 0, score: 70, reason: "Wochenend-Vorfreude" },
    { hour: 19, minute: 0, score: 68, reason: "Freitagabend-Start" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: false, bestSlot: { hour: 10, minute: 0, score: 62, reason: "Wochenend-Scroll" }, slots: [
    { hour: 10, minute: 0, score: 62, reason: "Ausschlafen, dann Instagram" },
    { hour: 14, minute: 0, score: 58, reason: "Nachmittags-Pause" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// TIKTOK - Algorithmus-getrieben, Unterhaltung
// ═══════════════════════════════════════════════════════════════

const TIKTOK_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: false, bestSlot: { hour: 19, minute: 0, score: 72, reason: "Sonntagabend Binge-Watching" }, slots: [
    { hour: 10, minute: 0, score: 60, reason: "Sonntagmorgen im Bett" },
    { hour: 15, minute: 0, score: 65, reason: "Nachmittags-Langeweile" },
    { hour: 19, minute: 0, score: 72, reason: "Abend-Entertainment" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: false, bestSlot: { hour: 12, minute: 0, score: 75, reason: "Mittagspause-Escape" }, slots: [
    { hour: 7, minute: 0, score: 68, reason: "Morgen-Pendeln" },
    { hour: 12, minute: 0, score: 75, reason: "Mittagspause" },
    { hour: 21, minute: 0, score: 73, reason: "Abend-Session" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: true, bestSlot: { hour: 17, minute: 0, score: 88, reason: "Dienstag 17 Uhr = TikTok Peak" }, slots: [
    { hour: 7, minute: 0, score: 70, reason: "Morgen-Scroll" },
    { hour: 12, minute: 0, score: 76, reason: "Mittagspause" },
    { hour: 17, minute: 0, score: 88, reason: "Nach der Arbeit/Schule - absoluter Peak" },
    { hour: 21, minute: 0, score: 80, reason: "Abend-Binge" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: true, bestSlot: { hour: 17, minute: 0, score: 85, reason: "Mitte der Woche, Ablenkung gesucht" }, slots: [
    { hour: 7, minute: 0, score: 68, reason: "Morgen-Routine" },
    { hour: 12, minute: 0, score: 74, reason: "Mittagspause" },
    { hour: 17, minute: 0, score: 85, reason: "Feierabend-Peak" },
    { hour: 21, minute: 0, score: 78, reason: "Abend-Session" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: true, bestSlot: { hour: 21, minute: 0, score: 86, reason: "Donnerstagabend = TikTok Night" }, slots: [
    { hour: 7, minute: 0, score: 65, reason: "Morgen" },
    { hour: 12, minute: 0, score: 72, reason: "Mittagspause" },
    { hour: 17, minute: 0, score: 80, reason: "Feierabend" },
    { hour: 21, minute: 0, score: 86, reason: "Abend-Peak, Wochenende naht" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: false, bestSlot: { hour: 17, minute: 0, score: 74, reason: "Freitag-Feierabend" }, slots: [
    { hour: 12, minute: 0, score: 68, reason: "Mittagspause" },
    { hour: 17, minute: 0, score: 74, reason: "Wochenend-Start" },
    { hour: 22, minute: 0, score: 70, reason: "Freitagabend" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: false, bestSlot: { hour: 20, minute: 0, score: 68, reason: "Samstagabend" }, slots: [
    { hour: 11, minute: 0, score: 60, reason: "Spät aufstehen" },
    { hour: 20, minute: 0, score: 68, reason: "Abend-Entertainment" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// FACEBOOK - Community, ältere Zielgruppe (30-55)
// ═══════════════════════════════════════════════════════════════

const FACEBOOK_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: false, bestSlot: { hour: 12, minute: 0, score: 60, reason: "Sonntagmittag" }, slots: [
    { hour: 10, minute: 0, score: 55, reason: "Sonntagmorgen" },
    { hour: 12, minute: 0, score: 60, reason: "Mittagszeit" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: true, bestSlot: { hour: 9, minute: 0, score: 80, reason: "Montag Büro-Start" }, slots: [
    { hour: 9, minute: 0, score: 80, reason: "Arbeitsbeginn, Facebook checken" },
    { hour: 13, minute: 0, score: 76, reason: "Mittagspause" },
    { hour: 16, minute: 0, score: 72, reason: "Nachmittags-Tief" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: true, bestSlot: { hour: 9, minute: 0, score: 82, reason: "Dienstag = Facebook Top-Tag" }, slots: [
    { hour: 9, minute: 0, score: 82, reason: "Morgen-Check" },
    { hour: 12, minute: 0, score: 78, reason: "Mittagspause" },
    { hour: 15, minute: 0, score: 74, reason: "Nachmittag" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: true, bestSlot: { hour: 9, minute: 0, score: 81, reason: "Wochenmitte, stabil" }, slots: [
    { hour: 9, minute: 0, score: 81, reason: "Morgen" },
    { hour: 12, minute: 0, score: 77, reason: "Mittagspause" },
    { hour: 16, minute: 0, score: 70, reason: "Nachmittag" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: false, bestSlot: { hour: 13, minute: 0, score: 75, reason: "Mittagspause" }, slots: [
    { hour: 9, minute: 0, score: 72, reason: "Morgen" },
    { hour: 13, minute: 0, score: 75, reason: "Mittagspause" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: false, bestSlot: { hour: 9, minute: 0, score: 68, reason: "Freitag-Start" }, slots: [
    { hour: 9, minute: 0, score: 68, reason: "Letzter Arbeitstag" },
    { hour: 11, minute: 0, score: 65, reason: "Vormittag" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: false, bestSlot: { hour: 12, minute: 0, score: 55, reason: "Wochenende" }, slots: [
    { hour: 12, minute: 0, score: 55, reason: "Mittag" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// LINKEDIN - B2B, Professionals (Montag-Freitag)
// ═══════════════════════════════════════════════════════════════

const LINKEDIN_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: false, bestSlot: { hour: 18, minute: 0, score: 40, reason: "Sonntagabend Vorbereitung" }, slots: [
    { hour: 18, minute: 0, score: 40, reason: "Woche vorbereiten" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: true, bestSlot: { hour: 8, minute: 0, score: 85, reason: "Montag 8 Uhr = LinkedIn Peak" }, slots: [
    { hour: 8, minute: 0, score: 85, reason: "Wochenstart, Business-Modus" },
    { hour: 10, minute: 0, score: 80, reason: "Vormittags-Peak" },
    { hour: 12, minute: 0, score: 75, reason: "Mittagspause" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: true, bestSlot: { hour: 8, minute: 0, score: 87, reason: "Dienstag = LinkedIn #1 Tag" }, slots: [
    { hour: 8, minute: 0, score: 87, reason: "Absoluter Peak" },
    { hour: 10, minute: 0, score: 82, reason: "Vormittag" },
    { hour: 12, minute: 0, score: 78, reason: "Mittagspause" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: true, bestSlot: { hour: 8, minute: 0, score: 84, reason: "Wochenmitte Business" }, slots: [
    { hour: 8, minute: 0, score: 84, reason: "Morgen-Peak" },
    { hour: 10, minute: 0, score: 79, reason: "Vormittag" },
    { hour: 12, minute: 0, score: 76, reason: "Mittagspause" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: false, bestSlot: { hour: 10, minute: 0, score: 78, reason: "Donnerstag Vormittag" }, slots: [
    { hour: 8, minute: 0, score: 75, reason: "Morgen" },
    { hour: 10, minute: 0, score: 78, reason: "Vormittag" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: false, bestSlot: { hour: 8, minute: 0, score: 65, reason: "Freitag-Morgen" }, slots: [
    { hour: 8, minute: 0, score: 65, reason: "Freitag, weniger Aktivität" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: false, bestSlot: { hour: 10, minute: 0, score: 35, reason: "Wochenende - kaum aktiv" }, slots: [
    { hour: 10, minute: 0, score: 35, reason: "Minimal" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// TWITTER/X - News, Echtzeit, schnelllebig
// ═══════════════════════════════════════════════════════════════

const TWITTER_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: false, bestSlot: { hour: 12, minute: 0, score: 55, reason: "Sonntagmittag" }, slots: [
    { hour: 12, minute: 0, score: 55, reason: "Mittag" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: true, bestSlot: { hour: 8, minute: 0, score: 80, reason: "Montag-Morgen News" }, slots: [
    { hour: 8, minute: 0, score: 80, reason: "Morgen-News" },
    { hour: 12, minute: 0, score: 76, reason: "Mittagspause" },
    { hour: 17, minute: 0, score: 74, reason: "Feierabend" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: true, bestSlot: { hour: 8, minute: 0, score: 82, reason: "Dienstag Peak" }, slots: [
    { hour: 8, minute: 0, score: 82, reason: "Morgen" },
    { hour: 12, minute: 0, score: 78, reason: "Mittag" },
    { hour: 17, minute: 0, score: 75, reason: "Feierabend" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: true, bestSlot: { hour: 12, minute: 0, score: 80, reason: "Mittwoch Mittag" }, slots: [
    { hour: 8, minute: 0, score: 76, reason: "Morgen" },
    { hour: 12, minute: 0, score: 80, reason: "Mittagspause Peak" },
    { hour: 17, minute: 0, score: 73, reason: "Feierabend" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: false, bestSlot: { hour: 12, minute: 0, score: 75, reason: "Mittagspause" }, slots: [
    { hour: 8, minute: 0, score: 72, reason: "Morgen" },
    { hour: 12, minute: 0, score: 75, reason: "Mittag" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: false, bestSlot: { hour: 8, minute: 0, score: 68, reason: "Freitag-Morgen" }, slots: [
    { hour: 8, minute: 0, score: 68, reason: "Freitag" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: false, bestSlot: { hour: 11, minute: 0, score: 50, reason: "Wochenende" }, slots: [
    { hour: 11, minute: 0, score: 50, reason: "Samstag" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// THREADS - Ähnlich Instagram, aber Text-fokussiert
// ═══════════════════════════════════════════════════════════════

const THREADS_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: false, bestSlot: { hour: 18, minute: 0, score: 58, reason: "Sonntagabend" }, slots: [
    { hour: 10, minute: 0, score: 52, reason: "Morgen" },
    { hour: 18, minute: 0, score: 58, reason: "Abend" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: true, bestSlot: { hour: 9, minute: 0, score: 78, reason: "Montag-Morgen" }, slots: [
    { hour: 9, minute: 0, score: 78, reason: "Morgen" },
    { hour: 18, minute: 0, score: 74, reason: "Feierabend" },
    { hour: 21, minute: 0, score: 70, reason: "Abend" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: true, bestSlot: { hour: 9, minute: 0, score: 80, reason: "Dienstag Peak" }, slots: [
    { hour: 9, minute: 0, score: 80, reason: "Morgen" },
    { hour: 12, minute: 0, score: 75, reason: "Mittag" },
    { hour: 18, minute: 0, score: 76, reason: "Feierabend" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: false, bestSlot: { hour: 18, minute: 0, score: 75, reason: "Mittwochabend" }, slots: [
    { hour: 9, minute: 0, score: 72, reason: "Morgen" },
    { hour: 18, minute: 0, score: 75, reason: "Abend" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: false, bestSlot: { hour: 18, minute: 0, score: 72, reason: "Donnerstagabend" }, slots: [
    { hour: 9, minute: 0, score: 68, reason: "Morgen" },
    { hour: 18, minute: 0, score: 72, reason: "Abend" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: false, bestSlot: { hour: 18, minute: 0, score: 65, reason: "Freitagabend" }, slots: [
    { hour: 18, minute: 0, score: 65, reason: "Wochenend-Start" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: false, bestSlot: { hour: 10, minute: 0, score: 50, reason: "Wochenende" }, slots: [
    { hour: 10, minute: 0, score: 50, reason: "Samstag" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// YOUTUBE - Longform, Shorts, Planung wichtig
// ═══════════════════════════════════════════════════════════════

const YOUTUBE_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: true, bestSlot: { hour: 14, minute: 0, score: 80, reason: "Sonntagnachmittag = YouTube-Zeit" }, slots: [
    { hour: 11, minute: 0, score: 70, reason: "Sonntagvormittag" },
    { hour: 14, minute: 0, score: 80, reason: "Nachmittag-Binge" },
    { hour: 20, minute: 0, score: 75, reason: "Abend" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: false, bestSlot: { hour: 17, minute: 0, score: 72, reason: "Feierabend" }, slots: [
    { hour: 14, minute: 0, score: 68, reason: "Nachmittag" },
    { hour: 17, minute: 0, score: 72, reason: "Feierabend" },
    { hour: 20, minute: 0, score: 70, reason: "Abend" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: false, bestSlot: { hour: 17, minute: 0, score: 74, reason: "Feierabend" }, slots: [
    { hour: 14, minute: 0, score: 70, reason: "Nachmittag" },
    { hour: 17, minute: 0, score: 74, reason: "Feierabend" },
    { hour: 20, minute: 0, score: 72, reason: "Abend" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: false, bestSlot: { hour: 17, minute: 0, score: 73, reason: "Wochenmitte" }, slots: [
    { hour: 14, minute: 0, score: 69, reason: "Nachmittag" },
    { hour: 17, minute: 0, score: 73, reason: "Feierabend" },
    { hour: 20, minute: 0, score: 71, reason: "Abend" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: true, bestSlot: { hour: 17, minute: 0, score: 78, reason: "Donnerstag = YouTube Top-Tag" }, slots: [
    { hour: 14, minute: 0, score: 72, reason: "Nachmittag" },
    { hour: 17, minute: 0, score: 78, reason: "Peak" },
    { hour: 20, minute: 0, score: 76, reason: "Abend" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: true, bestSlot: { hour: 17, minute: 0, score: 82, reason: "Freitag = YouTube #1" }, slots: [
    { hour: 14, minute: 0, score: 74, reason: "Nachmittag" },
    { hour: 17, minute: 0, score: 82, reason: "Wochenend-Start" },
    { hour: 20, minute: 0, score: 78, reason: "Freitagabend" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: true, bestSlot: { hour: 14, minute: 0, score: 79, reason: "Samstagnachmittag" }, slots: [
    { hour: 11, minute: 0, score: 72, reason: "Vormittag" },
    { hour: 14, minute: 0, score: 79, reason: "Nachmittag" },
    { hour: 20, minute: 0, score: 76, reason: "Abend" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// PINTEREST - Visuell, Planung, Evergreen
// ═══════════════════════════════════════════════════════════════

const PINTEREST_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, dayName: "Sonntag", isTopDay: true, bestSlot: { hour: 20, minute: 0, score: 78, reason: "Sonntagabend Planung" }, slots: [
    { hour: 14, minute: 0, score: 65, reason: "Nachmittag" },
    { hour: 20, minute: 0, score: 78, reason: "Abend-Inspiration" },
  ]},
  { dayOfWeek: 1, dayName: "Montag", isTopDay: false, bestSlot: { hour: 20, minute: 0, score: 72, reason: "Montagabend" }, slots: [
    { hour: 20, minute: 0, score: 72, reason: "Abend" },
    { hour: 22, minute: 0, score: 70, reason: "Spätabend" },
  ]},
  { dayOfWeek: 2, dayName: "Dienstag", isTopDay: false, bestSlot: { hour: 21, minute: 0, score: 74, reason: "Dienstagabend" }, slots: [
    { hour: 21, minute: 0, score: 74, reason: "Abend" },
  ]},
  { dayOfWeek: 3, dayName: "Mittwoch", isTopDay: false, bestSlot: { hour: 21, minute: 0, score: 73, reason: "Mittwochabend" }, slots: [
    { hour: 21, minute: 0, score: 73, reason: "Abend" },
  ]},
  { dayOfWeek: 4, dayName: "Donnerstag", isTopDay: false, bestSlot: { hour: 20, minute: 0, score: 70, reason: "Donnerstagabend" }, slots: [
    { hour: 20, minute: 0, score: 70, reason: "Abend" },
  ]},
  { dayOfWeek: 5, dayName: "Freitag", isTopDay: true, bestSlot: { hour: 20, minute: 0, score: 76, reason: "Freitagabend" }, slots: [
    { hour: 15, minute: 0, score: 68, reason: "Nachmittag" },
    { hour: 20, minute: 0, score: 76, reason: "Abend" },
  ]},
  { dayOfWeek: 6, dayName: "Samstag", isTopDay: true, bestSlot: { hour: 20, minute: 0, score: 80, reason: "Samstag = Pinterest Peak" }, slots: [
    { hour: 14, minute: 0, score: 70, reason: "Nachmittag" },
    { hour: 20, minute: 0, score: 80, reason: "Abend-Inspiration" },
    { hour: 22, minute: 0, score: 75, reason: "Spätabend" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// ALLE PLATTFORMEN ZUSAMMEN
// ═══════════════════════════════════════════════════════════════

function buildPlatformSchedule(
  platform: string,
  displayName: string,
  emoji: string,
  schedule: DaySchedule[],
  algorithmNotes: string,
  avoidTimes: string[]
): PlatformSchedule {
  // Top 3 Zeiten über die ganze Woche berechnen
  const allSlots = schedule.flatMap(d => d.slots.map(s => ({ ...s, day: d.dayName })));
  allSlots.sort((a, b) => b.score - a.score);
  const globalBestTimes = allSlots.slice(0, 3);

  const peakDays = schedule.filter(d => d.isTopDay).map(d => d.dayName);

  return {
    platform,
    displayName,
    emoji,
    timezone: "Europe/Berlin (UTC+1/+2)",
    weekSchedule: schedule,
    globalBestTimes,
    peakDays,
    avoidTimes,
    algorithmNotes,
  };
}

export const ALL_PLATFORM_SCHEDULES: Record<string, PlatformSchedule> = {
  instagram: buildPlatformSchedule("instagram", "Instagram", "📸", INSTAGRAM_SCHEDULE,
    "Reels werden 30-60 Min nach Upload vom Algorithmus gepusht. Poste also VOR der Peak-Zeit. Stories haben eigene Timing-Regeln (morgens 7-9 für Engagement).",
    ["Samstag 14-17 Uhr (niedrigstes Engagement)", "Freitag Nachmittag (Wochenend-Modus)"]
  ),
  tiktok: buildPlatformSchedule("tiktok", "TikTok", "🎵", TIKTOK_SCHEDULE,
    "TikTok-Algorithmus testet Videos in Wellen. Poste 1-2 Stunden VOR der Peak-Zeit damit die erste Welle in den Peak fällt. Konsistenz (täglich posten) ist wichtiger als perfektes Timing.",
    ["Montag 6-8 Uhr (zu früh für TikTok-Zielgruppe)", "Samstag Vormittag"]
  ),
  facebook: buildPlatformSchedule("facebook", "Facebook", "📘", FACEBOOK_SCHEDULE,
    "Facebook bevorzugt Content der schnell Engagement bekommt. Poste wenn deine Community online ist (Bürozeiten Mo-Fr). Gruppen-Posts haben andere optimale Zeiten als Page-Posts.",
    ["Wochenende generell (30-40% weniger Engagement)", "Abends nach 20 Uhr"]
  ),
  linkedin: buildPlatformSchedule("linkedin", "LinkedIn", "💼", LINKEDIN_SCHEDULE,
    "LinkedIn-Algorithmus gibt Posts 1-2 Stunden Testphase. Poste um 7:30-8:00 damit der Test in die Büro-Ankunftszeit fällt. Wochenende fast wertlos. Dienstag-Mittwoch sind die absoluten Top-Tage.",
    ["Wochenende (kaum Business-Aktivität)", "Freitag Nachmittag (Mental schon im Wochenende)"]
  ),
  twitter: buildPlatformSchedule("twitter", "Twitter/X", "🐦", TWITTER_SCHEDULE,
    "Twitter ist Echtzeit - Timing ist hier am wichtigsten. Tweets haben eine Halbwertszeit von nur 18 Minuten. Poste mehrmals täglich zu verschiedenen Peak-Zeiten.",
    ["Spätabend nach 22 Uhr", "Wochenende (außer für News-Themen)"]
  ),
  threads: buildPlatformSchedule("threads", "Threads", "🧵", THREADS_SCHEDULE,
    "Threads folgt ähnlichen Mustern wie Instagram, aber mit stärkerem Text-Fokus. Morgens und Abends sind die besten Zeiten. Die Plattform wächst noch - Konsistenz ist wichtiger als Timing.",
    ["Samstag generell", "Spätabend nach 22 Uhr"]
  ),
  youtube: buildPlatformSchedule("youtube", "YouTube", "🎬", YOUTUBE_SCHEDULE,
    "YouTube-Videos brauchen 2-4 Stunden um vom Algorithmus indexiert zu werden. Poste also 2-3 Stunden VOR der Peak-Watch-Time. Shorts haben andere Regeln (ähnlich wie TikTok). Donnerstag-Samstag sind die besten Tage.",
    ["Montag Vormittag (niedrigste Watch-Time)", "Dienstag früh"]
  ),
  pinterest: buildPlatformSchedule("pinterest", "Pinterest", "📌", PINTEREST_SCHEDULE,
    "Pinterest ist eine Suchmaschine - Timing ist weniger kritisch als bei anderen Plattformen. Trotzdem: Abends und am Wochenende wird am meisten gepinnt. Pins haben eine Halbwertszeit von 3-4 Monaten.",
    ["Werktags Vormittag (wenig Pinterest-Nutzung)", "Montag generell"]
  ),
};

// ═══════════════════════════════════════════════════════════════
// SMART SCHEDULING - Nächsten optimalen Zeitpunkt berechnen
// ═══════════════════════════════════════════════════════════════

export interface SmartScheduleResult {
  scheduledTime: string;       // ISO string
  platform: string;
  dayName: string;
  hour: number;
  minute: number;
  score: number;
  reason: string;
  isToday: boolean;
  hoursFromNow: number;
}

/**
 * Berechnet den nächsten optimalen Posting-Zeitpunkt für eine Plattform.
 * Berücksichtigt den aktuellen Zeitpunkt und findet den nächsten besten Slot.
 */
export function getNextSmartPostingTime(platform: string): SmartScheduleResult {
  const schedule = ALL_PLATFORM_SCHEDULES[platform.toLowerCase()];
  if (!schedule) {
    // Fallback: Nächste volle Stunde
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return {
      scheduledTime: now.toISOString(),
      platform,
      dayName: DAY_NAMES[now.getDay()],
      hour: now.getHours(),
      minute: 0,
      score: 50,
      reason: "Standard-Zeit (keine Daten für diese Plattform)",
      isToday: true,
      hoursFromNow: 1,
    };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Suche den nächsten besten Slot in den nächsten 7 Tagen
  let bestResult: SmartScheduleResult | null = null;

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDay = (currentDay + dayOffset) % 7;
    const daySchedule = schedule.weekSchedule.find(d => d.dayOfWeek === targetDay);
    if (!daySchedule) continue;

    for (const slot of daySchedule.slots) {
      // Wenn heute, nur zukünftige Slots
      if (dayOffset === 0) {
        if (slot.hour < currentHour || (slot.hour === currentHour && slot.minute <= currentMinute)) {
          continue;
        }
      }

      // Berechne die Zielzeit
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + dayOffset);
      targetDate.setHours(slot.hour, slot.minute, 0, 0);

      const hoursFromNow = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // STARK heute/morgen bevorzugen - Posts sollen NICHT Tage voraus geplant werden!
      // Gewichtung: 50% Engagement-Score, 50% Nähe (vorher 70/30)
      // Massiver Abzug für Tage > 1 in der Zukunft
      const proximityBonus = dayOffset === 0 ? 30 : (dayOffset === 1 ? 15 : Math.max(0, 5 - dayOffset * 2));
      const effectiveScore = slot.score * 0.5 + proximityBonus + (daySchedule.isTopDay ? 3 : 0);

      const bestEffective = bestResult 
        ? bestResult.score * 0.5 + (bestResult.isToday ? 30 : (bestResult.hoursFromNow < 48 ? 15 : Math.max(0, 5 - Math.floor(bestResult.hoursFromNow / 24) * 2))) + 0
        : 0;
      if (!bestResult || effectiveScore > bestEffective) {
        bestResult = {
          scheduledTime: targetDate.toISOString(),
          platform,
          dayName: daySchedule.dayName,
          hour: slot.hour,
          minute: slot.minute,
          score: slot.score,
          reason: slot.reason,
          isToday: dayOffset === 0,
          hoursFromNow: Math.round(hoursFromNow * 10) / 10,
        };
      }
    }
  }

  if (!bestResult) {
    // Fallback: Morgen um 9 Uhr
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return {
      scheduledTime: tomorrow.toISOString(),
      platform,
      dayName: DAY_NAMES[tomorrow.getDay()],
      hour: 9,
      minute: 0,
      score: 60,
      reason: "Fallback: Morgen 9 Uhr",
      isToday: false,
      hoursFromNow: Math.round((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60) * 10) / 10,
    };
  }

  return bestResult;
}

/**
 * Berechnet die nächsten optimalen Posting-Zeiten für mehrere Plattformen.
 */
export function getNextSmartPostingTimes(platforms: string[]): SmartScheduleResult[] {
  return platforms.map(p => getNextSmartPostingTime(p));
}

/**
 * Gibt den kompletten Wochenplan für eine Plattform zurück.
 */
export function getWeeklySchedule(platform: string): PlatformSchedule | null {
  return ALL_PLATFORM_SCHEDULES[platform.toLowerCase()] || null;
}

/**
 * Gibt alle verfügbaren Plattform-Schedules zurück.
 */
export function getAllSchedules(): PlatformSchedule[] {
  return Object.values(ALL_PLATFORM_SCHEDULES);
}

/**
 * Berechnet den besten Zeitpunkt für einen bestimmten Wochentag und Plattform.
 */
export function getBestTimeForDay(platform: string, dayOfWeek: number) {
  const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const schedule = ALL_PLATFORM_SCHEDULES[platform.toLowerCase()];
  if (!schedule) {
    return {
      platform,
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek] || "Unbekannt",
      bestSlot: { hour: 9, minute: 0, score: 50, reason: "Standard-Fallback" },
      allSlots: [{ hour: 9, minute: 0, score: 50, reason: "Standard-Fallback" }],
    };
  }
  const daySchedule = schedule.weekSchedule.find(d => d.dayOfWeek === dayOfWeek);
  if (!daySchedule) {
    return {
      platform,
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek] || "Unbekannt",
      bestSlot: { hour: 9, minute: 0, score: 50, reason: "Kein Daten f\u00fcr diesen Tag" },
      allSlots: [],
    };
  }
  return {
    platform,
    dayOfWeek,
    dayName: daySchedule.dayName,
    bestSlot: daySchedule.bestSlot,
    allSlots: daySchedule.slots,
  };
}
