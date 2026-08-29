import { NavLink, Route, Routes } from "react-router-dom";
import BookPage from "./pages/BookPage";
import RecipePage from "./pages/RecipePage";
import RecipeFormPage from "./pages/RecipeFormPage";
import PantryPage from "./pages/PantryPage";
import PlansPage from "./pages/PlansPage";
import PlanDetailPage from "./pages/PlanDetailPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import { Tiara } from "./components/ui";

const TABS = [
  { to: "/", label: "Book", icon: "📖" },
  { to: "/plans", label: "Meal Plans", icon: "🛒" },
  { to: "/pantry", label: "Pantry", icon: "🧺" },
  { to: "/smart", label: "Smart Recipes", icon: "✨" },
];

const SPARKLES = [
  { top: "8%", left: "6%", size: "14px", color: "#d4699a", delay: "0s" },
  { top: "14%", left: "88%", size: "12px", color: "#b08a34", delay: "0.7s" },
  { top: "30%", left: "12%", size: "10px", color: "#8e7cc3", delay: "1.4s" },
  { top: "38%", left: "92%", size: "15px", color: "#d4699a", delay: "2.1s" },
  { top: "55%", left: "4%", size: "12px", color: "#b08a34", delay: "0.4s" },
  { top: "62%", left: "85%", size: "10px", color: "#8e7cc3", delay: "1.8s" },
  { top: "78%", left: "10%", size: "13px", color: "#d4699a", delay: "2.6s" },
  { top: "85%", left: "90%", size: "11px", color: "#b08a34", delay: "1.1s" },
];

export default function App() {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col">
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="sparkle"
          style={{ top: s.top, left: s.left, fontSize: s.size, color: s.color, animationDelay: s.delay }}
          aria-hidden
        >
          ✦
        </span>
      ))}

      <header className="relative z-10 px-4 pt-5 text-center">
        <Tiara className="mx-auto h-7 w-16 text-gold" />
        <p className="font-script text-2xl text-lavender">Once upon a mealtime</p>
        <h1 className="gold-foil font-display text-4xl font-bold tracking-wide">Family Recipes</h1>
      </header>

      <main className="relative z-10 flex-1 px-4 pb-32 pt-4">
        <Routes>
          <Route path="/" element={<BookPage />} />
          <Route path="/recipe/new" element={<RecipeFormPage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/plan/:id" element={<PlanDetailPage />} />
          <Route path="/smart" element={<SuggestionsPage />} />
        </Routes>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="royal-card mx-auto flex max-w-3xl overflow-hidden !rounded-full px-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                `relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-full py-2.5 text-xs font-bold transition-colors ${
                  isActive ? "text-rose-deep" : "text-plum-soft"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none transition-all ${
                      isActive ? "bg-gradient-to-br from-blush to-lavender-soft shadow-inner ring-1 ring-gold-soft" : ""
                    }`}
                    aria-hidden
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
