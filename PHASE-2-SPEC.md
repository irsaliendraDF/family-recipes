# Phase 2: ingredients and prices

updated: 2026-08-29

## Goal

Every ingredient can carry a real Walmart (Halifax/Dartmouth) price, and every recipe shows an approximate cost.

## Data model (pantry item)

A pantry item is the buyable version of an ingredient, shared across recipes:

- id, name (e.g. all-purpose flour), matched to recipe ingredients by name
- package: size, unit, price in CAD (e.g. 2.5 kg bag, $5.97)
- price status: has a price / price needed
- price source: walmart.ca lookup by Claude, or edited by Irene
- last checked date, shown everywhere the price is shown

## Rules

- **No invented prices, ever.** A price is either a real walmart.ca lookup with a date, or typed in by Irene, or the item shows "price needed".
- Recipe cost is approximate and labelled approximate: recipe amount converted to package units, costed proportionally. Where a conversion is unknown (a pinch, to taste), the ingredient is listed but excluded from the cost with a small marker.
- Prices are editable in place. Editing sets source to Irene and updates the date.
- A pantry screen lists every item, its price, its age, and which recipes use it, sorted so "price needed" and oldest prices surface first. This is the worklist for price refresh sessions.

## Done when

A recipe shows its approximate cost from real or Irene-entered prices, unknown prices show as "price needed", verified in the browser.
