export const CORRECTIONS: Record<string, string> = {
sidawala: 'Sudhowala',
siddowala: 'Sudhowala',
sudowala: 'Sudhowala',
// add more common corrections here as needed
};

const toTitle = (s: string) =>
s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

export function normalizeName(raw?: string) {
if (!raw) return '';
let out = raw.trim();
const lower = out.toLowerCase();
for (const wrong in CORRECTIONS) {
if (lower.includes(wrong)) {
out = out.replace(new RegExp(wrong, 'ig'), CORRECTIONS[wrong]);
break;
}
}
return toTitle(out);
}

export function localityKey(raw?: string) {
return normalizeName(raw)
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/(^-|-$)/g, '');
}