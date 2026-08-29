export type ScaleFactor = 0.5 | 1 | 2;

export interface IngredientLine {
  id: string;
  name: string;
  /** Original amount in recipe units. null means "to taste" or unmeasured. */
  amount: number | null;
  /** Recipe unit, e.g. "cups". Empty string means a count, e.g. 2 eggs. */
  unit: string;
  note?: string;
}

export interface Recipe {
  id: string;
  title: string;
  story?: string;
  category: string;
  /** Original servings. Never overwritten by scaling. */
  servings: number;
  prepMin?: number;
  cookMin?: number;
  tags: string[];
  ingredients: IngredientLine[];
  steps: string[];
  fromSuggestion?: boolean;
  isSample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PriceSource = "walmart" | "irene" | "sample";

export interface PantryItem {
  id: string;
  /** Matched to recipe ingredients by name, case-insensitive. */
  name: string;
  /** The buyable package, e.g. "2.5 kg bag". */
  packageLabel: string;
  priceCad: number | null;
  priceSource?: PriceSource;
  /** ISO date the price was last looked up or edited. */
  lastChecked?: string;
  /** How much recipe-measurable content one package holds, e.g. 17 cups. */
  perPackage?: { amount: number; unit: string };
  isSample?: boolean;
}

export interface PlanItem {
  recipeId: string;
  scale: ScaleFactor;
  day?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  items: PlanItem[];
  status: "planning" | "shopping" | "done";
  /** Ingredient names checked off in the store. */
  checkedNames: string[];
  /** Ingredient names already at home, excluded from the total. */
  haveNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Suggestion {
  id: string;
  title: string;
  reason: string;
  usesFromPantry: string[];
  extrasNeeded: string[];
  category: string;
  servings: number;
  ingredients: IngredientLine[];
  steps: string[];
  status: "new" | "dismissed";
  isSample?: boolean;
  createdAt: string;
}

export interface AppData {
  recipes: Recipe[];
  pantry: PantryItem[];
  plans: MealPlan[];
  suggestions: Suggestion[];
}
