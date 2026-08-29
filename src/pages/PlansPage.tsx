import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { newId, useStore } from "../data/store";
import { buildGroceryList } from "../lib/cost";
import { formatCad } from "../lib/fractions";
import { Badge, Card, PageHeading, buttonPrimary, inputClass } from "../components/ui";

export default function PlansPage() {
  const { data, upsertPlan } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  function createPlan() {
    const now = new Date().toISOString();
    const plan = {
      id: newId(),
      name: name.trim() || `Week of ${new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`,
      items: [],
      status: "planning" as const,
      checkedNames: [],
      haveNames: [],
      createdAt: now,
      updatedAt: now,
    };
    upsertPlan(plan);
    navigate(`/plan/${plan.id}`);
  }

  return (
    <div>
      <PageHeading sub="Pick the week's recipes, get one grocery list and the cost">Meal Plans</PageHeading>

      <Card className="mb-4">
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Week of Sept 1"
          />
          <button className={`${buttonPrimary} shrink-0`} onClick={createPlan}>
            New plan
          </button>
        </div>
      </Card>

      {data.plans.length === 0 && <Card className="text-center text-plum-soft">No meal plans yet. Start one above.</Card>}

      <div className="space-y-3">
        {[...data.plans].reverse().map((plan) => {
          const list = buildGroceryList(plan, data.recipes, data.pantry);
          return (
            <Link key={plan.id} to={`/plan/${plan.id}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg font-bold">{plan.name}</p>
                  <Badge tone={plan.status === "done" ? "plain" : plan.status === "shopping" ? "gold" : "lavender"}>
                    {plan.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-plum-soft">
                  {plan.items.length} {plan.items.length === 1 ? "recipe" : "recipes"}
                  {list.totalCad > 0 && `, approx ${formatCad(list.totalCad)}`}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
