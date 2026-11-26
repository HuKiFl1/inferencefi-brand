const cache = new Map<string, Intl.NumberFormat>();

function formatter(min: number, max: number) {
  const key = `${min}:${max}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", { minimumFractionDigits: min, maximumFractionDigits: max });
    cache.set(key, f);
  }
  return f;
}

export function num(value: string | number, digits = 2, minDigits = digits) {
  return formatter(minDigits, digits).format(typeof value === "string" ? Number(value) : value);
}

export function bps(value: number) {
  return `${num(value, 1, 0)} bps`;
}

export function pct(fraction: number, digits = 2) {
  return `${num(fraction * 100, digits)}%`;
}

export function age(seconds: number) {
  if (seconds < 90) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `${minutes} min`;
  return `${num(minutes / 60, 1, 0)} h`;
}

export function sum(values: (string | number)[]) {
  return values.reduce<number>((total, v) => total + Number(v), 0);
}
