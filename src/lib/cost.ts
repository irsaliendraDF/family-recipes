import type { IngredientLine, MealPlan, PantryItem, Recipe, ScaleFactor } from "../types";
import { convertAmount, normalizeName } from "./units";

export function findPantryItem(pantry: PantryItem[], ingredientName: string): PantryItem | undefined {
  const target = normalizeName(ingredientName);
  return pantry.find((p) => normalizeName(p.name) === target);
}

export interface LineCost {
  line: IngredientLine;
  item?: PantryItem;
  /** Fraction of one package this line consumes, when computable. */
  packageFraction: number | null;
  costCad: number | null;
  reason?: "no pantry item" | "price needed" | "package size needed" | "units not convertible" | "unmeasured";
}

export function costLine(line: IngredientLine, pantry: PantryItem[], scale: ScaleFactor): LineCost {
  const item = findPantryItem(pantry, line.name);
  if (!item) return { line, packageFraction: null, costCad: null, reason: "no pantry item" };
  if (line.amount === null) return { line, item, packageFraction: null, costCad: null, reason: "unmeasured" };
  if (item.priceCad === null) return { line, item, packageFraction: null, costCad: null, reason: "price needed" };
  // Priced, but nothing says how much the package holds, so a share of it cannot be worked out.
  if (!item.perPackage) return { line, item, packageFraction: null, costCad: null, reason: "package size needed" };
  const inPackageUnits = convertAmount(line.amount * scale, line.unit, item.perPackage.unit);
  if (inPackageUnits === null)
    return { line, item, packageFraction: null, costCad: null, reason: "units not convertible" };
  const fraction = inPackageUnits / item.perPackage.amount;
  return { line, item, packageFraction: fraction, costCad: fraction * item.priceCad };
}

export interface RecipeCost {
  totalCad: number;
  lines: LineCost[];
  excluded: LineCost[];
  hasSamplePrices: boolean;
}

export function costRecipe(recipe: Recipe, pantry: PantryItem[], scale: ScaleFactor): RecipeCost {
  const lines = recipe.ingredients.map((line) => costLine(line, pantry, scale));
  const priced = lines.filter((l) => l.costCad !== null);
  return {
    totalCad: priced.reduce((sum, l) => sum + (l.costCad ?? 0), 0),
    lines,
    excluded: lines.filter((l) => l.costCad === null),
    hasSamplePrices: priced.some((l) => l.item?.priceSource === "sample"),
  };
}

export interface GroceryEntry {
  name: string;
  item?: PantryItem;
  /** Packages to buy: the ceiling of total need across the plan. */
  packages: number | null;
  costCad: number | null;
  usedIn: string[];
  /** Lines that could not be costed, shown so the list stays honest. */
  uncosted: LineCost[];
}

export interface GroceryList {
  entries: GroceryEntry[];
  totalCad: number;
  excludedNames: string[];
  hasSamplePrices: boolean;
}

export function buildGroceryList(plan: MealPlan, recipes: Recipe[], pantry: PantryItem[]): GroceryList {
  const byName = new Map<string, { display: string; fraction: number; usedIn: Set<string>; uncosted: LineCost[]; item?: PantryItem }>();

  for (const planItem of plan.items) {
    if (planItem.carryover) continue;
    const recipe = recipes.find((r) => r.id === planItem.recipeId);
    if (!recipe) continue;
    for (const line of recipe.ingredients) {
      const key = normalizeName(line.name);
      const entry = byName.get(key) ?? { display: line.name, fraction: 0, usedIn: new Set<string>(), uncosted: [] };
      entry.usedIn.add(recipe.title);
      const costed = costLine(line, pantry, planItem.scale);
      entry.item = entry.item ?? costed.item;
      if (costed.packageFraction !== null) entry.fraction += costed.packageFraction;
      else entry.uncosted.push(costed);
      byName.set(key, entry);
    }
  }

  const have = new Set(plan.haveNames.map(normalizeName));
  const entries: GroceryEntry[] = [...byName.entries()].map(([, e]) => {
    const canCost = e.fraction > 0 && e.item?.priceCad != null;
    const packages = canCost ? Math.max(1, Math.ceil(e.fraction - 0.001)) : null;
    return {
      name: e.display,
      item: e.item,
      packages,
      costCad: packages !== null && e.item?.priceCad != null ? packages * e.item.priceCad : null,
      usedIn: [...e.usedIn],
      uncosted: e.uncosted,
    };
  });

  entries.sort((a, b) => a.name.localeCompare(b.name));
  const counted = entries.filter((e) => e.costCad !== null && !have.has(normalizeName(e.name)));
  return {
    entries,
    totalCad: counted.reduce((sum, e) => sum + (e.costCad ?? 0), 0),
    excludedNames: entries.filter((e) => e.costCad === null).map((e) => e.name),
    hasSamplePrices: entries.some((e) => e.item?.priceSource === "sample" && e.costCad !== null),
  };
}
