import type { AppData } from "../types";

const NOW = "2026-08-29T00:00:00.000Z";

/**
 * One sample recipe so every screen can be tested before Irene's real
 * recipes go in. Everything here is marked sample and gets deleted then.
 * Sample prices are placeholders, labelled as not real in the UI.
 */
export const SEED: AppData = {
  recipes: [
    {
      id: "sample-cookies",
      title: "SAMPLE: Golden Butter Cookies",
      story: "A sample recipe to try the screens with. Delete me once your real Family Recipes arrive.",
      category: "Dessert",
      servings: 24,
      prepMin: 15,
      cookMin: 12,
      tags: ["sample"],
      ingredients: [
        { id: "i1", name: "butter", amount: 1, unit: "cups", note: "softened" },
        { id: "i2", name: "granulated sugar", amount: 0.75, unit: "cups" },
        { id: "i3", name: "all-purpose flour", amount: 2.25, unit: "cups" },
        { id: "i4", name: "eggs", amount: 1, unit: "" },
        { id: "i5", name: "vanilla extract", amount: 2, unit: "tsp" },
        { id: "i6", name: "salt", amount: null, unit: "", note: "a pinch" },
      ],
      steps: [
        "Cream the butter and sugar until pale and fluffy.",
        "Beat in the egg and vanilla.",
        "Fold in the flour and salt until a soft dough forms.",
        "Roll into balls, flatten gently, and bake at 350 F for 10 to 12 minutes until the edges turn gold.",
      ],
      isSample: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ],
  pantry: [
    {
      id: "p-butter",
      name: "butter",
      packageLabel: "454 g block (sample)",
      priceCad: 5.0,
      priceSource: "sample",
      lastChecked: "2026-08-29",
      perPackage: { amount: 2, unit: "cups" },
      isSample: true,
    },
    {
      id: "p-sugar",
      name: "granulated sugar",
      packageLabel: "2 kg bag (sample)",
      priceCad: 3.0,
      priceSource: "sample",
      lastChecked: "2026-08-29",
      perPackage: { amount: 10, unit: "cups" },
      isSample: true,
    },
    {
      id: "p-flour",
      name: "all-purpose flour",
      packageLabel: "2.5 kg bag (sample)",
      priceCad: 5.0,
      priceSource: "sample",
      lastChecked: "2026-08-29",
      perPackage: { amount: 20, unit: "cups" },
      isSample: true,
    },
    {
      id: "p-eggs",
      name: "eggs",
      packageLabel: "dozen (sample)",
      priceCad: 4.0,
      priceSource: "sample",
      lastChecked: "2026-08-29",
      perPackage: { amount: 12, unit: "" },
      isSample: true,
    },
    {
      id: "p-vanilla",
      name: "vanilla extract",
      packageLabel: "no price yet",
      priceCad: null,
      isSample: true,
    },
    {
      id: "p-salt",
      name: "salt",
      packageLabel: "no price yet",
      priceCad: null,
      isSample: true,
    },
  ],
  plans: [],
  suggestions: [
    {
      id: "sample-suggestion",
      title: "SAMPLE: Vanilla Sugar Twists",
      reason: "Uses the butter, sugar, flour and vanilla your sample recipe already calls for.",
      usesFromPantry: ["butter", "granulated sugar", "all-purpose flour", "vanilla extract", "eggs"],
      extrasNeeded: ["cinnamon"],
      category: "Dessert",
      servings: 16,
      ingredients: [
        { id: "s1", name: "butter", amount: 0.5, unit: "cups" },
        { id: "s2", name: "granulated sugar", amount: 0.5, unit: "cups" },
        { id: "s3", name: "all-purpose flour", amount: 1.5, unit: "cups" },
        { id: "s4", name: "eggs", amount: 1, unit: "" },
        { id: "s5", name: "vanilla extract", amount: 1, unit: "tsp" },
        { id: "s6", name: "cinnamon", amount: 1, unit: "tsp" },
      ],
      steps: [
        "Make a simple dough from the butter, sugar, flour, egg and vanilla.",
        "Roll into ropes, twist in pairs, dust with cinnamon sugar.",
        "Bake at 350 F for 12 to 14 minutes.",
      ],
      status: "new",
      isSample: true,
      createdAt: NOW,
    },
  ],
};
