import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IngredientLine, Recipe } from "../types";
import { newId, useStore } from "../data/store";
import { KITCHEN_UNITS } from "../lib/units";
import { Card, PageHeading, buttonPrimary, buttonSecondary, inputClass } from "../components/ui";

interface IngredientDraft {
  id: string;
  amount: string;
  unit: string;
  name: string;
  note: string;
}

function toDraft(line: IngredientLine): IngredientDraft {
  return { id: line.id, amount: line.amount === null ? "" : String(line.amount), unit: line.unit, name: line.name, note: line.note ?? "" };
}

function emptyLine(): IngredientDraft {
  return { id: newId(), amount: "", unit: "", name: "", note: "" };
}

export default function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, upsertRecipe } = useStore();
  const existing = data.recipes.find((r) => r.id === id);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [story, setStory] = useState(existing?.story ?? "");
  const [category, setCategory] = useState(existing?.category ?? "Dinner");
  const [servings, setServings] = useState(existing ? String(existing.servings) : "4");
  const [prepMin, setPrepMin] = useState(existing?.prepMin != null ? String(existing.prepMin) : "");
  const [cookMin, setCookMin] = useState(existing?.cookMin != null ? String(existing.cookMin) : "");
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    existing ? existing.ingredients.map(toDraft) : [emptyLine(), emptyLine(), emptyLine()],
  );
  const [stepsText, setStepsText] = useState(existing ? existing.steps.join("\n") : "");
  const [error, setError] = useState("");

  function updateLine(lineId: string, patch: Partial<IngredientDraft>) {
    setIngredients((lines) => lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)));
  }

  function save() {
    const cleanLines = ingredients.filter((l) => l.name.trim());
    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!title.trim() || cleanLines.length === 0 || steps.length === 0) {
      setError("A recipe needs a title, at least one ingredient, and at least one step.");
      return;
    }
    const now = new Date().toISOString();
    const recipe: Recipe = {
      id: existing?.id ?? newId(),
      title: title.trim(),
      story: story.trim() || undefined,
      category: category.trim() || "Dinner",
      servings: Math.max(1, Number(servings) || 1),
      prepMin: prepMin.trim() ? Number(prepMin) : undefined,
      cookMin: cookMin.trim() ? Number(cookMin) : undefined,
      tags: existing?.tags ?? [],
      ingredients: cleanLines.map((l) => ({
        id: l.id,
        name: l.name.trim(),
        amount: l.amount.trim() === "" ? null : Number(l.amount),
        unit: l.unit,
        note: l.note.trim() || undefined,
      })),
      steps,
      fromSuggestion: existing?.fromSuggestion,
      isSample: existing?.isSample,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    upsertRecipe(recipe);
    navigate(`/recipe/${recipe.id}`);
  }

  return (
    <div>
      <PageHeading>{existing ? "Edit Recipe" : "New Recipe"}</PageHeading>

      <Card className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-plum-soft">Title</span>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Grandma's Sunday Stew" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-plum-soft">Story (optional)</span>
          <input className={inputClass} value={story} onChange={(e) => setStory(e.target.value)} placeholder="Where it came from, why it's loved" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-plum-soft">Category</span>
            <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} list="categories" />
            <datalist id="categories">
              {["Breakfast", "Lunch", "Dinner", "Side", "Dessert", "Snack", "Baking"].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-plum-soft">Servings</span>
            <input className={inputClass} type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-plum-soft">Prep (min)</span>
            <input className={inputClass} type="number" min="0" value={prepMin} onChange={(e) => setPrepMin(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-plum-soft">Cook (min)</span>
            <input className={inputClass} type="number" min="0" value={cookMin} onChange={(e) => setCookMin(e.target.value)} />
          </label>
        </div>
      </Card>

      <Card className="mt-3">
        <h2 className="font-display text-xl font-bold">Ingredients</h2>
        <p className="text-xs text-plum-soft">Leave amount blank for "to taste". Unit blank means a count, like 2 eggs.</p>
        <div className="mt-3 space-y-3">
          {ingredients.map((line) => (
            <div key={line.id} className="rounded-xl bg-parchment/50 p-2">
              <div className="flex gap-2">
                <input
                  className={`${inputClass} w-20`}
                  inputMode="decimal"
                  placeholder="2"
                  value={line.amount}
                  onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                />
                <select className={`${inputClass} w-24`} value={line.unit} onChange={(e) => updateLine(line.id, { unit: e.target.value })}>
                  {KITCHEN_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u === "" ? "count" : u}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  placeholder="ingredient"
                  value={line.name}
                  onChange={(e) => updateLine(line.id, { name: e.target.value })}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  className={inputClass}
                  placeholder="note, like softened or a pinch"
                  value={line.note}
                  onChange={(e) => updateLine(line.id, { note: e.target.value })}
                />
                <button
                  type="button"
                  className="shrink-0 px-2 font-bold text-plum-soft"
                  onClick={() => setIngredients((lines) => lines.filter((l) => l.id !== line.id))}
                  aria-label="Remove ingredient"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className={`${buttonSecondary} mt-3`} onClick={() => setIngredients((lines) => [...lines, emptyLine()])}>
          Add ingredient
        </button>
      </Card>

      <Card className="mt-3">
        <h2 className="font-display text-xl font-bold">Steps</h2>
        <p className="text-xs text-plum-soft">One step per line.</p>
        <textarea
          className={`${inputClass} mt-2 min-h-40`}
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          placeholder={"Preheat the oven to 350 F.\nMix the dry ingredients."}
        />
      </Card>

      {error && <p className="mt-3 text-center font-bold text-rose-deep">{error}</p>}

      <div className="mt-5 flex justify-center gap-3">
        <button className={buttonPrimary} onClick={save}>
          Save recipe
        </button>
        <button className={buttonSecondary} onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
