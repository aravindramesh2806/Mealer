import { templateById } from "../data/templates";
import type { Category, Cuisine, DietPref, Dish, Meal } from "../data/types";
import { dietAllows } from "./draft";

// First-time setup choices in plain language, turned into the profile's meal patterns and dish list.

export type MealStyle = "simple" | "plate" | "indian" | "asian";

export const MEAL_STYLES: { id: MealStyle; label: string; example: string }[] = [
  { id: "simple", label: "One dish", example: "Pasta, burrito bowl, fried rice" },
  { id: "plate", label: "A plate with sides", example: "Salmon, roast potatoes, broccoli" },
  { id: "indian", label: "Indian home style", example: "Rice + 2 veg + dal, or roti + curry" },
  { id: "asian", label: "Rice and a few dishes", example: "Rice + teriyaki chicken + greens" },
];

const STYLE_TEMPLATES: Record<MealStyle, { lunch: string; dinner: string }> = {
  simple: { lunch: "one-dish", dinner: "one-dish" },
  plate: { lunch: "one-dish", dinner: "main-sides" },
  indian: { lunch: "indian-veg-lunch", dinner: "roti-curry" },
  asian: { lunch: "one-dish", dinner: "rice-and-dishes" },
};

/** Meal patterns for the chosen style and the meals the person wants planned. */
export function defaultsFor(style: MealStyle, plan: Record<Meal, boolean>): Record<Meal, string | null> {
  const t = STYLE_TEMPLATES[style];
  return {
    breakfast: plan.breakfast ? "breakfast-one" : null,
    lunch: plan.lunch ? t.lunch : null,
    dinner: plan.dinner ? t.dinner : null,
  };
}

const INDIAN: Cuisine[] = ["south-indian", "north-indian"];
const RICE_AND_DISHES: Cuisine[] = ["chinese", "japanese", "korean", "thai", "vietnamese"];

/** A sensible starting style from the cuisines picked; the person can change it. */
export function guessStyle(cuisines: Cuisine[]): MealStyle {
  if (cuisines.some((c) => INDIAN.includes(c))) return "indian";
  const asian = cuisines.filter((c) => RICE_AND_DISHES.includes(c)).length;
  const other = cuisines.filter((c) => c !== "everyday" && !RICE_AND_DISHES.includes(c)).length;
  if (asian > 0 && asian > other) return "asian";
  return "plate";
}

/** Staples that make patterns work: plain rice for everyone, roti only for Indian kitchens. */
export const STAPLES = ["steamed-rice"];
const INDIAN_STAPLES = ["chapati"];

/**
 * Dishes to start with: popular ones from the chosen cuisines, plus enough of each dish role the
 * chosen patterns need (so no slot is left empty), plus staples.
 */
export function starterLibrary(
  catalog: Dish[], cuisines: Cuisine[], dietPref: DietPref, defaults: Record<Meal, string | null>,
): string[] {
  const offered = catalog.filter((d) => cuisines.includes(d.cuisine) && dietAllows(dietPref, d));
  const lib = new Set(offered.filter((d) => d.popular).map((d) => d.id));

  const needed = new Map<Category, Meal[]>();
  for (const [meal, tid] of Object.entries(defaults) as [Meal, string | null][]) {
    const t = tid ? templateById(tid) : undefined;
    for (const slot of t?.slots ?? []) for (const c of slot.categories) needed.set(c, [...(needed.get(c) ?? []), meal]);
  }
  for (const [cat, meals] of needed) {
    const fits = offered.filter((d) => d.category === cat && d.meals.some((m) => meals.includes(m)));
    let have = fits.filter((d) => lib.has(d.id)).length;
    for (const d of fits) {
      if (have >= 3) break;
      if (!lib.has(d.id)) { lib.add(d.id); have++; }
    }
  }

  for (const s of STAPLES) lib.add(s);
  if (cuisines.some((c) => INDIAN.includes(c))) for (const s of INDIAN_STAPLES) lib.add(s);
  return [...lib];
}
