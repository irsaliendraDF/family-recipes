# Family Recipes, build spec

status: confirmed, all three open decisions answered by Irene 2026-08-29
updated: 2026-08-29
source: Irene's request in Claude Code, 2026-08-29

## What this is

A Disney princess inspired recipe book app holding Irene's "Family Recipes": recipes she has found, tried a couple of times, and confirmed work and taste delicious. It grows over time; she adds recipes a few at a time once the app is built.

## What it must do, in her words

1. Hold all the Family Recipes, updatable over time.
2. All ingredients visible per recipe, connected to real grocery prices in her area (Halifax/Dartmouth, Nova Scotia). Majority of shopping is at Walmart.
3. Meal planning: pick recipes for the week, see the combined grocery list and the approximate total cost.
4. Scale a recipe to double or half from the recipe page, then revert to original portions. Original amounts are never lost.
5. "Smart recipes" (princess branded): suggested recipes based on the ingredients already present across her saved recipes.

## Constraints that shape the build

- **Prices cannot be invented.** Walmart Canada has no public price API. Every price in the app is one that was actually looked up on walmart.ca for a Halifax/Dartmouth store, saved with the date it was checked, and editable by hand. Prices without a lookup yet show as "price needed", never a guess. Prices drift, so the app always shows how old each price is.
- Costs shown are approximate by design: package sizes rarely match recipe amounts exactly. The grocery list works in packages you can actually buy (one 900g bag of flour), the recipe works in recipe units (2 cups).
- Princess inspired means an original fairytale look (colours, typography, illustration style). No actual Disney character art or logos in the app.
- Original recipe amounts are the stored truth. Doubling and halving are display-time math, so revert is always exact.

## Decisions (answered by Irene, 2026-08-29)

1. **Phone and laptop.** Deployed as a real website on Vercel with Supabase as the database, so the grocery list is in her hand at Walmart.
2. **Claude looks up prices** on walmart.ca and saves them with the date checked. She can edit any price and ask for a refresh any time.
3. **Claude generates the smart recipes** during working sessions and saves them into the book. No API key in the app, no ongoing cost.

## Source of truth (her build process requires naming this before building)

- **Supabase owns all the data**: recipes, ingredients, prices, meal plans, smart recipe suggestions. The app reads and writes Supabase. Nothing lives only in the app's code.
- **Her decision, 2026-08-29: the Supabase account is a new one under her and Joel's joint email**, not the DigitalFlow org (a second project there costs $10 USD/month). Sign-in is email and password she creates herself; sign-ups get closed after the family is in. Details in `PHASE-5-SPEC.md` and `SETUP-SUPABASE.md`.
- Until keys arrive the app runs in practice mode, fully working, data per device, auto-imported on first cloud sign-in.

## Stack

- Vite + React + TypeScript, Tailwind for styling. Static site on Vercel.
- Supabase (free tier) for database and sign-in.
- Mobile-first layout, since the grocery list gets used one-handed in a store aisle.

## Phases

- Phase 0: scaffold, git init, local dev server runs. `PHASE-0-SETUP.md`
- Phase 1: recipe book. List, recipe page, add/edit, double/half with exact revert. `PHASE-1-SPEC.md`
- Phase 2: ingredients and prices. Price per ingredient with last-checked date, "price needed" state, per-recipe approximate cost. `PHASE-2-SPEC.md`
- Phase 3: meal planning. Pick recipes for the week, combined grocery list in buyable packages, approximate total. `PHASE-3-SPEC.md`
- Phase 4: smart recipes section, princess branded, fed by Claude sessions. `PHASE-4-SPEC.md`
- Phase 5: Supabase wiring, sign-in, deploy to Vercel. `PHASE-5-SPEC.md`
