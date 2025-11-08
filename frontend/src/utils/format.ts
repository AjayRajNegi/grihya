export function formatCount(n: number = 0): string {
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);

  if (abs < 1000) return String(n);
  if (abs < 1_000_000) {
    const v = n / 1000;
    const fixed = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1);
    return `${fixed}K`;
  }
  const v = n / 1_000_000;
  const fixed = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1);
  return `${fixed}M`;
}

export function formatDate(
  input?: string | number | Date,
  locale: string = 'en-IN'
): string {
  if (!input) return '';
  try {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return String(input);
  }
}