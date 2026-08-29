import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData, MealPlan, PantryItem, Recipe, Suggestion } from "../types";
import { SEED } from "./seed";
import { normalizeName } from "../lib/units";

/**
 * Data layer. Persists to localStorage for now; Phase 5 swaps this file's
 * load/save for Supabase without touching the screens.
 */
const STORAGE_KEY = "family-recipes-data";

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    /* fall through to seed */
  }
  return SEED;
}

interface StoreApi {
  data: AppData;
  upsertRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  upsertPantryItem: (item: PantryItem) => void;
  deletePantryItem: (id: string) => void;
  upsertPlan: (plan: MealPlan) => void;
  deletePlan: (id: string) => void;
  promoteSuggestion: (id: string) => Recipe | undefined;
  dismissSuggestion: (id: string) => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function newId(): string {
  return crypto.randomUUID();
}

/** Every recipe ingredient gets a pantry item so the price worklist is complete. */
function ensurePantryItems(pantry: PantryItem[], recipe: Recipe): PantryItem[] {
  const known = new Set(pantry.map((p) => normalizeName(p.name)));
  const additions = recipe.ingredients
    .filter((line) => line.name.trim() && !known.has(normalizeName(line.name)))
    .map((line) => ({
      id: newId(),
      name: line.name.trim(),
      packageLabel: "no price yet",
      priceCad: null,
    }));
  return additions.length ? [...pantry, ...additions] : pantry;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable; app still works for the session */
    }
  }, [data]);

  const api = useMemo<StoreApi>(
    () => ({
      data,
      upsertRecipe: (recipe) =>
        setData((d) => ({
          ...d,
          recipes: d.recipes.some((r) => r.id === recipe.id)
            ? d.recipes.map((r) => (r.id === recipe.id ? recipe : r))
            : [...d.recipes, recipe],
          pantry: ensurePantryItems(d.pantry, recipe),
        })),
      deleteRecipe: (id) => setData((d) => ({ ...d, recipes: d.recipes.filter((r) => r.id !== id) })),
      upsertPantryItem: (item) =>
        setData((d) => ({
          ...d,
          pantry: d.pantry.some((p) => p.id === item.id)
            ? d.pantry.map((p) => (p.id === item.id ? item : p))
            : [...d.pantry, item],
        })),
      deletePantryItem: (id) => setData((d) => ({ ...d, pantry: d.pantry.filter((p) => p.id !== id) })),
      upsertPlan: (plan) =>
        setData((d) => ({
          ...d,
          plans: d.plans.some((p) => p.id === plan.id) ? d.plans.map((p) => (p.id === plan.id ? plan : p)) : [...d.plans, plan],
        })),
      deletePlan: (id) => setData((d) => ({ ...d, plans: d.plans.filter((p) => p.id !== id) })),
      promoteSuggestion: (id) => {
        const s = data.suggestions.find((x) => x.id === id);
        if (!s) return undefined;
        const now = new Date().toISOString();
        const recipe: Recipe = {
          id: newId(),
          title: s.title.replace(/^SAMPLE: /, ""),
          story: `Adapted from a smart recipe suggestion. ${s.reason}`,
          category: s.category,
          servings: s.servings,
          tags: ["from suggestion"],
          ingredients: s.ingredients,
          steps: s.steps,
          fromSuggestion: true,
          createdAt: now,
          updatedAt: now,
        };
        setData((d) => ({
          ...d,
          recipes: [...d.recipes, recipe],
          pantry: ensurePantryItems(d.pantry, recipe),
          suggestions: d.suggestions.filter((x) => x.id !== id),
        }));
        return recipe;
      },
      dismissSuggestion: (id) =>
        setData((d) => ({
          ...d,
          suggestions: d.suggestions.map((s) => (s.id === id ? { ...s, status: "dismissed" as const } : s)),
        })),
    }),
    [data],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export type { Suggestion };
