import { useState } from "react";
import { templateById, TEMPLATES } from "../data/templates";
import {
  DAY_LABEL, DAYS, GOAL_LABEL, MEALS, slotKey,
  type Day, type Dish, type Meal, type MealEntry, type Profile, type WeekPlan,
} from "../data/types";
import { dayNumber } from "../logic/dates";
import { eatenHistory, fillEntry, rankCandidates, templateFor } from "../logic/draft";
import { calorieTarget, dayMacros, dishMacros, dishTags, proteinTarget, slotBudget } from "../logic/nutrition";

const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

interface Props {
  plan: WeekPlan;
  allPlans: WeekPlan[];
  profile: Profile;
  dishes: Map<string, Dish>;
  onChange: (plan: WeekPlan) => void;
}

interface Picking { day: Day; meal: Meal; slotId: string }

const fmt = (n: number) => Math.round(n).toLocaleString();

export function WeekView({ plan, allPlans, profile, dishes, onChange }: Props) {
  const [picking, setPicking] = useState<Picking | null>(null);
  const kcalTarget = profile.body ? calorieTarget(profile.body) : null;
  const proTarget = profile.body ? proteinTarget(profile.body, profile.goals) : null;
  const [open, setOpen] = useState<Day | null>(null);

  const setEntry = (day: Day, meal: Meal, entry: MealEntry | null) =>
    onChange({ ...plan, slots: { ...plan.slots, [slotKey(day, meal)]: entry } });

  const history = () => eatenHistory([...allPlans.filter((p) => p.weekStart !== plan.weekStart), plan]);

  const changeTemplate = (day: Day, meal: Meal, templateId: string) => {
    if (templateId === "skip") return setEntry(day, meal, null);
    setEntry(day, meal, fillEntry(templateId, day, meal, plan.weekStart, profile, dishes, history()));
  };

  const updateItem = (day: Day, meal: Meal, slotId: string, f: (it: MealEntry["items"][number]) => MealEntry["items"][number]) => {
    const entry = plan.slots[slotKey(day, meal)];
    if (!entry) return;
    setEntry(day, meal, { ...entry, items: entry.items.map((it) => (it.slotId === slotId ? f(it) : it)) });
  };

  return (
    <div className="week">
      {DAYS.map((day) => {
        const planned = MEALS.filter((m) => plan.slots[slotKey(day, m)]).length;
        const totals = dayMacros(plan, day, dishes);
        const isOpen = open === day || open === null;
        return (
          <div key={day} className="day">
            <button className="day-head" onClick={() => setOpen(open === day ? null : day)}>
              <b>{DAY_LABEL[day]}</b>
              <span className="muted">{planned ? `${planned} meal${planned > 1 ? "s" : ""}` : "nothing planned"}</span>
            </button>
            {planned > 0 && (
              <div className="day-nutrition muted small" aria-label={`${DAY_LABEL[day]} nutrition`}>
                ≈ {fmt(totals.kcal)}{kcalTarget ? ` / ${fmt(kcalTarget)}` : ""} kcal · {fmt(totals.protein)}{proTarget ? ` / ${proTarget}` : ""} g protein
                <span> per person</span>
              </div>
            )}
            {isOpen && MEALS.map((meal) => {
              const entry = plan.slots[slotKey(day, meal)] ?? null;
              const template = entry ? templateById(entry.templateId) : undefined;
              return (
                <div key={meal} className={`meal ${entry ? "" : "skipped"}`}>
                  <div className="meal-head">
                    <span className="meal-name">{MEAL_LABEL[meal]}</span>
                    <select value={entry?.templateId ?? "skip"} onChange={(e) => changeTemplate(day, meal, e.target.value)}>
                      <option value="skip">Skip</option>
                      {TEMPLATES.filter((t) => t.meals.includes(meal)).map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  {entry && template && (
                    <>
                      {template.slots.map((slot) => {
                        const it = entry.items.find((x) => x.slotId === slot.id);
                        const dish = it?.dishId ? dishes.get(it.dishId) : undefined;
                        return (
                          <div key={slot.id} className="item">
                            <button className="dish" onClick={() => setPicking({ day, meal, slotId: slot.id })}>
                              <small>{slot.label}</small>
                              <span>{dish ? dish.name : "Tap to choose"}</span>
                              <em>Swap</em>
                              {dish && <i className="kcal">{fmt(dishMacros(dish).kcal)} kcal · {fmt(dishMacros(dish).protein)} g protein</i>}
                            </button>
                            {dish && dish.addOns.length > 0 && (
                              <div className="addons">
                                {dish.addOns.map((a) => {
                                  const on = it!.addOnIds.includes(a.id);
                                  return (
                                    <button key={a.id} className={`chip small ${on ? "sel" : ""}`}
                                      onClick={() => updateItem(day, meal, slot.id, (x) => ({
                                        ...x, addOnIds: on ? x.addOnIds.filter((y) => y !== a.id) : [...x.addOnIds, a.id],
                                      }))}>
                                      {on ? "✓ " : "+ "}{a.name}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div className="people">
                        <span className="muted">People</span>
                        <div className="stepper small">
                          <button onClick={() => setEntry(day, meal, { ...entry, people: Math.max(1, (entry.people ?? profile.household) - 1) })}>−</button>
                          <b>{entry.people ?? profile.household}</b>
                          <button onClick={() => setEntry(day, meal, { ...entry, people: (entry.people ?? profile.household) + 1 })}>+</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {picking && (() => {
        const entry = plan.slots[slotKey(picking.day, picking.meal)]!;
        const slot = templateById(entry.templateId)!.slots.find((s) => s.id === picking.slotId)!;
        const current = entry.items.find((x) => x.slotId === picking.slotId)?.dishId ?? null;
        const exclude = new Set(entry.items.filter((x) => x.slotId !== picking.slotId && x.dishId).map((x) => x.dishId!));
        const mealsToday = MEALS.filter((m) => templateFor(profile, picking.day, m));
        const budget = slotBudget(profile, picking.meal, mealsToday.length ? mealsToday : [picking.meal], entry.templateId, picking.slotId);
        const ranked = rankCandidates(slot, {
          profile, dishes, history: history(), today: dayNumber(plan.weekStart, picking.day),
          meal: picking.meal, exclude, seed: "swap", budget,
        });
        return (
          <div className="sheet-bg" onClick={() => setPicking(null)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <h3>{slot.label} · {DAY_LABEL[picking.day]} {MEAL_LABEL[picking.meal].toLowerCase()}</h3>
              <p className="muted">
                From your dishes. Ones you haven't had in a while come first{profile.goals?.length || budget ? ", then ones that fit your goals" : ""}.
                {budget ? ` Aim: about ${fmt(budget)} kcal here.` : ""}
              </p>
              <div className="pick-list">
                {ranked.map((d) => (
                  <button key={d.id} className={`pick ${d.id === current ? "sel" : ""}`}
                    onClick={() => { updateItem(picking.day, picking.meal, picking.slotId, (x) => ({ ...x, dishId: d.id, addOnIds: [] })); setPicking(null); }}>
                    <span>{d.name}</span>
                    <small className="muted">
                      {fmt(dishMacros(d).kcal)} kcal · {fmt(dishMacros(d).protein)} g protein
                      {dishTags(d).filter((t) => t !== "light").map((t) => <b key={t} className="tag">{GOAL_LABEL[t]}</b>)}
                    </small>
                  </button>
                ))}
                {ranked.length === 0 && <p className="muted">No dishes of this kind in your list. Add some in the Dishes tab.</p>}
                <button className="pick ghost" onClick={() => { updateItem(picking.day, picking.meal, picking.slotId, (x) => ({ ...x, dishId: null, addOnIds: [] })); setPicking(null); }}>
                  Leave empty
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
