import { NavLink, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import BookPage from "./pages/BookPage";
import RecipePage from "./pages/RecipePage";
import RecipeFormPage from "./pages/RecipeFormPage";
import MealPlanPage from "./pages/MealPlanPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import { Tiara } from "./components/ui";
import { useStore } from "./data/store";

const TABS = [
  { to: "/", label: "The Book" },
  { to: "/plan", label: "Meal Plan" },
];

const SPARKLES = [
  { top: "6%", left: "4%", size: "14px", color: "#e78bb1", delay: "0s" },
  { top: "12%", left: "94%", size: "12px", color: "#f0d78a", delay: "0.7s" },
  { top: "34%", left: "2%", size: "10px", color: "#b9a7e0", delay: "1.4s" },
  { top: "42%", left: "96%", size: "15px", color: "#e78bb1", delay: "2.1s" },
  { top: "64%", left: "3%", size: "12px", color: "#f0d78a", delay: "0.4s" },
  { top: "72%", left: "95%", size: "10px", color: "#b9a7e0", delay: "1.8s" },
  { top: "88%", left: "6%", size: "13px", color: "#e78bb1", delay: "2.6s" },
  { top: "92%", left: "92%", size: "11px", color: "#f0d78a", delay: "1.1s" },
];

export default function App() {
  const { cloud, signOut } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const onSmart = location.pathname === "/smart";

  return (
    <div className="relative mx-auto max-w-3xl px-2 pb-10 pt-4 sm:px-4">
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

      <div className="relative z-10 flex items-end px-4">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/"} className={({ isActive }) => `index-tab ${isActive && !onSmart ? "active" : ""}`}>
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="book relative z-10">
        <button
          className={`corner-tab ${onSmart ? "active" : ""}`}
          onClick={() => navigate(onSmart ? "/" : "/smart")}
          aria-label="Smart Recipes"
          title="Smart Recipes"
        >
          <span aria-hidden>✨</span>
        </button>

        <header className="px-4 pt-6 text-center">
          <Tiara className="mx-auto h-7 w-16 text-gold" />
          <p className="font-script text-2xl text-lavender">Once upon a mealtime</p>
          <h1 className="gold-foil font-display text-4xl font-bold tracking-wide">Family Recipes</h1>
          {cloud && (
            <button className="mt-1 text-xs font-bold text-plum-soft underline" onClick={signOut}>
              sign out
            </button>
          )}
        </header>

        <main className="px-4 pb-10 pt-4 sm:px-8">
          <Routes>
            <Route path="/" element={<BookPage />} />
            <Route path="/recipe/new" element={<RecipeFormPage />} />
            <Route path="/recipe/:id" element={<RecipePage />} />
            <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
            <Route path="/plan" element={<MealPlanPage />} />
            <Route path="/smart" element={<SuggestionsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
