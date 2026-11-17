import { useEffect, useMemo, useState } from "react";
import { CATALOG } from "./data/dishes";
import type { AppState, Dish, Profile, WeekPlan } from "./data/types";
import { addDays, planningWeek, weekLabel } from "./logic/dates";
import { draftWeek } from "./logic/draft";
import { emptyState, loadState, saveState } from "./logic/storage";
import { Onboarding } from "./components/Onboarding";
import { WeekView } from "./components/WeekView";
import { ListView } from "./components/ListView";
import { DishesView } from "./components/DishesView";
import { SettingsView } from "./components/SettingsView";

type Tab = "week" | "list" | "dishes" | "settings";
const TABS: [Tab, string, string][] = [
  ["week", "Week", "🗓️"], ["list", "List", "🛒"], ["dishes", "Dishes", "🍲"], ["settings", "Settings", "⚙️"],
];

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [tab, setTab] = useState<Tab>("week");
  const [weekStart, setWeekStart] = useState(planningWeek);

  // Effects must return nothing: newer browsers return a Promise from scrollTo,
  // which React would try to call as a cleanup function and crash.
  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { window.scrollTo(0, 0); }, [tab, weekStart, state.profile === null]);

  const allDishes = useMemo(() => [...CATALOG, ...state.customDishes], [state.customDishes]);
  const dishes = useMemo(() => new Map<string, Dish>(allDishes.map((d) => [d.id, d])), [allDishes]);
  const allPlans = useMemo(() => Object.values(state.plans), [state.plans]);

  const profile = state.profile;
  const plan = state.plans[weekStart];

  const setPlan = (p: WeekPlan) => setState((s) => ({ ...s, plans: { ...s.plans, [p.weekStart]: p } }));
  const setProfile = (p: Profile) => setState((s) => ({ ...s, profile: p }));

  const draft = (p: Profile, keepHave = true) =>
    setPlan(draftWeek(weekStart, p, dishes, allPlans, keepHave ? plan?.haveItems ?? [] : []));

  if (!profile) {
    return (
      <Onboarding onDone={(p) => {
        const first = draftWeek(weekStart, p, dishes, []);
        setState((s) => ({ ...s, profile: p, plans: { ...s.plans, [first.weekStart]: first } }));
      }} />
    );
  }

  return (
    <div className="app">
      <header>
        <div className="brand">Mealer</div>
        {(tab === "week" || tab === "list") && (
          <div className="week-nav">
            <button aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}>‹</button>
            <span>{weekStart === planningWeek() ? "Planning: " : ""}{weekLabel(weekStart)}</span>
            <button aria-label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}>›</button>
          </div>
        )}
      </header>

      <main>
        {tab === "week" && (plan ? (
          <>
            <div className="toolbar">
              <span className="muted small">Tap a dish to swap it. Add-ons go on the list too.</span>
              <button onClick={() => confirm("Replace this week's plan with a fresh draft?") && draft(profile)}>Re-draft</button>
            </div>
            <WeekView plan={plan} allPlans={allPlans} profile={profile} dishes={dishes} onChange={setPlan} />
          </>
        ) : (
          <div className="empty">
            <p>No plan for this week yet.</p>
            <button className="primary" onClick={() => draft(profile, false)}>Draft this week for me</button>
          </div>
        ))}

        {tab === "list" && (plan
          ? <ListView plan={plan} dishes={dishes} household={profile.household} onChange={setPlan} />
          : <div className="empty">No plan for this week yet.</div>)}

        {tab === "dishes" && (
          <DishesView profile={profile} allDishes={allDishes} onProfile={setProfile}
            onAddDish={(d) => setState((s) => ({
              ...s, customDishes: [...s.customDishes, d],
              profile: s.profile ? { ...s.profile, library: [...s.profile.library, d.id] } : s.profile,
            }))}
            onDeleteDish={(id) => setState((s) => ({
              ...s, customDishes: s.customDishes.filter((d) => d.id !== id),
              profile: s.profile ? { ...s.profile, library: s.profile.library.filter((x) => x !== id) } : s.profile,
            }))} />
        )}

        {tab === "settings" && (
          <SettingsView state={state} profile={profile} onProfile={setProfile}
            onReplace={setState} onReset={() => setState(emptyState())}
            onRedraft={() => { draft(profile); setTab("week"); }} />
        )}
      </main>

      <nav className="tabs">
        {TABS.map(([id, label, icon]) => (
          <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            <span aria-hidden>{icon}</span>{label}
          </button>
        ))}
      </nav>
    </div>
  );
}
