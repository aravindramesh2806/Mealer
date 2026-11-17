import { useMemo, useState } from "react";
import type { Dish, WeekPlan } from "../data/types";
import { weekLabel } from "../logic/dates";
import { buildList, formatQty, listAsText } from "../logic/shopping";

interface Props {
  plan: WeekPlan;
  dishes: Map<string, Dish>;
  household: number;
  onChange: (plan: WeekPlan) => void;
}

export function ListView({ plan, dishes, household, onChange }: Props) {
  const list = useMemo(() => buildList(plan, dishes, household), [plan, dishes, household]);
  const have = new Set(plan.haveItems);
  const [note, setNote] = useState("");

  const toggle = (key: string) => {
    const next = new Set(have);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange({ ...plan, haveItems: [...next] });
  };

  const text = () => listAsText(list, have, `Groceries for ${weekLabel(plan.weekStart)}`);

  const share = async () => {
    const t = text();
    if (navigator.share) {
      try { await navigator.share({ text: t }); return; } catch { /* cancelled */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(text()); setNote("Copied"); }
    catch { setNote("Couldn't copy on this device"); }
    setTimeout(() => setNote(""), 2000);
  };

  if (list.mealsCounted === 0) {
    return <div className="empty">Plan some meals in the Week tab and your shopping list appears here.</div>;
  }

  const total = list.sections.reduce((n, s) => n + s.items.length, 0);
  const left = list.sections.reduce((n, s) => n + s.items.filter((x) => !have.has(x.key)).length, 0);

  return (
    <div className="list">
      <div className="list-head">
        <div>
          <b>{left} to buy</b> <span className="muted">of {total} · {list.mealsCounted} meals · for {household}</span>
        </div>
        <div className="row">
          <button className="primary" onClick={share}>Share</button>
          <button onClick={copy}>{note || "Copy"}</button>
        </div>
      </div>
      <p className="muted small">Tick what you already have. Quantities are rounded up; check pack sizes at the store.</p>

      {list.sections.map((s) => (
        <div key={s.section} className="section">
          <h4>{s.section}</h4>
          {s.items.map((x) => (
            <label key={x.key} className={`li ${have.has(x.key) ? "done" : ""}`}>
              <input type="checkbox" checked={have.has(x.key)} onChange={() => toggle(x.key)} />
              <span className="li-name">{x.item}<small>{x.usedIn.join(", ")}</small></span>
              <b>{formatQty(x.qty, x.unit)}</b>
            </label>
          ))}
        </div>
      ))}

      {list.pantry.length > 0 && (
        <div className="section">
          <h4>Check your pantry</h4>
          <p className="muted small">Spices and staples these dishes use. Tick the ones you have.</p>
          <div className="chips">
            {list.pantry.map((p) => {
              const key = `pantry|${p.item}`;
              return (
                <button key={key} className={`chip small ${have.has(key) ? "sel" : ""}`} title={p.usedIn.join(", ")} onClick={() => toggle(key)}>
                  {have.has(key) ? "✓ " : ""}{p.item}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
