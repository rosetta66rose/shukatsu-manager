export function formatDeadline(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysUntil(iso: string): number | null {
  const now = new Date();
  const target = new Date(iso);
  if (isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** "M/D", "M/D-D", "M/D-M/D", "YYYY-MM-DD", comma-separated をパースして
 *  { start, end? }[] の配列に変換する */
export function parseEventDates(eventDates: string): { start: string; end?: string }[] {
  if (!eventDates) return [];
  const year = new Date().getFullYear();
  const results: { start: string; end?: string }[] = [];
  const parts = eventDates.split(',').map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
      results.push({ start: part }); continue;
    }
    // M/D-M/D (cross-month range)
    const fullRange = part.match(/^(\d+)\/(\d+)-(\d+)\/(\d+)$/);
    if (fullRange) {
      const start = new Date(year, +fullRange[1] - 1, +fullRange[2]);
      const end   = new Date(year, +fullRange[3] - 1, +fullRange[4] + 1);
      results.push({ start: fmtDate(start), end: fmtDate(end) }); continue;
    }
    // M/D-D (same-month range)
    const shortRange = part.match(/^(\d+)\/(\d+)-(\d+)$/);
    if (shortRange) {
      const start = new Date(year, +shortRange[1] - 1, +shortRange[2]);
      const end   = new Date(year, +shortRange[1] - 1, +shortRange[3] + 1);
      results.push({ start: fmtDate(start), end: fmtDate(end) }); continue;
    }
    // M/D (single day)
    const single = part.match(/^(\d+)\/(\d+)$/);
    if (single) {
      results.push({ start: fmtDate(new Date(year, +single[1] - 1, +single[2])) });
    }
  }
  return results;
}
