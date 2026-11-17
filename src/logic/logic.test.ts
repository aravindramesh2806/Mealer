import { describe, expect, it } from "vitest";
import { CATALOG } from "../data/dishes";
import { TEMPLATES } from "../data/templates";
import { DAYS, slotKey, type Profile, type WeekPlan } from "../data/types";
import { mondayOf, planningWeek } from "./dates";
import { draftWeek, eatenHistory } from "./draft";
import { buildList, canonicalName, formatQty, listAsText } from "./shopping";

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
