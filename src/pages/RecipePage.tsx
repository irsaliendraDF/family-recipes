import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ScaleFactor } from "../types";
import { useStore } from "../data/store";
import { costRecipe } from "../lib/cost";
import { formatAmount, formatCad, formatQuantity } from "../lib/fractions";
import { Badge, Card, FlourishDivider, buttonSecondary } from "../components/ui";

/**
 * Why a line is left out of the total. Kept apart on purpose: an ingredient with a
 * price but no amount written down is a different problem from one with no price,
 * and lumping them together read as "still needs a price" when it did not.
 */
const EXCLUSION_LABELS = [
  { reasons: ["price needed", "no pantry item"], label: "Left out, still needs a price" },
  { reasons: ["package size needed"], label: "Left out, priced but the package size is not known" },
  { reasons: ["unmeasured"], label: "Left out, no amount written down" },
  { reasons: ["units not convertible"], label: "Left out, the recipe unit does not match the package" },
];

const SCALES: { value: ScaleFactor; label: string }[] = [
  { value: 0.5, label: "½x" },
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
];

export default function RecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, deleteRecipe } = useStore();
  const [scale, setScale] = useState<ScaleFactor>(1);

  const recipe = data.recipes.find((r) => r.id === id);
  if (!recipe) return <Card>This recipe is not in the book. It may have been deleted.</Card>;

  const cost = costRecipe(recipe, data.pantry, scale);
  const scaledServings = recipe.servings * scale;

  return (
    <div>
      <div className="text-center">
        <h1 className="script-royal text-5xl leading-tight">{recipe.title}</h1>
        {recipe.story && <p className="mx-auto mt-2 max-w-md font-display text-base italic text-plum-soft">{recipe.story}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-plum-soft">
          <Badge tone="lavender">{recipe.category}</Badge>
          {recipe.prepMin != null && <span>prep {recipe.prepMin} min</span>}
          {recipe.cookMin != null && <span>cook {recipe.cookMin} min</span>}
          {recipe.fromSuggestion && <Badge tone="gold">from a suggestion</Badge>}
        </div>
        <FlourishDivider />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <Card>
        <p className="text-sm font-bold text-plum-soft">Servings</p>
        <p className="font-display text-2xl font-bold">
          {formatAmount(scaledServings)}
          {scale !== 1 && <span className="ml-2 text-sm font-normal text-plum-soft">(originally {recipe.servings})</span>}
        </p>
        <div className="mt-2 flex w-fit rounded-full bg-parchment p-1">
          {SCALES.map((s) => (
            <button
              key={s.value}
              onClick={() => setScale(s.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                scale === s.value ? "bg-rose text-white" : "text-plum-soft"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {scale !== 1 && (
          <p className="mt-2 text-xs text-plum-soft">
            Scaled view only. The original recipe is untouched; tap 1x to see it exactly as written.
          </p>
        )}
      </Card>

      <Card className="border-gold bg-gold-soft/30">
        <h2 className="font-display text-xl font-bold">Approximate cost at {scale}x</h2>
        {cost.totalCad > 0 ? (
          <p className="mt-1 text-2xl font-bold text-gold">
            {formatCad(cost.totalCad)}
            {cost.excluded.length > 0 && <span className="ml-2 text-xs font-normal">and up</span>}
          </p>
        ) : (
          <p className="mt-1 text-plum-soft">No priced ingredients yet. Prices live behind the pantry door on the Meal Plan page.</p>
        )}
        {cost.excluded.length > 0 && (
          <div className="mt-2 space-y-1 text-xs text-plum-soft">
            {EXCLUSION_LABELS.map(({ reasons, label }) => {
              const names = cost.excluded.filter((l) => reasons.includes(l.reason ?? "")).map((l) => l.line.name);
              return names.length === 0 ? null : (
                <p key={label}>
                  {label}: {names.join(", ")}
                </p>
              );
            })}
          </div>
        )}
      </Card>
      </div>

      <Card className="mt-3">
        <h2 className="font-display text-xl font-bold">Ingredients</h2>
        <ul className="mt-2 space-y-2">
          {recipe.ingredients.map((line) => (
            <li key={line.id} className="flex items-baseline gap-2 border-b border-parchment pb-2 last:border-0">
              <span className="min-w-16 font-bold text-rose-deep">
                {line.amount !== null ? formatQuantity(line.amount * scale, line.unit) : ""}
              </span>
              <span>
                {line.name}
                {line.note && <span className="text-sm text-plum-soft"> ({line.note})</span>}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-3">
        <h2 className="font-display text-xl font-bold">Steps</h2>
        <ol className="mt-2 space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lavender-soft font-bold text-lavender">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-5 flex justify-center gap-3">
        <Link to={`/recipe/${recipe.id}/edit`} className={buttonSecondary}>
          Edit
        </Link>
        <button
          className="rounded-full px-5 py-2.5 font-bold text-plum-soft"
          onClick={() => {
            if (confirm(`Delete "${recipe.title}" from the book?`)) {
              deleteRecipe(recipe.id);
              navigate("/");
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
