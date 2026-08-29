const VOLUME_ML: Record<string, number> = {
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  cup: 250,
  cups: 250,
  ml: 1,
  l: 1000,
  litre: 1000,
  litres: 1000,
  liter: 1000,
  liters: 1000,
  "fl oz": 30,
};

const MASS_G: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  lb: 453.6,
  lbs: 453.6,
  pound: 453.6,
  pounds: 453.6,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
};

export function normalizeUnit(unit: string): string {
  return unit.trim().toLowerCase().replace(/\.$/, "");
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Convert an amount between units. Returns null when the units are not
 * convertible, which callers treat as "exclude from cost, keep on the list".
 */
export function convertAmount(amount: number, fromUnit: string, toUnit: string): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (from === to) return amount;
  if (from in VOLUME_ML && to in VOLUME_ML) return (amount * VOLUME_ML[from]) / VOLUME_ML[to];
  if (from in MASS_G && to in MASS_G) return (amount * MASS_G[from]) / MASS_G[to];
  return null;
}

export const KITCHEN_UNITS = ["", "tsp", "tbsp", "cups", "ml", "l", "g", "kg", "oz", "lb"];
