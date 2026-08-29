import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { MealPlan, ScaleFactor } from "../types";
import { useStore } from "../data/store";
import { buildGroceryList } from "../lib/cost";
import { formatCad } from "../lib/fractions";
import { normalizeName } from "../lib/units";
import { Badge, Card, PageHeading, buttonSecondary } from "../components/ui";

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, upsertPlan, deletePlan } = useStore();
  const [picking, setPicking] = useState(false);

  const plan = data.plans.find((p) => p.id === id);
  if (!plan) return <Card>This plan is gone. It may have been deleted.</Card>;

  const list = buildGroceryList(plan, data.recipes, data.pantry);
  const checked = new Set(plan.checkedNames.map(normalizeName));
  const have = new Set(plan.haveNames.map(normalizeName));

  function update(patch: Partial<MealPlan>) {
    upsertPlan({ ...plan!, ...patch, updatedAt: new Date().toISOString() });
  }

  function toggle(listName: "checkedNames" | "haveNames", name: string) {
    const current = plan![listName].map(normalizeName);
    const key = normalizeName(name);
    update({
      [listName]: current.includes(key) ? plan![listName].filter((n) => normalizeName(n) !== key) : [...plan![listName], name],
    });
  }

  const shopping = plan.status === "shopping";
  const toBuy = list.entries.filter((e) => !have.has(normalizeName(e.name)));
  const bought = toBuy.filter((e) => checked.has(normalizeName(e.name)));

  return (
    <div>
      <PageHeading sub={`${plan.items.length} ${plan.items.length === 1 ? "recipe" : "recipes"} in this plan`}>{plan.name}</PageHeading>

      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {(["planning", "shopping", "done"] as const).map((s) => (
          <button
            key={s}
            onClick={() => update({ status: s })}
            className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize ${plan.status === s ? "bg-rose text-white" : "bg-blush text-rose-deep"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {!shopping && (
        <Card className="mb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recipes</h2>
            <button className={buttonSecondary} onClick={() => setPicking(!picking)}>
              {picking ? "Done picking" : "Add recipes"}
            </button>
          </div>

          {plan.items.length === 0 && !picking && <p className="mt-2 text-sm text-plum-soft">Nothing picked yet.</p>}

          <ul className="mt-2 space-y-2">
            {plan.items.map((item, idx) => {
              const recipe = data.recipes.find((r) => r.id === item.recipeId);
              if (!recipe) return null;
              return (
                <li key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-parchment/50 p-2">
                  <Link to={`/recipe/${recipe.id}`} className="font-bold">
                    {recipe.title}
                  </Link>
                  <div className="flex items-center gap-1">
                    {([0.5, 1, 2] as ScaleFactor[]).map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          update({ items: plan.items.map((it, i) => (i === idx ? { ...it, scale: s } : it)) })
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.scale === s ? "bg-lavender text-white" : "bg-lavender-soft text-lavender"}`}
                      >
                        {s === 0.5 ? "½x" : `${s}x`}
                      </button>
                    ))}
                    <button
                      className="ml-1 px-1 font-bold text-plum-soft"
                      onClick={() => update({ items: plan.items.filter((_, i) => i !== idx) })}
                      aria-label="Remove from plan"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {picking && (
            <div className="mt-3 space-y-2 border-t border-parchment pt-3">
              {data.recipes
                .filter((r) => !plan.items.some((i) => i.recipeId === r.id))
                .map((r) => (
                  <button
                    key={r.id}
                    className="block w-full rounded-xl bg-blush/60 p-2 text-left font-bold text-rose-deep"
                    onClick={() => update({ items: [...plan.items, { recipeId: r.id, scale: 1 }] })}
                  >
                    + {r.title}
                  </button>
                ))}
            </div>
          )}
        </Card>
      )}

      <Card className="border-gold bg-gold-soft/20">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold">Grocery list</h2>
          {shopping && (
            <span className="text-sm font-bold text-plum-soft">
              {bought.length}/{toBuy.length}
            </span>
          )}
        </div>
        {list.totalCad > 0 && (
          <p className="mt-1 text-2xl font-bold text-gold">
            approx {formatCad(list.totalCad)}
            {list.hasSamplePrices && <span className="ml-2 text-xs font-normal">(sample prices, not real)</span>}
          </p>
        )}
        {list.excludedNames.length > 0 && (
          <p className="mt-1 text-xs text-plum-soft">Not in the total (price needed): {list.excludedNames.join(", ")}</p>
        )}

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
                <li
                  key={entry.name}
                  className={`rounded-xl p-3 ${isChecked || isHave ? "bg-parchment/40 opacity-60" : "bg-white"}`}
                >
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
                        {entry.packages !== null && entry.item
                          ? `${entry.packages} × ${entry.item.packageLabel}`
                          : "amount as needed"}
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
        {list.entries.length === 0 && <p className="mt-2 text-sm text-plum-soft">Pick recipes and the list builds itself.</p>}
      </Card>

      <div className="mt-5 text-center">
        <button
          className="font-bold text-plum-soft"
          onClick={() => {
            if (confirm(`Delete the plan "${plan.name}"?`)) {
              deletePlan(plan.id);
              navigate("/plans");
            }
          }}
        >
          Delete this plan
        </button>
      </div>
    </div>
  );
}
