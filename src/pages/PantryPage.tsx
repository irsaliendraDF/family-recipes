import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PantryItem } from "../types";
import { useStore } from "../data/store";
import { buildGroceryList, type GroceryEntry } from "../lib/cost";
import { formatCad } from "../lib/fractions";
import { normalizeName } from "../lib/units";
import { Badge, PriceProvenance, buttonSecondary } from "../components/ui";
import { PantryEditor } from "../components/PantryEditor";

/**
 * Why a grocery line has no cost. An ingredient can be perfectly well priced and still
 * not count, because the recipe never said how much of it to use. Saying "price needed"
 * for both sends her looking up a price that is already in the book.
 */
function gapOf(entry: GroceryEntry): { label: string; tone: "rose" | "plain" } {
  const reasons = new Set(entry.uncosted.map((u) => u.reason));
  if (reasons.has("price needed") || reasons.has("no pantry item")) return { label: "price needed", tone: "rose" };
  if (reasons.has("package size needed")) return { label: "package size needed", tone: "plain" };
  if (reasons.has("units not convertible")) return { label: "units do not match", tone: "plain" };
  return { label: "no amount set", tone: "plain" };
}

/** How many jars stand on one shelf before a new plank starts. */
const PER_SHELF = 6;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Inside the pantry. Reached by opening the door on the meal plan, and meant to feel
 * like standing in the room rather than reading a list: warm boards, lit shelves, and
 * every ingredient a labelled jar you can pick up and price.
 */
export default function PantryPage() {
  const navigate = useNavigate();
  const { data, upsertPlan, upsertPantryItem, deletePantryItem } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const plan = data.plans.filter((p) => p.status !== "done").at(-1);
  const list = plan ? buildGroceryList(plan, data.recipes, data.pantry) : null;
  const checked = new Set(plan?.checkedNames.map(normalizeName) ?? []);
  const have = new Set(plan?.haveNames.map(normalizeName) ?? []);

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

  // The ones still waiting on a price stand at the front, where they are hard to ignore.
  const sortedPantry = [...data.pantry].sort((a, b) => {
    const aNeeds = a.priceCad === null ? 0 : 1;
    const bNeeds = b.priceCad === null ? 0 : 1;
    if (aNeeds !== bNeeds) return aNeeds - bNeeds;
    return a.name.localeCompare(b.name);
  });
  const needCount = data.pantry.filter((p) => p.priceCad === null).length;
  const editing = data.pantry.find((p) => p.id === editingId);

  return (
    <div className="pantry-room -mx-4 px-4 py-6 sm:-mx-8 sm:px-8">
      <div className="text-center">
        <h1 className="script-royal pantry-sign text-5xl leading-tight">The Pantry</h1>
        <p className="mt-1 text-sm text-[#e8d5a8]">
          {needCount > 0 ? `${needCount} ${needCount === 1 ? "jar is" : "jars are"} still waiting on a price` : "every jar is priced"}
        </p>
        <button className={`${buttonSecondary} mt-3`} onClick={() => navigate("/plan")}>
          Back out through the door
        </button>
      </div>

      {editing && (
        <div className="mt-5">
          <PantryEditor
            item={editing}
            onSave={(updated) => {
              upsertPantryItem(updated);
              setEditingId(null);
            }}
            onDelete={() => {
              deletePantryItem(editing.id);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      <section className="mt-7">
        <h2 className="pantry-heading">The shopping basket</h2>
        <div className="pantry-shelf mt-3">
          <div className="rounded-xl bg-[#f7edd8]/95 p-4 shadow-lg">
            {!plan && <p className="text-sm text-plum-soft">No week in progress, so there is nothing to shop for yet.</p>}
            {list && list.totalCad > 0 && (
              <p className="text-2xl font-bold text-gold">
                approx {formatCad(list.totalCad)}
                {list.hasSamplePrices && <span className="ml-2 text-xs font-normal">(sample prices, not real)</span>}
              </p>
            )}
            {list && list.excludedNames.length > 0 && (
              <p className="mt-1 text-xs text-plum-soft">Not in the total: {list.excludedNames.join(", ")}</p>
            )}
            {list && list.entries.length === 0 && (
              <p className="text-sm text-plum-soft">Place recipes in the week and the basket fills itself.</p>
            )}
            <ul className="mt-3 space-y-2">
              {[...(list?.entries ?? [])]
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
                            <Badge tone={gapOf(entry).tone}>{gapOf(entry).label}</Badge>
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
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="pantry-heading">On the shelves</h2>
        {needCount > 0 && (
          <p className="mt-1 text-xs text-[#e8d5a8]">
            Tap a jar to enter its price yourself, or send Claude the Walmart listing and it goes in with its source and date.
          </p>
        )}
        {chunk(sortedPantry, PER_SHELF).map((shelf, i) => (
          <div key={i} className="pantry-shelf mt-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {shelf.map((item) => (
                <button key={item.id} className="pantry-jar text-left" onClick={() => setEditingId(item.id)}>
                  <span className="pantry-jar-lid" aria-hidden />
                  <span className="block px-2.5 pb-2.5 pt-1">
                    <span className="block truncate text-sm font-bold capitalize text-plum">{item.name}</span>
                    <span className="mt-0.5 block truncate text-[10px] leading-tight text-plum-soft">{item.packageLabel}</span>
                    <span className="mt-1 block">
                      {item.priceCad !== null ? (
                        <span className="font-bold text-gold">{formatCad(item.priceCad)}</span>
                      ) : (
                        <Badge tone="rose">price needed</Badge>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[10px]">
                      <PriceProvenance item={item} />
                    </span>
                    <span className="mt-0.5 block text-[10px] text-plum-soft">
                      in {usedIn(item)} {usedIn(item) === 1 ? "recipe" : "recipes"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
