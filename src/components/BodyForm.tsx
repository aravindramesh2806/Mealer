import { useState } from "react";
import type { Activity, Aim, Body, Goal } from "../data/types";
import { calorieTarget, cmFromIn, inFromCm, kgFromLb, lbFromKg, proteinTarget } from "../logic/nutrition";

// Height, weight, age, sex, activity and aim -> a daily calorie and protein target.
// Used in setup (skippable) and in Settings.

export interface BodyDraft {
  units: "metric" | "us";
  height: string; // cm or inches
  weight: string; // kg or lb
  age: string;
  sex: Body["sex"];
  activity: Activity;
  aim: Aim;
}

export const emptyDraft = (): BodyDraft => ({
  units: "metric", height: "", weight: "", age: "", sex: "female", activity: "light", aim: "maintain",
});

export function draftFromBody(b: Body): BodyDraft {
  const us = b.units === "us";
  return {
    units: b.units,
    height: String(Math.round(us ? inFromCm(b.heightCm) : b.heightCm)),
    weight: String(Math.round(us ? lbFromKg(b.weightKg) : b.weightKg)),
    age: String(b.age), sex: b.sex, activity: b.activity, aim: b.aim,
  };
}

/** A Body when the numbers are complete and plausible, else null. */
export function bodyFromDraft(d: BodyDraft): Body | null {
  const h = parseFloat(d.height), w = parseFloat(d.weight), age = parseFloat(d.age);
  const heightCm = d.units === "us" ? cmFromIn(h) : h;
  const weightKg = d.units === "us" ? kgFromLb(w) : w;
  if (!(heightCm >= 100 && heightCm <= 250 && weightKg >= 30 && weightKg <= 300 && age >= 13 && age <= 100)) return null;
  return { heightCm, weightKg, age, sex: d.sex, activity: d.activity, aim: d.aim, units: d.units };
}

const ACTIVITY_LABEL: [Activity, string][] = [
  ["sedentary", "Mostly sitting"],
  ["light", "Light exercise 1–3 days a week"],
  ["moderate", "Exercise 3–5 days a week"],
  ["very", "Hard exercise most days"],
];
const AIMS: [Aim, string][] = [["lose", "Lose"], ["maintain", "Keep"], ["gain", "Gain"]];

export function BodyForm({ draft, goals, onChange }: { draft: BodyDraft; goals?: Goal[]; onChange: (d: BodyDraft) => void }) {
  const set = (patch: Partial<BodyDraft>) => onChange({ ...draft, ...patch });
  const body = bodyFromDraft(draft);
  const us = draft.units === "us";

  const switchUnits = (units: BodyDraft["units"]) => {
    if (units === draft.units) return;
    const b = bodyFromDraft(draft);
    if (b) onChange(draftFromBody({ ...b, units }));
    else set({ units, height: "", weight: "" });
  };

  return (
    <div className="body-form">
      <div className="seg-tabs" role="group" aria-label="Units">
        <button type="button" className={!us ? "on" : ""} aria-pressed={!us} onClick={() => switchUnits("metric")}>kg · cm</button>
        <button type="button" className={us ? "on" : ""} aria-pressed={us} onClick={() => switchUnits("us")}>lb · in</button>
      </div>
      <div className="body-grid">
        <label>Height ({us ? "in" : "cm"})
          <input type="number" inputMode="decimal" value={draft.height} onChange={(e) => set({ height: e.target.value })} />
        </label>
        <label>Weight ({us ? "lb" : "kg"})
          <input type="number" inputMode="decimal" value={draft.weight} onChange={(e) => set({ weight: e.target.value })} />
        </label>
        <label>Age
          <input type="number" inputMode="numeric" value={draft.age} onChange={(e) => set({ age: e.target.value })} />
        </label>
        <label>Sex (for the formula)
          <select value={draft.sex} onChange={(e) => set({ sex: e.target.value as Body["sex"] })}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </label>
      </div>
      <label className="body-wide">How active are you?
        <select value={draft.activity} onChange={(e) => set({ activity: e.target.value as Activity })}>
          {ACTIVITY_LABEL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <div className="body-wide">
        <span>Your aim</span>
        <div className="seg" role="group" aria-label="Aim">
          {AIMS.map(([v, l]) => (
            <button key={v} type="button" className={draft.aim === v ? "sel" : ""} aria-pressed={draft.aim === v} onClick={() => set({ aim: v })}>{l}</button>
          ))}
        </div>
      </div>
      <BodyTarget body={body} goals={goals} />
    </div>
  );
}

export function BodyTarget({ body, goals }: { body: Body | null; goals?: Goal[] }) {
  return (
    <div className="target" aria-live="polite">
      {body ? (
        <>
          <span className="small">Your daily target</span>
          <b className="target-num">≈ {calorieTarget(body).toLocaleString()} kcal · {proteinTarget(body, goals)} g protein</b>
          <span className="small">Estimate (Mifflin–St Jeor). Mealer aims each day near this, per person.</span>
        </>
      ) : (
        <span className="small">Enter height, weight and age to see your daily target.</span>
      )}
    </div>
  );
}

/** Keeps a draft in sync with an optional Body. */
export function useBodyDraft(body: Body | undefined) {
  return useState<BodyDraft>(() => (body ? draftFromBody(body) : emptyDraft()));
}
