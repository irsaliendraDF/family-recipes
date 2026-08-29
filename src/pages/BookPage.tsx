import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../data/store";
import { costRecipe } from "../lib/cost";
import { formatCad } from "../lib/fractions";
import { Badge, Card, PageHeading, buttonPrimary } from "../components/ui";

export default function BookPage() {
  const { data } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(data.recipes.map((r) => r.category))].sort(), [data.recipes]);

  const shown = data.recipes.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || r.title.toLowerCase().includes(q) || r.ingredients.some((i) => i.name.toLowerCase().includes(q));
    return matchesSearch && (!category || r.category === category);
  });

  return (
    <div>
      <PageHeading sub="Tried, tested, and loved by the family">The Recipe Book</PageHeading>

      <div className="mb-4 flex flex-col gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes or ingredients"
          className="w-full rounded-full border border-gold-soft bg-white px-4 py-2.5 focus:border-lavender focus:outline-none"
        />
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full px-3 py-1 text-sm font-bold ${!category ? "bg-rose text-white" : "bg-blush text-rose-deep"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? null : c)}
                className={`rounded-full px-3 py-1 text-sm font-bold ${category === c ? "bg-rose text-white" : "bg-blush text-rose-deep"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 && (
        <Card className="text-center text-plum-soft">No recipes here yet. Add the first one below.</Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((recipe) => {
          const cost = costRecipe(recipe, data.pantry, 1);
          const totalMin = (recipe.prepMin ?? 0) + (recipe.cookMin ?? 0);
          return (
            <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-xl font-bold leading-snug">{recipe.title}</h2>
                  {recipe.isSample && <Badge tone="plain">sample</Badge>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-plum-soft">
                  <Badge tone="lavender">{recipe.category}</Badge>
                  <span>serves {recipe.servings}</span>
                  {totalMin > 0 && <span>{totalMin} min</span>}
                </div>
                <p className="mt-2 text-sm font-bold text-gold">
                  {cost.totalCad > 0
                    ? `approx ${formatCad(cost.totalCad)}${cost.excluded.length ? " and up" : ""}${cost.hasSamplePrices ? " (sample prices)" : ""}`
                    : "cost once prices are in"}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link to="/recipe/new" className={buttonPrimary}>
          Add a recipe
        </Link>
      </div>
    </div>
  );
}
