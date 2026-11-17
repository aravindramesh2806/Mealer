import { describe, expect, it } from "vitest";
import { CATALOG } from "../data/dishes";
import { TEMPLATES } from "../data/templates";
import { CUISINE_LABEL, DAYS, slotKey, type Cuisine, type Profile, type WeekPlan } from "../data/types";
import { mondayOf, planningWeek } from "./dates";
import { draftWeek, eatenHistory } from "./draft";
import { buildList, canonicalName, formatQty, listAsText } from "./shopping";
import { calorieTarget, dayMacros, dishMacros, dishTags, entryMacros, lookup, proteinTarget } from "./nutrition";

const dishes = new Map(CATALOG.map((d) => [d.id, d]));

const profile = (over: Partial<Profile> = {}): Profile => ({
  household: 2,
  dietPref: "everything",
  cuisines: ["south-indian", "american"],
  defaults: { breakfast: "breakfast-one", lunch: "indian-veg-lunch", dinner: null },
  dayOverrides: {},
  noRepeatDays: 3,
  library: CATALOG.filter((d) => d.cuisine === "south-indian" || d.cuisine === "american").map((d) => d.id),
  ...over,
});

describe("catalog", () => {
  it("has unique ids and valid quantities", () => {
    const ids = new Set<string>();
    for (const d of CATALOG) {
      expect(ids.has(d.id), d.id).toBe(false);
      ids.add(d.id);
      expect(d.perServing.length, d.id).toBeGreaterThan(0);
      for (const ing of d.perServing) expect(ing.qty, `${d.id} ${ing.item}`).toBeGreaterThan(0);
    }
  });

  it("every template slot can be filled from the catalog", () => {
    for (const t of TEMPLATES) {
      for (const s of t.slots) {
        const ok = CATALOG.some((d) => s.categories.includes(d.category) && t.meals.some((m) => d.meals.includes(m)));
        expect(ok, `${t.id}/${s.id}`).toBe(true);
        if (s.defaultDishId) expect(dishes.has(s.defaultDishId), s.defaultDishId).toBe(true);
      }
    }
  });
});

describe("cuisines", () => {
  const ALL = Object.keys(CUISINE_LABEL) as Cuisine[];
  const of = (c: Cuisine) => CATALOG.filter((d) => d.cuisine === c);

  // 2026-11-17: added with Thai, Japanese, Korean and Vietnamese, so no cuisine picked alone leaves a vegetarian empty.
  it("every cuisine has pre-ticked, vegetarian breakfast and one-dish options", () => {
    for (const c of ALL) {
      const ds = of(c);
      expect(ds.some((d) => d.popular && d.diet === "veg"), `${c} popular veg`).toBe(true);
      expect(ds.some((d) => d.category === "breakfast" && d.diet === "veg"), `${c} veg breakfast`).toBe(true);
      expect(ds.some((d) => d.category === "main" && d.diet === "veg"), `${c} veg one-dish`).toBe(true);
    }
  });

  it("the newer cuisines fill every dish role on their own", () => {
    const roles = ["breakfast", "main", "protein", "veg", "dal", "starch", "salad"] as const;
    for (const c of ["everyday", "thai", "japanese", "korean", "vietnamese", "french", "caribbean", "mexican", "italian", "mediterranean", "american", "chinese"] as Cuisine[]) {
      for (const r of roles) expect(of(c).some((d) => d.category === r), `${c} ${r}`).toBe(true);
    }
  });

  it("everyday basics include eggs and oats for breakfast, and lunch/dinner plates", () => {
    const ev = of("everyday");
    for (const id of ["eggs-toast", "overnight-oats", "veg-omelette", "hot-oatmeal", "bagel-cream-cheese", "croissant-jam"]) expect(ev.some((d) => d.id === id), id).toBe(true);
    expect(ev.filter((d) => d.category === "main" && d.meals.includes("lunch") && d.meals.includes("dinner")).length).toBeGreaterThanOrEqual(5);
  });

  it("non-Indian dishes outnumber Indian ones at least 3 to 1", () => {
    const indian = CATALOG.filter((d) => d.cuisine === "south-indian" || d.cuisine === "north-indian").length;
    expect(CATALOG.length - indian).toBeGreaterThanOrEqual(3 * indian);
  });

  it("a single new cuisine drafts a full week", () => {
    for (const c of ["thai", "japanese", "korean", "vietnamese", "french", "caribbean"] as Cuisine[]) {
      const p = profile({
        cuisines: [c],
        defaults: { breakfast: "breakfast-one", lunch: "one-dish", dinner: "rice-and-dishes" },
        library: of(c).map((d) => d.id),
      });
      const plan = draftWeek("2026-11-23", p, dishes, []);
      for (const day of DAYS) {
        for (const meal of ["breakfast", "lunch", "dinner"] as const) {
          for (const it of plan.slots[slotKey(day, meal)]!.items) expect(it.dishId, `${c} ${day} ${meal} ${it.slotId}`).not.toBeNull();
        }
      }
    }
  });
});

describe("draftWeek", () => {
  const week = "2026-11-23";

  it("fills defaults and leaves skipped meals empty", () => {
    const plan = draftWeek(week, profile(), dishes, []);
    for (const day of DAYS) {
      expect(plan.slots[slotKey(day, "dinner")]).toBeNull();
      const lunch = plan.slots[slotKey(day, "lunch")]!;
      expect(lunch.templateId).toBe("indian-veg-lunch");
      expect(lunch.items.find((x) => x.slotId === "r")!.dishId).toBe("steamed-rice");
    }
  });

  it("uses two different vegetables in one meal and avoids near repeats", () => {
    const plan = draftWeek(week, profile(), dishes, []);
    const vegByDay = DAYS.map((d) => {
      const items = plan.slots[slotKey(d, "lunch")]!.items;
      return [items[0].dishId, items[1].dishId];
    });
    for (const [a, b] of vegByDay) expect(a).not.toBe(b);
    // South Indian library has 10+ veg dishes, so no veg repeats within 3 days.
    for (let k = 0; k < vegByDay.length; k++) {
      for (let j = k + 1; j < Math.min(k + 3, vegByDay.length); j++) {
        for (const v of vegByDay[k]) expect(vegByDay[j]).not.toContain(v);
      }
    }
  });

  it("respects vegetarian diet and day overrides", () => {
    const p = profile({ dietPref: "vegetarian", dayOverrides: { "wed-lunch": "indian-nonveg-lunch" } });
    const plan = draftWeek(week, p, dishes, []);
    for (const entry of Object.values(plan.slots)) {
      for (const it of entry?.items ?? []) if (it.dishId) expect(dishes.get(it.dishId)!.diet).toBe("veg");
    }
    expect(plan.slots["wed-lunch"]!.templateId).toBe("indian-nonveg-lunch");
  });

  it("rotates away from last week's dishes", () => {
    const p = profile({ defaults: { breakfast: "breakfast-one", lunch: null, dinner: null } });
    const last = draftWeek("2026-11-16", p, dishes, []);
    const lastSun = last.slots["sun-breakfast"]!.items[0].dishId;
    const next = draftWeek(week, p, dishes, [last]);
    expect(next.slots["mon-breakfast"]!.items[0].dishId).not.toBe(lastSun);
  });

  it("history counts every eaten dish", () => {
    const plan = draftWeek(week, profile(), dishes, []);
    expect(eatenHistory([plan]).get("steamed-rice")!.length).toBe(7);
  });
});

describe("shopping list", () => {
  const plan: WeekPlan = {
    weekStart: "2026-11-23",
    haveItems: [],
    slots: {
      "mon-breakfast": { templateId: "breakfast-one", items: [{ slotId: "b", dishId: "overnight-oats", addOnIds: ["almonds"] }] },
      "tue-breakfast": { templateId: "breakfast-one", items: [{ slotId: "b", dishId: "overnight-oats", addOnIds: [] }] },
      "wed-breakfast": { templateId: "breakfast-one", items: [{ slotId: "b", dishId: "overnight-oats", addOnIds: [] }], people: 6 },
      "mon-lunch": null,
    },
  };

  it("scales by people and times eaten, merges, and includes add-ons", () => {
    const list = buildList(plan, dishes, 4);
    const all = list.sections.flatMap((s) => s.items);
    const oats = all.find((x) => x.item === "Rolled oats")!;
    expect(oats.qty).toBe(50 * 4 + 50 * 4 + 50 * 6);
    const almonds = all.find((x) => x.item === "Almonds")!;
    expect(almonds.qty).toBe(15 * 4);
    expect(list.mealsCounted).toBe(3);
    expect(list.pantry.map((p) => p.item)).toContain("honey");
  });

  it("formats quantities for humans", () => {
    expect(formatQty(1200, "g")).toBe("1.2 kg");
    expect(formatQty(333, "g")).toBe("340 g");
    expect(formatQty(2.5, "pc")).toBe("3");
    expect(formatQty(1, "slice")).toBe("1 slice");
    expect(formatQty(1500, "ml")).toBe("1.5 L");
  });

  it("merges name variants", () => {
    expect(canonicalName("Cilantro")).toBe(canonicalName("coriander"));
    expect(canonicalName("brinjal")).toBe("Eggplant");
  });

  it("text export skips items the user has", () => {
    const list = buildList(plan, dishes, 4);
    const key = list.sections.flatMap((s) => s.items).find((x) => x.item === "Milk")!.key;
    const text = listAsText(list, new Set([key]), "Week");
    expect(text).toContain("Rolled oats");
    expect(text).not.toContain("Milk");
  });
});

describe("dates", () => {
  it("finds Monday and the planning week", () => {
    expect(mondayOf(new Date(2026, 10, 18))).toBe("2026-11-16"); // Wed
    expect(planningWeek(new Date(2026, 10, 22))).toBe("2026-11-23"); // Sunday -> next week
    expect(planningWeek(new Date(2026, 10, 17))).toBe("2026-11-16"); // Tuesday -> this week
  });
});

describe("nutrition", () => {
  it("every catalog and add-on ingredient has nutrition values", () => {
    const missing = new Set<string>();
    for (const d of CATALOG) {
      for (const ing of [...d.perServing, ...d.addOns.flatMap((a) => a.perServing)]) if (!lookup(ing.item)) missing.add(ing.item);
    }
    expect([...missing]).toEqual([]);
  });

  it("estimates dish macros from ingredients", () => {
    const m = dishMacros(dishes.get("grilled-chicken-breast")!);
    expect(Math.round(m.kcal)).toBe(204); // 170 g chicken breast
    expect(Math.round(m.protein)).toBe(39);
    expect(dishTags(dishes.get("grilled-chicken-breast")!)).toEqual(["high-protein", "low-fat", "low-carb", "light"]);
  });

  it("calorie target follows Mifflin-St Jeor with a floor", () => {
    const b = { heightCm: 175, weightKg: 75, age: 30, sex: "male", activity: "moderate", aim: "lose", units: "metric" } as const;
    expect(calorieTarget(b)).toBe(2130); // (750 + 1093.75 - 150 + 5) * 1.55 - 500
    expect(calorieTarget({ ...b, sex: "female", heightCm: 150, weightKg: 45, age: 70, activity: "sedentary" })).toBe(1200);
    expect(proteinTarget(b)).toBe(120);
    expect(proteinTarget({ ...b, aim: "maintain" })).toBe(75);
  });

  it("goals steer drafting toward matching dishes", () => {
    const lib = CATALOG.filter((d) => d.category === "breakfast").map((d) => d.id);
    const base = profile({ defaults: { breakfast: "breakfast-one", lunch: null, dinner: null }, library: lib, noRepeatDays: 0 });
    const proteinOf = (p: Profile) => {
      const plan = draftWeek("2026-11-23", p, dishes, []);
      return DAYS.reduce((t, d) => t + entryMacros(plan.slots[slotKey(d, "breakfast")], dishes).protein, 0);
    };
    expect(proteinOf({ ...base, goals: ["high-protein"] })).toBeGreaterThan(proteinOf(base));
  });

  it("a calorie target pulls meals toward its share", () => {
    const lib = CATALOG.filter((d) => d.category === "main").map((d) => d.id);
    const small = { heightCm: 155, weightKg: 50, age: 60, sex: "female", activity: "sedentary", aim: "lose", units: "metric" } as const;
    const big = { heightCm: 190, weightKg: 95, age: 25, sex: "male", activity: "very", aim: "gain", units: "metric" } as const;
    const kcal = (body: typeof small | typeof big) => {
      const p = profile({ defaults: { breakfast: null, lunch: "one-dish", dinner: "one-dish" }, library: lib, noRepeatDays: 0, body });
      const plan = draftWeek("2026-11-23", p, dishes, []);
      return DAYS.reduce((t, d) => t + dayMacros(plan, d, dishes).kcal, 0);
    };
    expect(kcal(big)).toBeGreaterThan(kcal(small));
  });
});
