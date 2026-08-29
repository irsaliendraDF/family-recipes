import { useState } from "react";
import type { PantryItem } from "../types";
import { useStore } from "../data/store";
import { normalizeName, KITCHEN_UNITS } from "../lib/units";
import { formatCad } from "../lib/fractions";
import { Badge, Card, PageHeading, PriceProvenance, buttonPrimary, buttonSecondary, inputClass } from "../components/ui";

export default function PantryPage() {
  const { data, upsertPantryItem, deletePantryItem } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const usedIn = (item: PantryItem) =>
    data.recipes.filter((r) => r.ingredients.some((i) => normalizeName(i.name) === normalizeName(item.name)));

  const sorted = [...data.pantry].sort((a, b) => {
    const aNeeds = a.priceCad === null ? 0 : 1;
    const bNeeds = b.priceCad === null ? 0 : 1;
    if (aNeeds !== bNeeds) return aNeeds - bNeeds;
    return (a.lastChecked ?? "") < (b.lastChecked ?? "") ? -1 : 1;
  });

  const needCount = data.pantry.filter((p) => p.priceCad === null).length;

  return (
    <div>
      <PageHeading sub="Every ingredient, its Walmart price, and how fresh that price is">The Pantry</PageHeading>

      {needCount > 0 && (
        <Card className="mb-4 border-rose bg-blush/50 text-center text-sm">
          <strong>{needCount}</strong> {needCount === 1 ? "ingredient needs" : "ingredients need"} a price. Ask Claude to look
          them up on walmart.ca, or tap one to enter it yourself.
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((item) =>
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
            <Card key={item.id} className="cursor-pointer" >
              <button className="w-full text-left" onClick={() => setEditingId(item.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-bold capitalize">{item.name}</p>
                    <p className="text-sm text-plum-soft">{item.packageLabel}</p>
                  </div>
                  <div className="text-right">
                    {item.priceCad !== null ? (
                      <p className="text-lg font-bold text-gold">{formatCad(item.priceCad)}</p>
                    ) : (
                      <Badge tone="rose">price needed</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <PriceProvenance item={item} />
                  <span className="text-xs text-plum-soft">
                    {usedIn(item).length} {usedIn(item).length === 1 ? "recipe" : "recipes"}
                  </span>
                </div>
              </button>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}

function PantryEditor({
  item,
  onSave,
  onDelete,
  onCancel,
}: {
  item: PantryItem;
  onSave: (item: PantryItem) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [packageLabel, setPackageLabel] = useState(item.packageLabel);
  const [price, setPrice] = useState(item.priceCad !== null ? String(item.priceCad) : "");
  const [perAmount, setPerAmount] = useState(item.perPackage ? String(item.perPackage.amount) : "");
  const [perUnit, setPerUnit] = useState(item.perPackage?.unit ?? "cups");

  return (
    <Card className="border-lavender">
      <p className="font-display text-lg font-bold capitalize">{item.name}</p>
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="text-sm font-bold text-plum-soft">Package (what you buy)</span>
          <input className={inputClass} value={packageLabel} onChange={(e) => setPackageLabel(e.target.value)} placeholder="2.5 kg bag" />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-plum-soft">Price (CAD)</span>
          <input className={inputClass} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5.97" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-plum-soft">One package holds</span>
            <input className={inputClass} inputMode="decimal" value={perAmount} onChange={(e) => setPerAmount(e.target.value)} placeholder="20" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-plum-soft">Unit</span>
            <select className={inputClass} value={perUnit} onChange={(e) => setPerUnit(e.target.value)}>
              {KITCHEN_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u === "" ? "count" : u}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-plum-soft">
          "One package holds" is how recipe amounts turn into cost, like a flour bag holding about 20 cups. Approximate is fine.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={buttonPrimary}
          onClick={() => {
            const priceNum = price.trim() === "" ? null : Number(price);
            onSave({
              ...item,
              packageLabel: packageLabel.trim() || "no price yet",
              priceCad: priceNum !== null && !Number.isNaN(priceNum) ? priceNum : null,
              priceSource: priceNum !== null ? "irene" : item.priceSource,
              lastChecked: priceNum !== null ? new Date().toISOString().slice(0, 10) : item.lastChecked,
              perPackage:
                perAmount.trim() !== "" && Number(perAmount) > 0 ? { amount: Number(perAmount), unit: perUnit } : item.perPackage,
            });
          }}
        >
          Save
        </button>
        <button className={buttonSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button
          className="ml-auto px-3 font-bold text-plum-soft"
          onClick={() => {
            if (confirm(`Remove ${item.name} from the pantry?`)) onDelete();
          }}
        >
          Remove
        </button>
      </div>
    </Card>
  );
}
