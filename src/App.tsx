import { useState } from "react";
import { NavLink, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import BookPage from "./pages/BookPage";
import RecipePage from "./pages/RecipePage";
import RecipeFormPage from "./pages/RecipeFormPage";
import MealPlanPage from "./pages/MealPlanPage";
import PantryPage from "./pages/PantryPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import { Tiara } from "./components/ui";
import { useStore } from "./data/store";

const TABS = [
  { to: "/", label: "The Book" },
  { to: "/plan", label: "Meal Plan" },
  { to: "/pantry", label: "Pantry" },
];

const SPARKLES = [
  { top: "6%", left: "4%", size: "14px", color: "#f0d78a", delay: "0s" },
  { top: "12%", left: "94%", size: "12px", color: "#a8e6c3", delay: "0.7s" },
  { top: "34%", left: "2%", size: "10px", color: "#f0d78a", delay: "1.4s" },
  { top: "42%", left: "96%", size: "15px", color: "#d9f2e0", delay: "2.1s" },
  { top: "64%", left: "3%", size: "12px", color: "#a8e6c3", delay: "0.4s" },
  { top: "72%", left: "95%", size: "10px", color: "#f0d78a", delay: "1.8s" },
  { top: "88%", left: "6%", size: "13px", color: "#d9f2e0", delay: "2.6s" },
  { top: "92%", left: "92%", size: "11px", color: "#f0d78a", delay: "1.1s" },
];

const FIREFLIES = [
  { top: "10%", left: "8%", delay: "0s", duration: "9s" },
  { top: "24%", left: "90%", delay: "2s", duration: "11s" },
  { top: "48%", left: "5%", delay: "4s", duration: "8s" },
  { top: "58%", left: "93%", delay: "1s", duration: "10s" },
  { top: "80%", left: "10%", delay: "3s", duration: "12s" },
  { top: "90%", left: "88%", delay: "5s", duration: "9s" },
];

function alreadyOpened(): boolean {
  try {
    return sessionStorage.getItem("book-opened") === "yes";
  } catch {
    return true;
  }
}

export default function App() {
  const { cloud, signOut } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const onSmart = location.pathname === "/smart";
  const [coverState, setCoverState] = useState<"closed" | "opening" | "opened">(alreadyOpened() ? "opened" : "closed");

  function openBook() {
    setCoverState("opening");
    try {
      sessionStorage.setItem("book-opened", "yes");
    } catch {
      /* fine, the cover just shows again next time */
    }
  }

  return (
    <div className="book-frame relative mx-auto flex max-w-3xl flex-col px-2 pb-3 pt-4 sm:px-4">
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
      {FIREFLIES.map((f, i) => (
        <span
          key={`fly-${i}`}
          className="firefly"
          style={{ top: f.top, left: f.left, animationDelay: f.delay, animationDuration: f.duration }}
          aria-hidden
        />
      ))}

      <div className="relative z-10 flex items-end px-4">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === "/"} className={({ isActive }) => `index-tab ${isActive && !onSmart ? "active" : ""}`}>
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="book-perspective relative z-10 min-h-0 flex-1">
      <div className="book relative flex h-full flex-col">
        {coverState !== "opened" && (
          <button
            className={`book-cover ${coverState === "opening" ? "opening" : ""}`}
            onClick={openBook}
            onTransitionEnd={() => coverState === "opening" && setCoverState("opened")}
            aria-label="Open the book"
          >
            <Tiara className="h-10 w-24 text-gold-soft" />
            <span className="gold-foil font-script text-5xl leading-tight">Family Recipes</span>
            <span className="font-display text-sm italic text-gold-soft">a storybook of things we actually make</span>
            <span className="mt-4 rounded-full border border-gold-soft/60 px-4 py-1 text-xs font-bold text-gold-soft">tap to open</span>
          </button>
        )}
        <button
          className={`corner-tab ${onSmart ? "active" : ""}`}
          onClick={() => navigate(onSmart ? "/" : "/smart")}
          aria-label="Smart Recipes"
          title="Smart Recipes"
        >
          <span aria-hidden>✨</span>
        </button>

        <header className="shrink-0 px-4 pt-6 text-center">
          <Tiara className="mx-auto h-6 w-14 text-gold" />
          {cloud && (
            <button className="mt-1 text-xs font-bold text-plum-soft underline" onClick={signOut}>
              sign out
            </button>
          )}
        </header>

        <main className="book-pages min-h-0 flex-1 px-4 pb-10 pt-4 sm:px-8">
          <Routes>
            <Route path="/" element={<BookPage />} />
            <Route path="/recipe/new" element={<RecipeFormPage />} />
            <Route path="/recipe/:id" element={<RecipePage />} />
            <Route path="/recipe/:id/edit" element={<RecipeFormPage />} />
            <Route path="/plan" element={<MealPlanPage />} />
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="/smart" element={<SuggestionsPage />} />
          </Routes>
        </main>
      </div>
      </div>
    </div>
  );
}
