import { useMemo, useRef, useState } from "react";
import { CATALOG } from "../data/dishes";
import {
  CATEGORY_LABEL, CUISINE_LABEL, GOAL_LABEL, MEALS,
  type AppState, type Category, type Cuisine, type DietPref, type Dish, type Goal, type Meal, type Profile,
} from "../data/types";
import { planningWeek } from "../logic/dates";
import { dietAllows, draftWeek } from "../logic/draft";
import { dayMacros } from "../logic/nutrition";
import { defaultsFor, guessStyle, MEAL_STYLES, STAPLES, starterLibrary, type MealStyle } from "../logic/setup";
import { importState } from "../logic/storage";
import { BodyForm, bodyFromDraft, emptyDraft, type BodyDraft } from "./BodyForm";

// 2026-11-17: friendlier first-time setup for people arriving from a shared link.
// Welcome -> who's eating -> cuisines -> how you eat -> goals (optional) -> ready (preview).
// Dish ticking is optional ("Choose my dishes myself"); popular dishes are picked for you.

const GOALS = Object.keys(GOAL_LABEL) as Goal[];
const ALL_CUISINES = Object.keys(CUISINE_LABEL) as Cuisine[];
const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

const CUISINE_EXAMPLE: Record<Cuisine, string> = {
  everyday: "Eggs, oats, sandwiches",
  american: "Burgers, chili, salads",
  "south-indian": "Dosa, sambar, rice",
  "north-indian": "Dal, paneer, roti",
  chinese: "Fried rice, dumplings",
  mexican: "Tacos, burrito bowls",
  italian: "Pasta, risotto, pizza",
  mediterranean: "Shawarma, Greek salad",
  thai: "Pad thai, green curry",
  japanese: "Teriyaki, ramen",
  korean: "Bibimbap, bulgogi",
  vietnamese: "Pho, banh mi",
  french: "Quiche, ratatouille",
  caribbean: "Jerk chicken, rice & peas",
};

const DIETS: [DietPref, string, string][] = [
  ["everything", "Everything", "Meat, fish, eggs and vegetarian"],
  ["eggetarian", "Vegetarian + eggs", "No meat or fish"],
  ["vegetarian", "Vegetarian", "No meat, fish or eggs"],
];

type Step = "welcome" | "people" | "cuisines" | "meals" | "goals" | "ready" | "dishes";
const NUMBERED: Step[] = ["people", "cuisines", "meals", "goals"];

interface Props {
  onDone: (p: Profile) => void;
  onRestore: (s: AppState) => void;
}

const listNames = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
);

function Progress({ step, onBack, onSkip }: { step: Step; onBack: () => void; onSkip?: () => void }) {
  const n = NUMBERED.indexOf(step);
  return (
    <div className="setup-top">
      <button className="icon-btn" aria-label="Back" onClick={onBack}><BackIcon /></button>
      <div className="setup-progress">
        <span>Step {n + 1} of {NUMBERED.length}{step === "goals" ? " · optional" : ""}</span>
        <div className="bars" aria-hidden="true">{NUMBERED.map((s, k) => <i key={s} className={k <= n ? "on" : ""} />)}</div>
      </div>
      {onSkip && <button className="link strong" onClick={onSkip}>Skip</button>}
    </div>
  );
}

function Radio({ on }: { on: boolean }) {
  return <span className={`radio ${on ? "on" : ""}`} aria-hidden="true" />;
}

export function Onboarding({ onDone, onRestore }: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [household, setHousehold] = useState(2);
  const [dietPref, setDietPref] = useState<DietPref>("everything");
  const [cuisines, setCuisines] = useState<Cuisine[]>(["everyday"]);
  const [plan, setPlan] = useState<Record<Meal, boolean>>({ breakfast: true, lunch: true, dinner: true });
  const [style, setStyle] = useState<MealStyle | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bodyOpen, setBodyOpen] = useState(false);
  const [bodyDraft, setBodyDraft] = useState<BodyDraft>(emptyDraft);
  const [library, setLibrary] = useState<Set<string> | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const chosenStyle = style ?? guessStyle(cuisines);
  const defaults = defaultsFor(chosenStyle, plan);
  const body = bodyOpen ? bodyFromDraft(bodyDraft) ?? undefined : undefined;
  const starter = useMemo(
    () => starterLibrary(CATALOG, cuisines, dietPref, defaults),
    [cuisines, dietPref, defaults.breakfast, defaults.lunch, defaults.dinner], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const dishes = useMemo(() => new Map<string, Dish>(CATALOG.map((d) => [d.id, d])), []);

  const profile = (lib: string[]): Profile => ({
    household, dietPref, cuisines, defaults, dayOverrides: {}, noRepeatDays: 3, library: lib, goals, body,
  });

  const toggleCuisine = (c: Cuisine) => setCuisines((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const restore = async (f: File) => {
    const s = importState(await f.text());
    if (s?.profile) onRestore(s); else alert("That file isn't a Mealer backup.");
  };

  if (step === "welcome") {
    return (
      <div className="onboard welcome">
        <div className="brand big">Mealer</div>
        <div className="hero">
          <h1>Plan a week of home meals in 2 minutes.</h1>
          <p>Then shop once, with one list for everything.</p>
        </div>
        <ul className="benefits">
          <li>
            <span className="benefit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 12h18a9 9 0 0 1-18 0zM12 3v4M8 5v2M16 5v2" /></svg></span>
            <div><b>Food you actually eat</b><span>From eggs and oats to dal, tacos or pad thai: {Math.floor(CATALOG.length / 50) * 50}+ dishes from {ALL_CUISINES.length - 1} cuisines.</span></div>
          </li>
          <li>
            <span className="benefit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 4h2l2.5 11h11L21 7H6.5" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></svg></span>
            <div><b>One shopping list</b><span>Sized for your household, grouped by aisle, easy to share.</span></div>
          </li>
          <li>
            <span className="benefit-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg></span>
            <div><b>Free and private</b><span>No account, no sign-in. Everything stays on your phone.</span></div>
          </li>
        </ul>
        <div className="setup-actions">
          <button className="primary big-btn" onClick={() => setStep("people")}>Get started</button>
          <span className="muted small center">Takes about a minute · you can change everything later</span>
          <button className="link" onClick={() => file.current?.click()}>I already use Mealer: restore my backup</button>
          <input ref={file} type="file" accept="application/json" hidden aria-label="Backup file"
            onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
        </div>
      </div>
    );
  }

  if (step === "people") {
    return (
      <div className="onboard">
        <Progress step={step} onBack={() => setStep("welcome")} />
        <h2>Who are you cooking for?</h2>
        <div className="panel row between">
          <div className="stack"><b>People</b><span className="muted small">Shopping amounts scale to this</span></div>
          <div className="stepper">
            <button aria-label="Fewer people" onClick={() => setHousehold(Math.max(1, household - 1))}>−</button>
            <b aria-live="polite">{household}</b>
            <button aria-label="More people" onClick={() => setHousehold(Math.min(12, household + 1))}>+</button>
          </div>
        </div>
        <div className="field">
          <span>What do you eat?</span>
          {DIETS.map(([v, l, hint]) => (
            <button key={v} className={`option ${dietPref === v ? "sel" : ""}`} aria-pressed={dietPref === v} onClick={() => setDietPref(v)}>
              <span className="stack"><b>{l}</b><span className="muted small">{hint}</span></span>
              <Radio on={dietPref === v} />
            </button>
          ))}
        </div>
        <div className="setup-actions">
          <button className="primary big-btn" onClick={() => setStep("cuisines")}>Next</button>
        </div>
      </div>
    );
  }

  if (step === "cuisines") {
    return (
      <div className="onboard">
        <Progress step={step} onBack={() => setStep("people")} />
        <div className="stack">
          <h2>What do you like to eat?</h2>
          <p className="muted">Pick all that apply. We'll only suggest these.</p>
        </div>
        <div className="cuisine-grid">
          {ALL_CUISINES.map((c) => {
            const on = cuisines.includes(c);
            return (
              <button key={c} className={`cuisine ${on ? "sel" : ""}`} aria-pressed={on} onClick={() => toggleCuisine(c)}>
                <span className="cuisine-head"><b>{CUISINE_LABEL[c]}</b><span className={`tick ${on ? "on" : ""}`} aria-hidden="true">✓</span></span>
                <span className="muted small">{CUISINE_EXAMPLE[c]}</span>
              </button>
            );
          })}
        </div>
        <div className="setup-actions sticky">
          <button className="primary big-btn" disabled={!cuisines.length} onClick={() => { setLibrary(null); setStep("meals"); }}>
            {cuisines.length ? `Next · ${cuisines.length} picked` : "Pick at least one"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "meals") {
    const none = !plan.breakfast && !plan.lunch && !plan.dinner;
    return (
      <div className="onboard">
        <Progress step={step} onBack={() => setStep("cuisines")} />
        <h2>How do you usually eat?</h2>
        <div className="field">
          <span>Which meals should we plan?</span>
          <div className="panel list">
            {MEALS.map((m) => (
              <button key={m} role="switch" aria-checked={plan[m]} className="switch-row" onClick={() => setPlan({ ...plan, [m]: !plan[m] })}>
                <span className="stack"><b>{MEAL_LABEL[m]}</b><span className="muted small">{plan[m] ? "Planned" : "Not planned"}</span></span>
                <span className={`switch ${plan[m] ? "on" : ""}`} aria-hidden="true"><i /></span>
              </button>
            ))}
          </div>
        </div>
        {(plan.lunch || plan.dinner) && (
          <div className="field">
            <span>What does lunch or dinner look like?</span>
            {MEAL_STYLES.map((s) => (
              <button key={s.id} className={`option ${chosenStyle === s.id ? "sel" : ""}`} aria-pressed={chosenStyle === s.id} onClick={() => setStyle(s.id)}>
                <span className="stack"><b>{s.label}</b><span className="muted small">{s.example}</span></span>
                <Radio on={chosenStyle === s.id} />
              </button>
            ))}
          </div>
        )}
        <div className="setup-actions">
          <span className="muted small center">You can change any single day later.</span>
          <button className="primary big-btn" disabled={none} onClick={() => setStep("goals")}>{none ? "Plan at least one meal" : "Next"}</button>
        </div>
      </div>
    );
  }

  if (step === "goals") {
    const bodyValid = !!bodyFromDraft(bodyDraft);
    return (
      <div className="onboard">
        <Progress step={step} onBack={() => setStep("meals")} onSkip={() => { setGoals([]); setBodyOpen(false); setStep("ready"); }} />
        <div className="stack">
          <h2>Anything you're aiming for?</h2>
          <p className="muted">Totally optional. It just nudges which dishes come first.</p>
        </div>
        <div className="chips" role="group" aria-label="Diet goals">
          {GOALS.map((g) => {
            const on = goals.includes(g);
            return (
              <button key={g} className={`chip ${on ? "sel" : ""}`} aria-pressed={on}
                onClick={() => setGoals(on ? goals.filter((x) => x !== g) : [...goals, g])}>
                {on ? "✓ " : ""}{GOAL_LABEL[g]}
              </button>
            );
          })}
        </div>
        <div className="panel list">
          <button className="switch-row" aria-expanded={bodyOpen} onClick={() => setBodyOpen(!bodyOpen)}>
            <span className="stack"><b>Add a daily calorie target</b><span className="muted small">From your height, weight and activity</span></span>
            <span className="plus" aria-hidden="true">{bodyOpen ? "−" : "+"}</span>
          </button>
          {bodyOpen && <div className="body-wrap"><BodyForm draft={bodyDraft} goals={goals} onChange={setBodyDraft} /></div>}
        </div>
        <div className="setup-actions">
          <button className="primary big-btn" disabled={bodyOpen && !bodyValid} onClick={() => setStep("ready")}>
            {bodyOpen && !bodyValid ? "Fill in height, weight and age" : "Plan my week"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "ready") {
    const preview = draftWeek(planningWeek(), profile(starter), dishes, []);
    const totals = dayMacros(preview, "mon", dishes);
    const names = cuisines.map((c) => CUISINE_LABEL[c]);
    return (
      <div className="onboard">
        <span className="done-badge" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <div className="stack">
          <h2>Your first week is ready</h2>
          <p className="muted">We picked {starter.length} dishes from {listNames(names)}. Swap anything with one tap.</p>
        </div>
        <section className="panel preview" aria-label="Monday preview">
          <div className="row between preview-head"><b>Monday</b><span className="muted small">≈ {Math.round(totals.kcal).toLocaleString()} kcal · {Math.round(totals.protein)} g protein</span></div>
          {MEALS.map((m) => {
            const entry = preview.slots[`mon-${m}`];
            if (!entry) return null;
            const what = entry.items.map((it) => (it.dishId ? dishes.get(it.dishId)?.name : null)).filter(Boolean).join(" · ");
            return <div key={m} className="preview-row"><span className="muted small">{MEAL_LABEL[m]}</span><span>{what || "—"}</span></div>;
          })}
        </section>
        <ol className="next-steps">
          <li>Check the week and swap what you don't fancy</li>
          <li>Open the List tab and shop once</li>
          <li>Add to Home Screen to keep Mealer one tap away</li>
        </ol>
        <div className="setup-actions">
          <button className="primary big-btn" onClick={() => onDone(profile(starter))}>See my week</button>
          <button className="link" onClick={() => { setLibrary(new Set(starter)); setStep("dishes"); }}>Choose my dishes myself instead</button>
        </div>
      </div>
    );
  }

  // Optional: tick dishes by hand.
  const candidates = CATALOG.filter((d) => cuisines.includes(d.cuisine) && dietAllows(dietPref, d));
  const lib = library ?? new Set(starter);
  const toggleDish = (id: string) => {
    const s = new Set(lib);
    if (s.has(id)) s.delete(id); else s.add(id);
    setLibrary(s);
  };
  return (
    <div className="onboard">
      <div className="setup-top">
        <button className="icon-btn" aria-label="Back" onClick={() => setStep("ready")}><BackIcon /></button>
      </div>
      <h2>Tick the dishes you eat</h2>
      <p className="muted">Popular ones are ticked. Your week is planned only from this list.</p>
      {(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => {
        const list = candidates.filter((d) => d.category === cat);
        if (!list.length) return null;
        return (
          <div key={cat} className="field">
            <span>{CATEGORY_LABEL[cat]}</span>
            <div className="chips">
              {list.map((d) => (
                <button key={d.id} className={`chip ${lib.has(d.id) ? "sel" : ""}`} onClick={() => toggleDish(d.id)}>{d.name}</button>
              ))}
            </div>
          </div>
        );
      })}
      <div className="row sticky">
        <button className="primary" disabled={!lib.size}
          onClick={() => { const s = new Set(lib); for (const x of STAPLES) s.add(x); onDone(profile([...s])); }}>
          Plan my week ({lib.size} dishes)
        </button>
      </div>
    </div>
  );
}
