const GLYPHS: Record<string, string> = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

const DENOMINATORS = [2, 3, 4, 8];

/**
 * Render a scaled amount the way a cookbook would: 1 1/2 cups, not 1.5 cups.
 * Falls back to a short decimal when no clean fraction is close enough.
 */
export function formatAmount(value: number): string {
  if (value <= 0) return "0";
  const whole = Math.floor(value);
  const frac = value - whole;
  if (frac < 0.01) return String(whole);
  for (const d of DENOMINATORS) {
    const n = Math.round(frac * d);
    if (n > 0 && n < d && Math.abs(frac - n / d) < 0.02) {
      const key = `${n / gcd(n, d)}/${d / gcd(n, d)}`;
      const glyph = GLYPHS[key] ?? key;
      return whole > 0 ? `${whole} ${glyph}` : glyph;
    }
  }
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function formatCad(value: number): string {
  return `$${value.toFixed(2)}`;
}

const SINGULARIZABLE = new Set(["cups", "litres", "liters", "pounds", "ounces"]);

/** "1 cup" and "¾ cup", but "2 cups". */
export function formatQuantity(value: number, unit: string): string {
  const amount = formatAmount(value);
  const u = unit.trim();
  if (value <= 1 && SINGULARIZABLE.has(u.toLowerCase())) return `${amount} ${u.slice(0, -1)}`;
  return `${amount} ${u}`.trim();
}
