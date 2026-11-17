import { useRef } from "react";
import { TEMPLATES } from "../data/templates";
import {
  CUISINE_LABEL, DAY_LABEL, DAYS, GOAL_LABEL, MEALS, slotKey,
  type AppState, type Cuisine, type DietPref, type Goal, type Meal, type Profile,
} from "../data/types";
import { BodyForm, bodyFromDraft, emptyDraft, useBodyDraft } from "./BodyForm";
import { exportState, importState } from "../logic/storage";

const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

interface Props {
  state: AppState;
  profile: Profile;
  onProfile: (p: Profile) => void;
  onReplace: (s: AppState) => void;
  onReset: () => void;
  onRedraft: () => void;
}

export function SettingsView({ state, profile, onProfile, onReplace, onReset, onRedraft }: Props) {
  const file = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Profile>) => onProfile({ ...profile, ...patch });
  const [draft, setDraft] = useBodyDraft(profile.body);
  const goals = profile.goals ?? [];

  const setOverride = (key: string, value: string) => {
    const next = { ...profile.dayOverrides };
    if (value === "default") delete next[key]; else next[key] = value;
    set({ dayOverrides: next });
  };

  const download = () => {
    const blob = new Blob([exportState(state)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mealer-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const upload = async (f: File) => {
    const s = importState(await f.text());
    if (s) onReplace(s); else alert("That file isn't a Mealer backup.");
  };

  return (
    <div className="settings">
      <div className="section">
        <h4>Household</h4>
        <div className="li">
          <span className="li-name">People</span>
          <div className="stepper small">
            <button onClick={() => set({ household: Math.max(1, profile.household - 1) })}>−</button>
            <b>{profile.household}</b>
            <button onClick={() => set({ household: profile.household + 1 })}>+</button>
          </div>
        </div>
        <div className="li">
          <span className="li-name">Diet</span>
          <select value={profile.dietPref} onChange={(e) => set({ dietPref: e.target.value as DietPref })}>
            <option value="everything">Everything</option>
            <option value="eggetarian">Vegetarian + eggs</option>
            <option value="vegetarian">Vegetarian</option>
          </select>
        </div>
        <div className="li">
          <span className="li-name">Don't repeat a dish within<small>days</small></span>
          <div className="stepper small">
            <button onClick={() => set({ noRepeatDays: Math.max(0, profile.noRepeatDays - 1) })}>−</button>
            <b>{profile.noRepeatDays}</b>
            <button onClick={() => set({ noRepeatDays: Math.min(14, profile.noRepeatDays + 1) })}>+</button>
          </div>
        </div>
      </div>

      <div className="section">
        <h4>Calories &amp; goals</h4>
        <p className="muted small">Optional. Used only on this phone to estimate a daily target and steer new drafts.</p>
        <BodyForm draft={draft} goals={goals}
          onChange={(d) => { setDraft(d); const b = bodyFromDraft(d); if (b) set({ body: b }); }} />
        <div className="field" style={{ marginTop: 12 }}>
          <span>Diet goals</span>
          <div className="chips">
            {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => {
              const on = goals.includes(g);
              return (
                <button key={g} className={`chip small ${on ? "sel" : ""}`} aria-pressed={on}
                  onClick={() => set({ goals: on ? goals.filter((x) => x !== g) : [...goals, g] })}>
                  {on ? "✓ " : ""}{GOAL_LABEL[g]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="row between" style={{ marginTop: 12 }}>
          {profile.body
            ? <button className="link danger-link" onClick={() => { set({ body: undefined }); setDraft(emptyDraft()); }}>Remove my details</button>
            : <span />}
          <button className="primary" onClick={() => confirm("Replace this week's plan with a fresh draft?") && onRedraft()}>Re-draft this week</button>
        </div>
      </div>

      <div className="section">
        <h4>Cuisines</h4>
        <div className="chips">
          {(Object.keys(CUISINE_LABEL) as Cuisine[]).map((c) => {
            const on = profile.cuisines.includes(c);
            return (
              <button key={c} className={`chip small ${on ? "sel" : ""}`}
                onClick={() => set({ cuisines: on ? profile.cuisines.filter((x) => x !== c) : [...profile.cuisines, c] })}>
                {CUISINE_LABEL[c]}
              </button>
            );
          })}
        </div>
        <p className="muted small">Controls which dishes show in the Dishes tab.</p>
      </div>

      <div className="section">
        <h4>Usual meals</h4>
        {MEALS.map((meal) => (
          <div key={meal} className="li">
            <span className="li-name">{MEAL_LABEL[meal]}</span>
            <select value={profile.defaults[meal] ?? "skip"}
              onChange={(e) => set({ defaults: { ...profile.defaults, [meal]: e.target.value === "skip" ? null : e.target.value } })}>
              <option value="skip">Usually skip</option>
              {TEMPLATES.filter((t) => t.meals.includes(meal)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="section">
        <h4>Day rules</h4>
        <p className="muted small">E.g. non-veg lunch on Wednesday and Sunday, eat out Friday dinner. Applies to new drafts.</p>
        {DAYS.map((day) => (
          <div key={day} className="day-rule">
            <b>{DAY_LABEL[day].slice(0, 3)}</b>
            {MEALS.map((meal) => {
              const key = slotKey(day, meal);
              return (
                <select key={meal} aria-label={`${DAY_LABEL[day]} ${meal}`} value={profile.dayOverrides[key] ?? "default"}
                  onChange={(e) => setOverride(key, e.target.value)}>
                  <option value="default">{MEAL_LABEL[meal]}: usual</option>
                  <option value="skip">{MEAL_LABEL[meal]}: skip</option>
                  {TEMPLATES.filter((t) => t.meals.includes(meal)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              );
            })}
          </div>
        ))}
      </div>

      <div className="section">
        <h4>Your data</h4>
        <p className="muted small">Everything is stored only on this device. Back it up to move to a new phone.</p>
        <div className="row">
          <button onClick={download}>Download backup</button>
          <button onClick={() => file.current?.click()}>Restore backup</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
        <button className="danger" onClick={() => confirm("Delete all Mealer data on this device?") && onReset()}>Start over</button>
      </div>
    </div>
  );
}
