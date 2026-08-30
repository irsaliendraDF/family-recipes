# Family Recipes

A storybook recipe app for the recipes we actually make, with real Walmart
prices attached so every batch shows what it costs.

Live at https://family-recipes-tan.vercel.app

## What it does

- **The Book.** A table of contents that opens like a real book. Every recipe
  page scales to half or double and reverts exactly, because the amounts you
  typed are what is stored and the scaling is display math.
- **Meal Plan.** Seven days by four meal slots. Drag a recipe in (or tap the
  recipe, then the slot) and one batch carries across the days it can feed:
  12 muffins for a household of two fills six breakfasts, and the grocery
  list still only buys the ingredients once.
- **The Pantry**, behind the wooden door on the Meal Plan page. The week's
  grocery list in packages you can actually buy, with an approximate total,
  plus every ingredient and its price.
- **Smart Recipes**, behind the gold folded corner: suggestions built from
  ingredients the book already uses. They are not Family Recipes until one
  gets tried and promoted.

## The rule about prices

No price is ever invented. Every price in the app is either read off a real
Walmart listing or typed in by hand, and it carries its source and the date
it was checked. Anything without one shows "price needed" and is left out of
the totals rather than guessed at, so the costs can be trusted as cost-of-goods
data.

Recipe costs are approximate on purpose: package sizes rarely match recipe
amounts, so the grocery list works in whole packages while the recipe works in
cups and teaspoons.

## Running it

```
npm install
npm run dev
```

The app runs in practice mode with no setup, keeping data in the browser it
was entered on. Cloud mode (one shared book across phone and laptop) turns on
once `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set; the steps are in
`SETUP-SUPABASE.md` and the schema is in `supabase/schema.sql`.

## Where things are

- `src/data/seed.ts` recipes and pantry prices
- `src/lib/cost.ts` the costing and grocery list maths
- `src/data/store.tsx` storage, and the merge that adds new recipes to a
  device without disturbing anything edited there
- `SPEC.md` and `PHASE-*.md` what was built and why
