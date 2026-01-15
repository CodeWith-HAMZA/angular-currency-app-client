export function formatDate(date: Date): string {
  if (!(date instanceof Date)) return '';
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocal(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function pushLocal<T = any>(key: string, value: T) {
  const arr = getLocal<T[]>(key, []);
  arr.unshift(value);
  setLocal(key, arr);
}

// Only allow past or today (not future dates) in datepicker
export function filterPastDates(d: Date | null): boolean {
  if (!d) return false;
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return d.getTime() < today.getTime();
}
