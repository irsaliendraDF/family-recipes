import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DAYS, SLOTS, type ScaleFactor } from "../types";
import { newId, useStore } from "../data/store";
import { Card, PageHeading, buttonPrimary, buttonSecondary } from "../components/ui";

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

      <PantryDoor />

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

/**
 * The pantry door. It swings on its hinge and, once it has finished swinging, walks you
 * into the pantry itself. The doorway behind it is dark and warm, so what shows while
 * the door moves is the room, not the page underneath.
 */
function PantryDoor() {
  const navigate = useNavigate();
  const [swinging, setSwinging] = useState(false);

  // The swing is what walks her through, so the walk cannot depend on it. Someone with
  // reduced motion turned on gets no transition and therefore no transition end, and a
  // hidden or backgrounded tab does not animate either. This gets her in regardless.
  useEffect(() => {
    if (!swinging) return;
    const timer = setTimeout(() => navigate("/pantry"), 700);
    return () => clearTimeout(timer);
  }, [swinging, navigate]);

  return (
    <div className="mt-8">
      <div className="pantry-door-wrap relative">
        <div className="pantry-doorway absolute inset-0 flex items-center justify-center">
          <span className="font-script text-2xl text-[#f3dfae]/80">step inside</span>
        </div>
        <button
          className={`pantry-door relative z-10 w-full p-6 text-left ${swinging ? "open" : ""}`}
          onClick={() => setSwinging(true)}
          aria-label="Open the pantry door"
        >
          <span className="block rounded border-2 border-gold-soft/70 bg-[#3d2413]/40 px-4 py-2 text-center">
            <span className="font-script text-3xl text-gold-soft">The Pantry</span>
            <span className="block text-xs font-bold text-[#e8d5a8]">
              {swinging ? "opening..." : "tap to open the door"}
            </span>
          </span>
          <span className="absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gold-soft shadow" aria-hidden />
        </button>
      </div>
    </div>
  );
}

