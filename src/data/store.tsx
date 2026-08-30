import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppData, MealPlan, PantryItem, Recipe, Suggestion } from "../types";
import { SEED } from "./seed";
import { normalizeName } from "../lib/units";
import { supabase } from "../lib/supabase";
import { SignIn } from "../components/SignIn";
import { Card } from "../components/ui";

/**
 * Data layer. Two modes:
 * - practice mode (no Supabase keys): everything in this browser's localStorage
 * - cloud mode: Supabase owns the data, sign-in required, phone and laptop share
 * The first cloud sign-in on a device imports that device's practice data.
 */
const STORAGE_KEY = "family-recipes-data";

const TABLE_OF = {
  recipes: "recipes",
  pantry: "pantry_items",
  plans: "meal_plans",
  suggestions: "suggestions",
} as const;

/** Timestamps that mark a stored seed recipe as never touched by Irene in the app. */
const PRISTINE_SEED_STAMPS = new Set(["2026-08-29T00:00:00.000Z", "2026-08-30T00:00:00.000Z"]);

/**
 * Recipes Irene hands to Claude ship inside the app. A device (or database)
 * that stored its data before those recipes existed picks them up here,
 * without touching anything she has added or deleted since. A stored seed
 * recipe she has never edited (its timestamp is still the original seed
 * stamp) refreshes when the seed carries a newer revision; one she has
 * edited is hers and stays exactly as she left it. Sample content is never
 * resurrected this way.
 */
function missingSeed(data: AppData): { recipes: Recipe[]; pantry: PantryItem[]; refreshed: Recipe[]; pricedPantry: PantryItem[] } {
  const knownRecipes = new Set(data.recipes.map((r) => r.id));
  const knownPantry = new Set(data.pantry.map((p) => normalizeName(p.name)));
  return {
    recipes: SEED.recipes.filter((r) => !r.isSample && !knownRecipes.has(r.id)),
    pantry: SEED.pantry.filter((p) => !p.isSample && !knownPantry.has(normalizeName(p.name))),
    refreshed: SEED.recipes.filter((r) => {
      const stored = data.recipes.find((x) => x.id === r.id);
      return stored && PRISTINE_SEED_STAMPS.has(stored.updatedAt) && stored.updatedAt !== r.updatedAt;
    }),
    // A stored item still waiting for a price fills in when the seed has one; a price she set herself is never touched.
    pricedPantry: SEED.pantry.filter((p) => {
      if (p.priceCad === null) return false;
      const stored = data.pantry.find((x) => normalizeName(x.name) === normalizeName(p.name));
      return !!stored && stored.priceCad === null;
    }),
  };
}

function withHerRecipes(data: AppData): AppData {
  const extra = missingSeed(data);
  if (extra.recipes.length === 0 && extra.pantry.length === 0 && extra.refreshed.length === 0 && extra.pricedPantry.length === 0)
    return data;
  const refreshedById = new Map(extra.refreshed.map((r) => [r.id, r]));
  const pricedByName = new Map(extra.pricedPantry.map((p) => [normalizeName(p.name), p]));
  return {
    ...data,
    recipes: [...data.recipes.map((r) => refreshedById.get(r.id) ?? r), ...extra.recipes],
    pantry: [
      ...data.pantry.map((p) => {
        const priced = pricedByName.get(normalizeName(p.name));
        return priced ? { ...priced, id: p.id } : p;
      }),
      ...extra.pantry,
    ],
  };
}

function loadLocal(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return withHerRecipes(JSON.parse(raw) as AppData);
  } catch {
    /* storage unavailable */
  }
  return null;
}

function remoteUpsert<T extends { id: string }>(table: string, rows: T[]) {
  if (!supabase || rows.length === 0) return;
  supabase
    .from(table)
    .upsert(rows.map((r) => ({ id: r.id, data: r, updated_at: new Date().toISOString() })))
    .then(({ error }) => {
      if (error) console.error(`sync failed for ${table}`, error);
    });
}

function remoteDelete(table: string, id: string) {
  if (!supabase) return;
  supabase
    .from(table)
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) console.error(`delete failed for ${table}`, error);
    });
}

interface StoreApi {
  data: AppData;
  cloud: boolean;
  signOut: () => void;
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
function pantryAdditions(pantry: PantryItem[], recipe: Recipe): PantryItem[] {
  const known = new Set(pantry.map((p) => normalizeName(p.name)));
  return recipe.ingredients
    .filter((line) => line.name.trim() && !known.has(normalizeName(line.name)))
    .map((line) => ({
      id: newId(),
      name: line.name.trim(),
      packageLabel: "no price yet",
      priceCad: null,
    }));
}

type Status = "loading" | "signedout" | "ready";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => (supabase ? { recipes: [], pantry: [], plans: [], suggestions: [] } : (loadLocal() ?? SEED)));
  const [status, setStatus] = useState<Status>(supabase ? "loading" : "ready");

  // Cloud mode: track the session and load everything once signed in.
  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;

    async function loadCloud() {
      const results = await Promise.all(
        Object.values(TABLE_OF).map((table) => sb.from(table).select("data").order("updated_at", { ascending: true })),
      );
      const failed = results.find((r) => r.error);
      if (failed) {
        console.error("could not load from Supabase", failed.error);
        return;
      }
      const [recipes, pantry, plans, suggestions] = results.map((r) => (r.data ?? []).map((row) => row.data));
      const empty = recipes.length + pantry.length + plans.length + suggestions.length === 0;
      if (empty) {
        // First ever sign-in: bring this device's practice data, or the sample.
        const initial = loadLocal() ?? SEED;
        remoteUpsert(TABLE_OF.recipes, initial.recipes);
        remoteUpsert(TABLE_OF.pantry, initial.pantry);
        remoteUpsert(TABLE_OF.plans, initial.plans);
        remoteUpsert(TABLE_OF.suggestions, initial.suggestions);
        setData(initial);
      } else {
        const current = { recipes, pantry, plans, suggestions } as AppData;
        const extra = missingSeed(current);
        const merged = withHerRecipes(current);
        remoteUpsert(TABLE_OF.recipes, [...extra.recipes, ...extra.refreshed]);
        const pricedNames = new Set(extra.pricedPantry.map((p) => normalizeName(p.name)));
        remoteUpsert(TABLE_OF.pantry, [...extra.pantry, ...merged.pantry.filter((p) => pricedNames.has(normalizeName(p.name)))]);
        setData(merged);
      }
      setStatus("ready");
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session) loadCloud();
      else setStatus("signedout");
    });
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      if (session) loadCloud();
      else setStatus("signedout");
    });
    return () => subscription.unsubscribe();
  }, []);

  // Practice mode keeps localStorage current; cloud mode does not touch it.
  useEffect(() => {
    if (supabase) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable; app still works for the session */
    }
  }, [data]);

  const api = useMemo<StoreApi>(
    () => ({
      data,
      cloud: !!supabase,
      signOut: () => supabase?.auth.signOut(),
      upsertRecipe: (recipe) => {
        const additions = pantryAdditions(data.pantry, recipe);
        setData((d) => ({
          ...d,
          recipes: d.recipes.some((r) => r.id === recipe.id)
            ? d.recipes.map((r) => (r.id === recipe.id ? recipe : r))
            : [...d.recipes, recipe],
          pantry: [...d.pantry, ...additions],
        }));
        remoteUpsert(TABLE_OF.recipes, [recipe]);
        remoteUpsert(TABLE_OF.pantry, additions);
      },
      deleteRecipe: (id) => {
        setData((d) => ({ ...d, recipes: d.recipes.filter((r) => r.id !== id) }));
        remoteDelete(TABLE_OF.recipes, id);
      },
      upsertPantryItem: (item) => {
        setData((d) => ({
          ...d,
          pantry: d.pantry.some((p) => p.id === item.id) ? d.pantry.map((p) => (p.id === item.id ? item : p)) : [...d.pantry, item],
        }));
        remoteUpsert(TABLE_OF.pantry, [item]);
      },
      deletePantryItem: (id) => {
        setData((d) => ({ ...d, pantry: d.pantry.filter((p) => p.id !== id) }));
        remoteDelete(TABLE_OF.pantry, id);
      },
      upsertPlan: (plan) => {
        setData((d) => ({
          ...d,
          plans: d.plans.some((p) => p.id === plan.id) ? d.plans.map((p) => (p.id === plan.id ? plan : p)) : [...d.plans, plan],
        }));
        remoteUpsert(TABLE_OF.plans, [plan]);
      },
      deletePlan: (id) => {
        setData((d) => ({ ...d, plans: d.plans.filter((p) => p.id !== id) }));
        remoteDelete(TABLE_OF.plans, id);
      },
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
        const additions = pantryAdditions(data.pantry, recipe);
        setData((d) => ({
          ...d,
          recipes: [...d.recipes, recipe],
          pantry: [...d.pantry, ...additions],
          suggestions: d.suggestions.filter((x) => x.id !== id),
        }));
        remoteUpsert(TABLE_OF.recipes, [recipe]);
        remoteUpsert(TABLE_OF.pantry, additions);
        remoteDelete(TABLE_OF.suggestions, id);
        return recipe;
      },
      dismissSuggestion: (id) => {
        const updated = data.suggestions.find((s) => s.id === id);
        setData((d) => ({
          ...d,
          suggestions: d.suggestions.map((s) => (s.id === id ? { ...s, status: "dismissed" as const } : s)),
        }));
        if (updated) remoteUpsert(TABLE_OF.suggestions, [{ ...updated, status: "dismissed" }]);
      },
    }),
    [data],
  );

  if (status === "signedout") return <SignIn />;
  if (status === "loading")
    return (
      <div className="px-4 pt-16">
        <Card className="text-center">
          <p className="font-script text-3xl text-lavender">One moment...</p>
          <p className="mt-1 text-sm text-plum-soft">Opening the recipe book</p>
        </Card>
      </div>
    );
  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export type { Suggestion };
