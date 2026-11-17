import { useMemo, useState } from "react";
import { CATALOG } from "../data/dishes";
import { TEMPLATES } from "../data/templates";
import {
  CATEGORY_LABEL, CUISINE_LABEL, MEALS,
  type Category, type Cuisine, type DietPref, type Meal, type Profile,
} from "../data/types";
import { dietAllows } from "../logic/draft";

const ALL_CUISINES = Object.keys(CUISINE_LABEL) as Cuisine[];
const MEAL_LABEL: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

const SUGGESTED_DEFAULT: Record<Meal, string> = {
  breakfast: "breakfast-one", lunch: "one-dish", dinner: "main-sides",
};

/** Staples that make templates work (rice for Indian lunch, roti for curry). */
const STAPLES = ["steamed-rice", "chapati"];

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [household, setHousehold] = useState(2);
  const [dietPref, setDietPref] = useState<DietPref>("everything");
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [defaults, setDefaults] = useState<Record<Meal, string | null>>({ ...SUGGESTED_DEFAULT });
  const [library, setLibrary] = useState<Set<string> | null>(null);

  const candidates = useMemo(
    () => CATALOG.filter((d) => cuisines.includes(d.cuisine) && dietAllows(dietPref, d)),
    [cuisines, dietPref],
  );

  const goToDishes = () => {
    if (!library) {
      // Pre-tick popular dishes; if a cuisine/diet mix has none, pre-tick everything offered.
      const popular = candidates.filter((d) => d.popular);
      setLibrary(new Set((popular.length ? popular : candidates).map((d) => d.id)));
    }
    setStep(3);
  };

  const toggleCuisine = (c: Cuisine) =>
    setCuisines((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const toggleDish = (id: string) =>
    setLibrary((lib) => {
      const s = new Set(lib ?? []);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });

  const finish = () => {
    const lib = new Set(library ?? []);
    for (const s of STAPLES) lib.add(s);
    onDone({ household, dietPref, cuisines, defaults, dayOverrides: {}, noRepeatDays: 3, library: [...lib] });
  };

  return (
    <div className="onboard">
      <div className="brand big">Mealer</div>
      <div className="steps">{[0, 1, 2, 3].map((n) => <span key={n} className={n <= step ? "on" : ""} />)}</div>

      {step === 0 && (
        <section>
          <h2>Who are you cooking for?</h2>
          <label className="field">
            <span>People in your household</span>
            <div className="stepper">
              <button onClick={() => setHousehold(Math.max(1, household - 1))}>−</button>
              <b>{household}</b>
              <button onClick={() => setHousehold(Math.min(12, household + 1))}>+</button>
            </div>
          </label>
          <div className="field">
            <span>What do you eat?</span>
            <div className="chips">
              {([["everything", "Everything"], ["eggetarian", "Vegetarian + eggs"], ["vegetarian", "Vegetarian"]] as const).map(([v, l]) => (
                <button key={v} className={`chip ${dietPref === v ? "sel" : ""}`} onClick={() => setDietPref(v)}>{l}</button>
              ))}
            </div>
          </div>
          <button className="primary" onClick={() => setStep(1)}>Next</button>
        </section>
      )}

      {step === 1 && (
        <section>
          <h2>What did you grow up eating, or love now?</h2>
          <p className="muted">Pick as many as you like. We only suggest dishes from these.</p>
          <div className="chips">
            {ALL_CUISINES.map((c) => (
              <button key={c} className={`chip ${cuisines.includes(c) ? "sel" : ""}`} onClick={() => toggleCuisine(c)}>
                {CUISINE_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="row">
            <button onClick={() => setStep(0)}>Back</button>
            <button className="primary" disabled={!cuisines.length} onClick={() => { setLibrary(null); setStep(2); }}>Next</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2>How do your meals usually look?</h2>
          <p className="muted">You can change any single day later.</p>
          {MEALS.map((meal) => (
            <div key={meal} className="field">
              <span>{MEAL_LABEL[meal]}</span>
              <div className="cards">
                {TEMPLATES.filter((t) => t.meals.includes(meal)).map((t) => (
                  <button key={t.id} className={`card ${defaults[meal] === t.id ? "sel" : ""}`}
                    onClick={() => setDefaults({ ...defaults, [meal]: t.id })}>
                    <b>{t.name}</b><small>{t.example}</small>
                  </button>
                ))}
                <button className={`card ${defaults[meal] === null ? "sel" : ""}`}
                  onClick={() => setDefaults({ ...defaults, [meal]: null })}>
                  <b>Usually skip</b><small>Eat out, leftovers, not planned</small>
                </button>
              </div>
            </div>
          ))}
          <div className="row">
            <button onClick={() => setStep(1)}>Back</button>
            <button className="primary" onClick={goToDishes}>Next</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2>Tick the dishes you eat</h2>
          <p className="muted">Popular ones are ticked. Your week is planned only from this list, and you can add your own family dishes later.</p>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => {
            const list = candidates.filter((d) => d.category === cat);
            if (!list.length) return null;
            return (
              <div key={cat} className="field">
                <span>{CATEGORY_LABEL[cat]}</span>
                <div className="chips">
                  {list.map((d) => (
                    <button key={d.id} className={`chip ${library?.has(d.id) ? "sel" : ""}`} onClick={() => toggleDish(d.id)}>
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {candidates.length === 0 && (
            <p className="muted">No dishes match these cuisines and diet yet. Go back and add a cuisine, or add your own dishes after setup.</p>
          )}
          <div className="row sticky">
            <button onClick={() => setStep(2)}>Back</button>
            <button className="primary" disabled={!library?.size} onClick={finish}>Plan my week ({library?.size ?? 0} dishes)</button>
          </div>
        </section>
      )}
    </div>
  );
}
