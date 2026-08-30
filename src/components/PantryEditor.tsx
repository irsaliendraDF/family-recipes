import { useState } from "react";
import type { PantryItem } from "../types";
import { KITCHEN_UNITS } from "../lib/units";
import { Card, buttonPrimary, buttonSecondary, inputClass } from "./ui";

export function PantryEditor({
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
    <Card className="border-lavender p-4">
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
              // Stamping the save is what stops a later seed correction overwriting it.
              updatedAt: new Date().toISOString(),
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
