/**
 * Format a date as relative time in German (e.g., "vor 5 Min.", "vor 2 Std.")
 */
export function formatDistanceToNow(date: Date | string | number): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffHour < 24) return `vor ${diffHour} Std.`;
  if (diffDay < 7) return `vor ${diffDay} Tag${diffDay > 1 ? "en" : ""}`;
  if (diffDay < 30) return `vor ${Math.floor(diffDay / 7)} Wo.`;
  return new Date(date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}
