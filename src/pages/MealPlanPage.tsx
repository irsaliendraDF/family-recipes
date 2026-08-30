import { useState } from "react";
import { DAYS, SLOTS, type PantryItem, type ScaleFactor } from "../types";
import { newId, useStore } from "../data/store";
import { buildGroceryList } from "../lib/cost";
import { formatCad } from "../lib/fractions";
import { normalizeName } from "../lib/units";
import { Badge, Card, PageHeading, PriceProvenance, buttonPrimary, buttonSecondary } from "../components/ui";
import { PantryEditor } from "../components/PantryEditor";

const NEXT_SCALE: Record<string, ScaleFactor> = { "1": 2, "2": 0.5, "0.5": 1 };
const CATEGORY_FILTERS = ["All", "Breakfast", "Lunch", "Dinner", "Side", "Dessert", "Snack", "Baking"];

/** The household the plan feeds. */
const FAMILY_SIZE = 2;

/** "makes 12, about 6 meals for 2". Silent when a recipe's servings are per batch, not per person. */
function servingsHint(servings: number, scale: ScaleFactor = 1): string {
  const total = servings * scale;
  if (total < FAMILY_SIZE) return "";
  return `makes ${total}, about ${Math.floor(total / FAMILY_SIZE)} ${Math.floor(total / FAMILY_SIZE) === 1 ? "meal" : "meals"} for ${FAMILY_SIZE}`;
}

export default function MealPlanPage() {
  const { data, upsertPlan } = useStore();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [trayFilter, setTrayFilter] = useState("All");

  const plan = data.plans.filter((p) => p.status !== "done").at(-1);

  function startWeek() {
    const now = new Date().toISOString();
    upsertPlan({
      id: newId(),
      name: `Week of ${new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`,
      items: [],
      status: "planning",
      checkedNames: [],
      haveNames: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  /** One batch fills the days it can feed: 12 muffins for 2 covers about 6 breakfasts in a row. */
  function place(recipeId: string, day: string, slot: string) {
    if (!plan) return;
    const recipe = data.recipes.find((r) => r.id === recipeId);
    const groupId = newId();
    const items = [{ recipeId, scale: 1 as ScaleFactor, day, slot, groupId }];
    const meals = recipe ? Math.floor(recipe.servings / FAMILY_SIZE) : 0;
    const start = DAYS.indexOf(day as (typeof DAYS)[number]);
    for (let i = 1; i < meals && start + i < DAYS.length; i++) {
      items.push({ recipeId, scale: 1 as ScaleFactor, day: DAYS[start + i], slot, groupId, carryover: true } as (typeof items)[number]);
    }
    upsertPlan({ ...plan, items: [...plan.items, ...items], updatedAt: new Date().toISOString() });
    setSelectedRecipeId(null);
  }

  /** Removing the batch itself takes its carried-over days with it; removing a carried day removes just that day. */
  function removeItem(index: number) {
    if (!plan) return;
    const target = plan.items[index];
    const items =
      target && !target.carryover && target.groupId
        ? plan.items.filter((it, i) => i !== index && it.groupId !== target.groupId)
        : plan.items.filter((_, i) => i !== index);
    upsertPlan({ ...plan, items, updatedAt: new Date().toISOString() });
  }

  function cycleScale(index: number) {
    if (!plan) return;
    upsertPlan({
      ...plan,
      items: plan.items.map((it, i) => (i === index ? { ...it, scale: NEXT_SCALE[String(it.scale)] } : it)),
      updatedAt: new Date().toISOString(),
    });
  }

  const trayRecipes = data.recipes.filter((r) => trayFilter === "All" || r.category === trayFilter);

  if (!plan)
    return (
      <div>
        <PageHeading sub="Plan the week, then shop it in one trip">Meal Plan</PageHeading>
        <Card className="p-6 text-center">
          <p className="text-plum-soft">No week in progress.</p>
          <button className={`${buttonPrimary} mt-4`} onClick={startWeek}>
            Begin this week's plan
          </button>
        </Card>
      </div>
    );

  return (
    <div>
      <PageHeading sub="Drag a recipe to a meal slot, or tap the recipe then tap the slot">{plan.name}</PageHeading>

      <Card className="mb-4 p-3">
        <p className="text-sm font-bold text-plum-soft">The recipe shelf</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setTrayFilter(c)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${trayFilter === c ? "bg-rose text-white" : "bg-blush text-rose-deep"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
          {trayRecipes.length === 0 && <p className="text-sm text-plum-soft">No recipes tagged {trayFilter} yet.</p>}
          {trayRecipes.map((r) => (
            <button
              key={r.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/recipe-id", r.id)}
              onClick={() => setSelectedRecipeId(selectedRecipeId === r.id ? null : r.id)}
              className={`shrink-0 cursor-grab rounded-lg border px-3 py-2 text-left text-sm font-bold transition-colors ${
                selectedRecipeId === r.id ? "border-rose bg-rose text-white" : "border-gold-soft bg-white/80 text-plum"
              }`}
            >
              {r.title}
              <span className={`block text-xs font-normal ${selectedRecipeId === r.id ? "text-blush" : "text-plum-soft"}`}>
                {r.category}
                {servingsHint(r.servings) && ` · ${servingsHint(r.servings)}`}
              </span>
            </button>
          ))}
        </div>
        {selectedRecipeId && <p className="text-xs font-bold text-rose-deep">Now tap the meal slot where it belongs.</p>}
      </Card>

      <div className="space-y-3">
        {DAYS.map((day) => (
          <Card key={day} className="p-3">
            <p className="font-display text-lg font-bold text-rose-deep">{day}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SLOTS.map((slot) => {
                const cellItems = plan.items
                  .map((it, index) => ({ ...it, index }))
                  .filter((it) => it.day === day && it.slot === slot);
                return (
                  <div
                    key={slot}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const id = e.dataTransfer.getData("text/recipe-id");
                      if (id) place(id, day, slot);
                    }}
                    onClick={() => selectedRecipeId && place(selectedRecipeId, day, slot)}
                    className={`min-h-16 rounded-lg border border-dashed p-1.5 transition-colors ${
                      selectedRecipeId ? "cursor-pointer border-rose bg-blush/40" : "border-gold-soft bg-white/50"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wide text-plum-soft">{slot}</p>
                    {cellItems.map((it) => {
                      const recipe = data.recipes.find((r) => r.id === it.recipeId);
                      if (!recipe) return null;
                      return (
                        <div
                          key={it.index}
                          className={`mt-1 flex items-center gap-1 rounded px-1.5 py-1 ${it.carryover ? "bg-lavender-soft/40" : "bg-lavender-soft"}`}
                        >
                          <button
                            className={`min-w-0 flex-1 truncate text-left text-xs font-bold ${it.carryover ? "text-plum-soft" : "text-plum"}`}
                            title={
                              it.carryover
                                ? `${recipe.title}, same batch carried over`
                                : `${recipe.title}, tap to change amount. ${servingsHint(recipe.servings, it.scale)}`
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!it.carryover) cycleScale(it.index);
                            }}
                          >
                            {recipe.title}
                            {it.carryover ? (
                              <span className="ml-1 font-normal text-lavender">same batch</span>
                            ) : (
                              <span className="ml-1 text-lavender">{it.scale === 0.5 ? "½x" : `${it.scale}x`}</span>
                            )}
                          </button>
                          <button
                            className="shrink-0 text-xs font-bold text-plum-soft"
                            aria-label={`Remove ${recipe.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(it.index);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <PantrySection planId={plan.id} />

      <div className="mt-6 text-center">
        <button
          className={buttonSecondary}
          onClick={() => {
            if (confirm(`Finish "${plan.name}"? A fresh week can start after.`)) {
              upsertPlan({ ...plan, status: "done", updatedAt: new Date().toISOString() });
            }
          }}
        >
          Finish this week
        </button>
      </div>
    </div>
  );
}

/** The pantry lives behind its door: the grocery list for the week, then every ingredient and its price. */
function PantrySection({ planId }: { planId: string }) {
  const { data, upsertPlan, upsertPantryItem, deletePantryItem } = useStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const plan = data.plans.find((p) => p.id === planId);
  if (!plan) return null;

  const list = buildGroceryList(plan, data.recipes, data.pantry);
  const checked = new Set(plan.checkedNames.map(normalizeName));
  const have = new Set(plan.haveNames.map(normalizeName));

  function toggle(listName: "checkedNames" | "haveNames", name: string) {
    if (!plan) return;
    const key = normalizeName(name);
    const current = plan[listName].map(normalizeName);
    upsertPlan({
      ...plan,
      [listName]: current.includes(key) ? plan[listName].filter((n) => normalizeName(n) !== key) : [...plan[listName], name],
      updatedAt: new Date().toISOString(),
    });
  }

  const usedIn = (item: PantryItem) =>
    data.recipes.filter((r) => r.ingredients.some((i) => normalizeName(i.name) === normalizeName(item.name))).length;

  const sortedPantry = [...data.pantry].sort((a, b) => {
    const aNeeds = a.priceCad === null ? 0 : 1;
    const bNeeds = b.priceCad === null ? 0 : 1;
    if (aNeeds !== bNeeds) return aNeeds - bNeeds;
    return (a.lastChecked ?? "") < (b.lastChecked ?? "") ? -1 : 1;
  });
  const needCount = data.pantry.filter((p) => p.priceCad === null).length;

  return (
    <div className="mt-6">
      <div className="pantry-door-wrap relative">
        <button className={`pantry-door relative z-10 w-full p-6 text-left ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
          <span className="block rounded border-2 border-gold-soft/70 bg-[#3d2413]/40 px-4 py-2 text-center">
            <span className="font-script text-3xl text-gold-soft">The Pantry</span>
            <span className="block text-xs font-bold text-[#e8d5a8]">{open ? "tap to close the door" : "tap to open the door"}</span>
          </span>
          <span className="absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gold-soft shadow" aria-hidden />
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-4">
          <Card className="border-gold bg-gold-soft/20 p-4">
            <h2 className="font-display text-xl font-bold">This week's groceries</h2>
            {list.totalCad > 0 && (
              <p className="mt-1 text-2xl font-bold text-gold">
                approx {formatCad(list.totalCad)}
                {list.hasSamplePrices && <span className="ml-2 text-xs font-normal">(sample prices, not real)</span>}
              </p>
            )}
            {list.excludedNames.length > 0 && (
              <p className="mt-1 text-xs text-plum-soft">Not in the total (price needed): {list.excludedNames.join(", ")}</p>
            )}
            {list.entries.length === 0 && <p className="mt-2 text-sm text-plum-soft">Place recipes in the week and the list fills itself.</p>}
            <ul className="mt-3 space-y-2">
              {[...list.entries]
                .sort((a, b) => {
                  const aDone = checked.has(normalizeName(a.name)) || have.has(normalizeName(a.name)) ? 1 : 0;
                  const bDone = checked.has(normalizeName(b.name)) || have.has(normalizeName(b.name)) ? 1 : 0;
                  return aDone - bDone || a.name.localeCompare(b.name);
                })
                .map((entry) => {
                  const key = normalizeName(entry.name);
                  const isHave = have.has(key);
                  const isChecked = checked.has(key);
                  return (
                    <li key={entry.name} className={`rounded-xl p-3 ${isChecked || isHave ? "bg-parchment/60 opacity-60" : "bg-white/80"}`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggle("checkedNames", entry.name)}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold ${
                            isChecked ? "border-gold bg-gold text-white" : "border-gold-soft text-transparent"
                          }`}
                          aria-label={`Check off ${entry.name}`}
                        >
                          ✓
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`font-bold capitalize ${isChecked ? "line-through" : ""}`}>{entry.name}</p>
                          <p className="truncate text-xs text-plum-soft">
                            {entry.packages !== null && entry.item ? `${entry.packages} × ${entry.item.packageLabel}` : "amount as needed"}
                            {" · "}
                            {entry.usedIn.join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          {entry.costCad !== null ? (
                            <p className="font-bold text-gold">{formatCad(entry.costCad)}</p>
                          ) : (
                            <Badge tone="rose">price needed</Badge>
                          )}
                          <button className="mt-1 block text-xs font-bold text-lavender" onClick={() => toggle("haveNames", entry.name)}>
                            {isHave ? "need it after all" : "have it"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </Card>

          <Card className="p-4">
            <h2 className="font-display text-xl font-bold">Every ingredient on the shelves</h2>
            {needCount > 0 && (
              <p className="mt-1 text-sm text-plum-soft">
                <strong>{needCount}</strong> {needCount === 1 ? "needs" : "need"} a Walmart price. Ask Claude to look them up, or tap one to
                enter it yourself.
              </p>
            )}
            <div className="mt-3 space-y-2">
              {sortedPantry.map((item) =>
                editingId === item.id ? (
                  <PantryEditor
                    key={item.id}
                    item={item}
                    onSave={(updated) => {
                      upsertPantryItem(updated);
                      setEditingId(null);
                    }}
                    onDelete={() => {
                      deletePantryItem(item.id);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <button
                    key={item.id}
                    className="block w-full rounded-lg border border-gold-soft/60 bg-white/70 p-2.5 text-left"
                    onClick={() => setEditingId(item.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-bold capitalize">{item.name}</p>
                        <p className="truncate text-xs text-plum-soft">{item.packageLabel}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        {item.priceCad !== null ? (
                          <p className="font-bold text-gold">{formatCad(item.priceCad)}</p>
                        ) : (
                          <Badge tone="rose">price needed</Badge>
                        )}
                        <div className="text-xs">
                          <PriceProvenance item={item} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-plum-soft">
                      in {usedIn(item)} {usedIn(item) === 1 ? "recipe" : "recipes"}
                    </p>
                  </button>
                ),
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
