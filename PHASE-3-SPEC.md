# Phase 3: meal planning

updated: 2026-08-29

## Goal

Pick recipes for the week, get one grocery list in buyable packages with an approximate total.

## Data model (meal plan)

- id, name (defaults to the week, e.g. "Week of Sept 1"), list of { recipe id, scale (1/2, 1, 2), day (optional) }
- status: planning / shopping / done

## Rules

- The grocery list merges ingredients across the chosen recipes at their chosen scales, then converts to packages: 2 recipes needing 3 cups flour total still means one bag of flour. Package count is the ceiling of what is needed.
- Total cost sums package prices, labelled approximate, and lists anything excluded for a missing price so the total is honest.
- Shopping mode: big touch targets, tap to check off, checked items sink to the bottom. Built for one hand in a Walmart aisle.
- Items Irene already has can be marked "have it" and drop out of the total.

## Done when

A plan with two or more recipes produces a merged, costed, checkable grocery list, verified at mobile width in the browser.
