import { templateById } from "../data/templates";
import {
  DAYS, MEALS, slotKey,
  type Day, type Dish, type DietPref, type Meal, type MealEntry, type Profile, type TemplateSlot, type WeekPlan,
} from "../data/types";
import { dayNumber } from "./dates";
import { dishMacros, dishTags, slotBudget } from "./nutrition";

// Rule-based week drafting. No AI and no randomness the user can't explain:
// suggestions come only from the user's own library, least-recently-eaten first.

export function dietAllows(pref: DietPref, dish: Dish): boolean {
  if (pref === "everything") return true;
  if (pref === "eggetarian") return dish.diet !== "nonveg";
  return dish.diet === "veg";
}

/** day number -> dish ids eaten that day, across all saved weeks. */
export function eatenHistory(plans: WeekPlan[]): Map<string, number[]> {
  const last = new Map<string, number[]>();
  for (const plan of plans) {
    for (const day of DAYS) {
      for (const meal of MEALS) {
        const entry = plan.slots[slotKey(day, meal)];
        if (!entry) continue;
        const n = dayNumber(plan.weekStart, day);
        for (const it of entry.items) {
          if (!it.dishId) continue;
          const arr = last.get(it.dishId) ?? [];
          arr.push(n);
          last.set(it.dishId, arr);
        }
      }
    }
  }
  return last;
}

/** Small deterministic hash so ties break the same way for the same week/slot. */
function hash(s: string): number {
  let h = 2166136261;
  for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619);
  return (h >>> 0) / 4294967296;
}

export interface RankContext {
  profile: Profile;
  dishes: Map<string, Dish>;
  history: Map<string, number[]>;
  today: number;      // day number of the slot being filled
  meal: Meal;
  exclude: Set<string>; // already used in this meal
  seed: string;
  /** Calories one serving in this slot should aim for (from the user's target), if known. */
  budget?: number | null;
}

/** Bonus for fitting the user's goals and calorie budget. Smaller than the no-repeat penalty, so rotation still wins. */
export function fitScore(dish: Dish, profile: Profile, budget?: number | null): number {
  let s = 0;
  const goals = profile.goals ?? [];
  if (goals.length) {
    const tags = dishTags(dish);
    s += 15 * goals.filter((g) => tags.includes(g)).length;
  }
  if (budget) {
    const off = Math.abs(dishMacros(dish).kcal - budget) / budget;
    s += 20 * (1 - Math.min(1, off));
  }
  return s;
}

/** Candidate dishes for a slot, best first. */
export function rankCandidates(slot: TemplateSlot, ctx: RankContext): Dish[] {
  const scored: { dish: Dish; score: number }[] = [];
  for (const id of ctx.profile.library) {
    const dish = ctx.dishes.get(id);
    if (!dish) continue;
    if (!slot.categories.includes(dish.category)) continue;
    if (!dish.meals.includes(ctx.meal)) continue;
    if (!dietAllows(ctx.profile.dietPref, dish)) continue;
    if (ctx.exclude.has(id)) continue;
    const days = ctx.history.get(id) ?? [];
    // Distance to the nearest time it's eaten (before or after, since we fill a whole week).
    let gap = Infinity;
    for (const n of days) gap = Math.min(gap, Math.abs(ctx.today - n));
    let score = gap === Infinity ? 1000 : gap;
    if (gap < ctx.profile.noRepeatDays) score -= 500; // strongly avoid near repeats
    // 2026-11-17: prefer dishes that fit diet goals and the calorie target.
    score += fitScore(dish, ctx.profile, ctx.budget);
    score += hash(ctx.seed + id); // tie-break
    scored.push({ dish, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.dish);
}

export function templateFor(profile: Profile, day: Day, meal: Meal): string | null {
  const o = profile.dayOverrides[slotKey(day, meal)];
  if (o === "skip") return null;
  return o ?? profile.defaults[meal];
}

/** Fill one meal entry for a given template. */
export function fillEntry(
  templateId: string, day: Day, meal: Meal, weekStart: string,
  profile: Profile, dishes: Map<string, Dish>, history: Map<string, number[]>,
): MealEntry {
  const template = templateById(templateId);
  const entry: MealEntry = { templateId, items: [] };
  if (!template) return entry;
  const today = dayNumber(weekStart, day);
  const exclude = new Set<string>();
  for (const slot of template.slots) {
    let dishId: string | null = null;
    if (slot.defaultDishId && profile.library.includes(slot.defaultDishId)) {
      dishId = slot.defaultDishId;
    } else {
      const mealsToday = MEALS.filter((m) => templateFor(profile, day, m));
      const budget = slotBudget(profile, meal, mealsToday.length ? mealsToday : [meal], templateId, slot.id);
      const ranked = rankCandidates(slot, {
        profile, dishes, history, today, meal, exclude, seed: `${weekStart}-${day}-${meal}-${slot.id}`, budget,
      });
      dishId = ranked[0]?.id ?? null;
    }
    if (dishId) {
      exclude.add(dishId);
      // Record immediately so later slots in the week rotate away from it.
      if (!slot.defaultDishId) {
        const arr = history.get(dishId) ?? [];
        arr.push(today);
        history.set(dishId, arr);
      }
    }
    entry.items.push({ slotId: slot.id, dishId, addOnIds: [] });
  }
  return entry;
}

/**
 * Draft a full week from the user's defaults, rotating against other weeks' history.
 * `haveItems` is carried over so a re-draft doesn't lose shopping ticks.
 */
export function draftWeek(
  weekStart: string, profile: Profile, dishes: Map<string, Dish>,
  allPlans: WeekPlan[], haveItems: string[] = [],
): WeekPlan {
  const plan: WeekPlan = { weekStart, slots: {}, haveItems };
  const history = eatenHistory(allPlans.filter((p) => p.weekStart !== weekStart));
  for (const day of DAYS) {
    for (const meal of MEALS) {
      const key = slotKey(day, meal);
      const t = templateFor(profile, day, meal);
      plan.slots[key] = t ? fillEntry(t, day, meal, weekStart, profile, dishes, history) : null;
    }
  }
  return plan;
}
