import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { costRecipe } from "../lib/cost";
import { formatCad } from "../lib/fractions";
import { Badge, buttonPrimary, Card } from "../components/ui";

export default function BookPage() {
  const { data } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [turning, setTurning] = useState(false);

  const categories = useMemo(() => [...new Set(data.recipes.map((r) => r.category))].sort(), [data.recipes]);

  const shown = data.recipes.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || r.title.toLowerCase().includes(q) || r.ingredients.some((i) => i.name.toLowerCase().includes(q));
    return matchesSearch && (!category || r.category === category);
  });

  /** Turn the page, then land on the recipe. */
  function openRecipe(id: string) {
    if (turning) return;
    setTurning(true);
    setTimeout(() => navigate(`/recipe/${id}`), 620);
  }

  return (
    <div>
      {turning && (
        <div className="page-turn" aria-hidden>
          <div className="turning-sheet" />
        </div>
      )}

      <h2 className="text-center font-display text-2xl font-bold tracking-wide">Table of Contents</h2>
      <p className="mb-4 text-center font-display text-sm italic text-plum-soft">Tried, tested, and loved by the family</p>

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

      {shown.length === 0 && <Card className="p-4 text-center text-plum-soft">No recipes here yet. Add the first one below.</Card>}

      <div>
        {shown.map((recipe, i) => {
          const cost = costRecipe(recipe, data.pantry, 1);
          return (
            <button key={recipe.id} className="toc-entry group" onClick={() => openRecipe(recipe.id)}>
              <span className="font-display text-lg font-bold leading-snug text-plum group-hover:text-rose-deep">
                {recipe.title}
              </span>
              {recipe.isSample && <Badge tone="plain">sample</Badge>}
              <Badge tone="lavender">{recipe.category}</Badge>
              <span className="toc-leader" aria-hidden />
              <span className="shrink-0 text-sm font-bold text-gold">
                {cost.totalCad > 0 ? `~${formatCad(cost.totalCad)}` : `p. ${i + 1}`}
              </span>
            </button>
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
