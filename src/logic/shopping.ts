import { DAYS, MEALS, SECTIONS, slotKey, type Dish, type Section, type Unit, type WeekPlan } from "../data/types";

// Turns a week plan into one shopping list: scaled by people x times eaten,
// duplicates merged, grouped by store section.

export interface ListItem {
  key: string;       // stable id for "I have this"
  item: string;
  section: Section;
  unit: Unit;
  qty: number;       // in base unit (g, ml, pc, slice)
  usedIn: string[];  // dish names
}

export interface ShoppingList {
  sections: { section: Section; items: ListItem[] }[];
  pantry: { item: string; usedIn: string[] }[];
  mealsCounted: number;
}

// A few common name variants so lists merge regardless of wording.
const ALIASES: Record<string, string> = {
  cilantro: "Coriander leaves (cilantro)",
  coriander: "Coriander leaves (cilantro)",
  "coriander leaves": "Coriander leaves (cilantro)",
  brinjal: "Eggplant",
  aubergine: "Eggplant",
  capsicum: "Bell pepper",
  "lady finger": "Okra",
  "ladies finger": "Okra",
  bhindi: "Okra",
  curd: "Plain yogurt",
  yoghurt: "Plain yogurt",
  shrimp: "Prawns (shrimp)",
  prawns: "Prawns (shrimp)",
};

export function canonicalName(name: string): string {
  const t = name.trim();
  return ALIASES[t.toLowerCase()] ?? t;
}

export function buildList(plan: WeekPlan, dishes: Map<string, Dish>, household: number): ShoppingList {
  const items = new Map<string, ListItem>();
  const pantry = new Map<string, Set<string>>();
  let mealsCounted = 0;

  const addIng = (name: string, qty: number, unit: Unit, section: Section, dishName: string) => {
    const item = canonicalName(name);
    const key = `${item.toLowerCase()}|${unit}`;
    const cur = items.get(key) ?? { key, item, section, unit, qty: 0, usedIn: [] };
    cur.qty += qty;
    if (!cur.usedIn.includes(dishName)) cur.usedIn.push(dishName);
    items.set(key, cur);
  };

  for (const day of DAYS) {
    for (const meal of MEALS) {
      const entry = plan.slots[slotKey(day, meal)];
      if (!entry) continue;
      const people = entry.people ?? household;
      let counted = false;
      for (const it of entry.items) {
        const dish = it.dishId ? dishes.get(it.dishId) : undefined;
        if (!dish) continue;
        counted = true;
        for (const ing of dish.perServing) addIng(ing.item, ing.qty * people, ing.unit, ing.section, dish.name);
        for (const addOnId of it.addOnIds) {
          const a = dish.addOns.find((x) => x.id === addOnId);
          if (!a) continue;
          for (const ing of a.perServing) addIng(ing.item, ing.qty * people, ing.unit, ing.section, `${dish.name} + ${a.name}`);
        }
        for (const p of dish.pantry) {
          const k = p.trim().toLowerCase();
          if (!k) continue;
          const s = pantry.get(k) ?? new Set<string>();
          s.add(dish.name);
          pantry.set(k, s);
        }
      }
      if (counted) mealsCounted++;
    }
  }

  const sections = SECTIONS.map((section) => ({
    section,
    items: [...items.values()].filter((x) => x.section === section).sort((a, b) => a.item.localeCompare(b.item)),
  })).filter((s) => s.items.length > 0);

  return {
    sections,
    pantry: [...pantry.entries()]
      .map(([item, set]) => ({ item, usedIn: [...set] }))
      .sort((a, b) => a.item.localeCompare(b.item)),
    mealsCounted,
  };
}

const round = (n: number, step: number) => Math.ceil(n / step - 1e-9) * step;
const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ""));

/** Human quantity: 1250 g -> "1.25 kg", 2.5 pc -> "3", 350 ml -> "350 ml". */
export function formatQty(qty: number, unit: Unit): string {
  if (unit === "g") {
    if (qty >= 1000) return `${trim(round(qty / 1000, 0.05))} kg`;
    return `${trim(round(qty, qty < 50 ? 5 : 10))} g`;
  }
  if (unit === "ml") {
    if (qty >= 1000) return `${trim(round(qty / 1000, 0.05))} L`;
    return `${trim(round(qty, qty < 50 ? 5 : 10))} ml`;
  }
  const n = Math.ceil(qty - 1e-9);
  return unit === "slice" ? `${n} slice${n === 1 ? "" : "s"}` : `${n}`;
}

export function listAsText(list: ShoppingList, have: Set<string>, title: string): string {
  const lines: string[] = [`🛒 ${title}`];
  for (const s of list.sections) {
    const remaining = s.items.filter((x) => !have.has(x.key));
    if (remaining.length === 0) continue;
    lines.push("", `*${s.section.toUpperCase()}*`);
    for (const x of remaining) lines.push(`• ${x.item} — ${formatQty(x.qty, x.unit)}`);
  }
  const pantry = list.pantry.filter((p) => !have.has(`pantry|${p.item}`));
  if (pantry.length) {
    lines.push("", "*CHECK PANTRY*", pantry.map((p) => p.item).join(", "));
  }
  lines.push("", "Made with Mealer");
  return lines.join("\n");
}
