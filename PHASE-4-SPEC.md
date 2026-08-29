# Phase 4: smart recipes

updated: 2026-08-29

## Goal

A princess branded section of suggested recipes built from the ingredients Irene's saved recipes already use.

## How it works

- Claude generates suggestions during working sessions (her decision, 2026-08-29): reads her ingredient pool, writes suggestion records into the database.
- A suggestion looks like a recipe plus: which of her existing ingredients it uses, which few extras it would need, and a one-line reason it fits her book.
- From the app she can promote a suggestion into a real Family Recipe (it then behaves like any other recipe, marked as adapted from a suggestion until she has tried it), or dismiss it.
- Suggestions never mix into the Family Recipes list. Family Recipes are things she has tried and confirmed delicious; suggestions have not earned that yet.

## Done when

Suggestions display in their own section, promote and dismiss both work, verified in the browser.
