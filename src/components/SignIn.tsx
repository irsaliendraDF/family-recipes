import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, FlourishDivider, Tiara, buttonPrimary, buttonSecondary, inputClass } from "./ui";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function run(kind: "in" | "up") {
    if (!supabase || !email.trim() || !password) {
      setMessage("Email and password, please.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } =
      kind === "in"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage(error.message);
    // On success the auth listener in the store takes over and loads the book.
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-14 text-center">
      <Tiara className="mx-auto h-8 w-18 text-gold" />
      <p className="font-script text-3xl text-lavender">Once upon a mealtime</p>
      <h1 className="gold-foil font-display text-4xl font-bold tracking-wide">Family Recipes</h1>
      <FlourishDivider />
      <Card className="mt-6 space-y-3 text-left">
        <label className="block">
          <span className="text-sm font-bold text-plum-soft">Email</span>
          <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-bold text-plum-soft">Password</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run("in")}
          />
        </label>
        {message && <p className="text-center text-sm font-bold text-rose-deep">{message}</p>}
        <div className="flex flex-col gap-2 pt-1">
          <button className={buttonPrimary} disabled={busy} onClick={() => run("in")}>
            {busy ? "Opening..." : "Open the book"}
          </button>
          <button className={buttonSecondary} disabled={busy} onClick={() => run("up")}>
            First time here: create our account
          </button>
        </div>
      </Card>
    </div>
  );
}
