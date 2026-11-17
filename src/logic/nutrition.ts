import { NUTRITION, type Macro } from "../data/nutrition";
import { templateById } from "../data/templates";
import {
  MEALS, slotKey,
  type Body, type Category, type Day, type Dish, type Goal, type Ingredient, type Meal, type MealEntry, type Profile, type WeekPlan,
} from "../data/types";
import { canonicalName } from "./shopping";

// Nutrition estimates from ingredient quantities. Pantry items (oil, spices, sauces) are not counted,
// so real meals run somewhat higher in fat and calories.

export interface Macros { kcal: number; protein: number; carbs: number; fat: number }
export const ZERO: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

export const add = (a: Macros, b: Macros): Macros => ({
  kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat,
});

export function lookup(item: string): Macro | undefined {
  return NUTRITION[item] ?? NUTRITION[canonicalName(item)];
}

/** Macros for one ingredient line (per serving). Unknown items count as zero. */
export function ingredientMacros(ing: Ingredient): Macros {
  const m = lookup(ing.item);
  if (!m) return ZERO;
  const f = ing.unit === "pc" || ing.unit === "slice" ? ing.qty : ing.qty / 100;
  return { kcal: m[0] * f, protein: m[1] * f, carbs: m[2] * f, fat: m[3] * f };
}

export const sumIngredients = (ings: Ingredient[]): Macros => ings.reduce((t, i) => add(t, ingredientMacros(i)), ZERO);

const cache = new WeakMap<Dish, Macros>();
/** Per-serving macros for a dish (without add-ons). */
export function dishMacros(dish: Dish): Macros {
  let m = cache.get(dish);
  if (!m) { m = sumIngredients(dish.perServing); cache.set(dish, m); }
  return m;
}

/** Per-person macros for a planned meal, including chosen add-ons. */
export function entryMacros(entry: MealEntry | null | undefined, dishes: Map<string, Dish>): Macros {
  let t = ZERO;
  for (const it of entry?.items ?? []) {
    const d = it.dishId ? dishes.get(it.dishId) : undefined;
    if (!d) continue;
    t = add(t, dishMacros(d));
    for (const a of d.addOns) if (it.addOnIds.includes(a.id)) t = add(t, sumIngredients(a.perServing));
  }
  return t;
}

export function dayMacros(plan: WeekPlan, day: Day, dishes: Map<string, Dish>): Macros {
  return MEALS.reduce((t, m) => add(t, entryMacros(plan.slots[slotKey(day, m)], dishes)), ZERO);
}

/** Which goals a dish fits, per serving. Thresholds are simple and stated in the UI. */
export function dishTags(dish: Dish): Goal[] {
  const m = dishMacros(dish);
  const tags: Goal[] = [];
  if (m.protein >= 20) tags.push("high-protein");
  if (m.fat <= 10) tags.push("low-fat");
  if (m.carbs <= 20) tags.push("low-carb");
  if (m.kcal <= 400) tags.push("light");
  return tags;
}

const ACTIVITY: Record<Body["activity"], number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 };

/** Daily calorie target: Mifflin-St Jeor resting energy x activity, then -500 to lose or +300 to gain. */
export function calorieTarget(b: Body): number {
  const bmr = 10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === "male" ? 5 : -161);
  let t = bmr * ACTIVITY[b.activity];
  if (b.aim === "lose") t -= 500;
  if (b.aim === "gain") t += 300;
  // Don't plan below common safe minimums.
  const floor = b.sex === "male" ? 1500 : 1200;
  return Math.round(Math.max(t, floor) / 10) * 10;
}

/** Daily protein target in grams: 1.6 g/kg with a high-protein goal or when losing weight, else 1.0 g/kg. */
export function proteinTarget(b: Body, goals: Goal[] = []): number {
  const perKg = goals.includes("high-protein") || b.aim === "lose" ? 1.6 : 1.0;
  return Math.round(b.weightKg * perKg);
}

const MEAL_SHARE: Record<Meal, number> = { breakfast: 0.25, lunch: 0.35, dinner: 0.4 };
const ROLE_WEIGHT: Record<Category, number> = {
  breakfast: 1, main: 1, salad: 1, protein: 0.4, starch: 0.3, dal: 0.2, veg: 0.15,
};

/** Calories one serving in this slot should aim for, given the day's planned meals. Null without a target. */
export function slotBudget(profile: Profile, meal: Meal, mealsToday: Meal[], templateId: string, slotId: string): number | null {
  if (!profile.body) return null;
  const template = templateById(templateId);
  const slot = template?.slots.find((s) => s.id === slotId);
  if (!template || !slot) return null;
  const shareTotal = mealsToday.reduce((t, m) => t + MEAL_SHARE[m], 0) || 1;
  const mealBudget = calorieTarget(profile.body) * (MEAL_SHARE[meal] / shareTotal);
  const w = (s: { categories: Category[] }) => ROLE_WEIGHT[s.categories[0]];
  const totalW = template.slots.reduce((t, s) => t + w(s), 0) || 1;
  return mealBudget * (w(slot) / totalW);
}

export const kgFromLb = (lb: number) => lb * 0.45359237;
export const lbFromKg = (kg: number) => kg / 0.45359237;
export const cmFromIn = (inch: number) => inch * 2.54;
export const inFromCm = (cm: number) => cm / 2.54;
