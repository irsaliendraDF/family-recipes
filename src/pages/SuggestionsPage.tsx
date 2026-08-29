import { useNavigate } from "react-router-dom";
import { useStore } from "../data/store";
import { Badge, Card, PageHeading, buttonPrimary, buttonSecondary } from "../components/ui";

export default function SuggestionsPage() {
  const { data, promoteSuggestion, dismissSuggestion } = useStore();
  const navigate = useNavigate();

  const fresh = data.suggestions.filter((s) => s.status === "new");

  return (
    <div>
      <PageHeading sub="New ideas conjured from ingredients your recipes already use">Smart Recipes</PageHeading>

      <Card className="mb-4 bg-lavender-soft/50 text-center text-sm text-plum-soft">
        These are suggestions, not Family Recipes yet. Try one, and if the family loves it, promote it into the book.
        New ones appear when Claude reads your ingredient pool.
      </Card>

      {fresh.length === 0 && (
        <Card className="text-center text-plum-soft">
          No suggestions waiting. Add more recipes to the book, then ask Claude for new ones.
        </Card>
      )}

      <div className="space-y-3">
        {fresh.map((s) => (
          <Card key={s.id} className="border-lavender">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-xl font-bold">{s.title}</h2>
              {s.isSample && <Badge tone="plain">sample</Badge>}
            </div>
            <p className="mt-1 text-sm italic text-plum-soft">{s.reason}</p>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="font-bold text-lavender">You already use:</span> {s.usesFromPantry.join(", ")}
              </p>
              {s.extrasNeeded.length > 0 && (
                <p>
                  <span className="font-bold text-rose-deep">You would need:</span> {s.extrasNeeded.join(", ")}
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className={buttonPrimary}
                onClick={() => {
                  const recipe = promoteSuggestion(s.id);
                  if (recipe) navigate(`/recipe/${recipe.id}`);
                }}
              >
                Into the book
              </button>
              <button className={buttonSecondary} onClick={() => dismissSuggestion(s.id)}>
                Not for us
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
