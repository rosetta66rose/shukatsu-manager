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
