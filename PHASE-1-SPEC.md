# Phase 1: the recipe book

updated: 2026-08-29

## Goal

Recipes can be added, viewed, edited, and scaled. This is the heart of the app.

## Data model (recipe)

- id, title, story (optional short note about where it came from), category (dinner, dessert, breakfast, etc.), servings (the original, never overwritten), prep and cook time, tags
- ingredients: list of { name, amount, unit, note } in recipe units (cups, tbsp, grams)
- steps: ordered list of instruction text
- created and updated dates

## Rules

- **Original amounts are the stored truth.** Double and half are display-time math only. The scale control shows 1/2x, 1x, 2x, and reverting to 1x always shows exactly what was typed in.
- Scaled amounts render in sensible fractions (1 1/2 cups, not 1.5 cups) where the unit is a kitchen unit.
- Until Phase 5, data lives in the browser through a data layer with the same shape Supabase will have, so the swap is one file.
- One clearly labelled sample recipe ships for testing the screens. It is marked SAMPLE in the title and gets deleted before Irene's real recipes go in. Its prices in later phases are placeholders labelled as not real.

## Screens

- Book view: recipe cards in a grid, search, filter by category.
- Recipe page: story, timings, servings with the scale control, ingredients, steps. Reads like a storybook page.
- Add/edit form: friendly on mobile, ingredients addable line by line.

## Done when

Add a recipe, edit it, scale it to 2x and 1/2x, revert to 1x and see the exact original, all verified in the browser.
