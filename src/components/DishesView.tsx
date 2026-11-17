import { useState } from "react";
import {
  CATEGORY_LABEL, CUISINE_LABEL, SECTIONS,
  type Category, type Cuisine, type Diet, type Dish, type Ingredient, type Meal, type Profile, type Section, type Unit,
} from "../data/types";

interface Props {
  profile: Profile;
  allDishes: Dish[];
  onProfile: (p: Profile) => void;
  onAddDish: (d: Dish) => void;
  onDeleteDish: (id: string) => void;
}

export function DishesView({ profile, allDishes, onProfile, onAddDish, onDeleteDish }: Props) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [adding, setAdding] = useState(false);
  const lib = new Set(profile.library);

  const toggle = (id: string) => {
    const next = lib.has(id) ? profile.library.filter((x) => x !== id) : [...profile.library, id];
    onProfile({ ...profile, library: next });
  };

  const q = query.trim().toLowerCase();
  const visible = allDishes.filter((d) =>
    (q ? d.name.toLowerCase().includes(q) : showAll || profile.cuisines.includes(d.cuisine) || d.custom));

  const byCuisine = new Map<string, Dish[]>();
  for (const d of visible) {
    const k = d.custom ? "Your dishes" : CUISINE_LABEL[d.cuisine];
    byCuisine.set(k, [...(byCuisine.get(k) ?? []), d]);
  }

  return (
    <div className="dishes">
      <div className="row">
        <input className="search" placeholder="Search dishes" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="primary" onClick={() => setAdding(true)}>+ Add your own</button>
      </div>
      <label className="muted small toggle">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> Show all cuisines
      </label>
      <p className="muted small">{lib.size} dishes in your list. Ticked dishes are the only ones Mealer plans with.</p>

      {[...byCuisine.entries()].map(([group, list]) => (
        <div key={group} className="section">
          <h4>{group}</h4>
          {list.map((d) => (
            <div key={d.id} className="li">
              <input type="checkbox" checked={lib.has(d.id)} onChange={() => toggle(d.id)} />
              <span className="li-name">{d.name}<small>{CATEGORY_LABEL[d.category]}</small></span>
              {d.custom && <button className="link" onClick={() => confirm(`Delete ${d.name}?`) && onDeleteDish(d.id)}>Delete</button>}
            </div>
          ))}
        </div>
      ))}

      {adding && <AddDish onCancel={() => setAdding(false)} onSave={(d) => { onAddDish(d); setAdding(false); }} />}
    </div>
  );
}

const UNITS: Unit[] = ["g", "ml", "pc", "slice"];

function AddDish({ onSave, onCancel }: { onSave: (d: Dish) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("main");
  const [cuisine, setCuisine] = useState<Cuisine>("american");
  const [diet, setDiet] = useState<Diet>("veg");
  const [meals, setMeals] = useState<Meal[]>(["lunch", "dinner"]);
  const [rows, setRows] = useState<Ingredient[]>([{ item: "", qty: 100, unit: "g", section: "produce" }]);
  const [pantry, setPantry] = useState("");

  const setRow = (k: number, patch: Partial<Ingredient>) => setRows(rows.map((r, j) => (j === k ? { ...r, ...patch } : r)));
  const valid = name.trim() && meals.length && rows.some((r) => r.item.trim() && r.qty > 0);

  const save = () => {
    const id = `own-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    onSave({
      id, name: name.trim(), category, cuisine, diet, meals,
      perServing: rows.filter((r) => r.item.trim() && r.qty > 0).map((r) => ({ ...r, item: r.item.trim() })),
      pantry: pantry.split(",").map((s) => s.trim()).filter(Boolean),
      addOns: [], custom: true, source: "own",
    });
  };

  return (
    <div className="sheet-bg" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Add your own dish</h3>
        <label className="field"><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amma's lemon rice" /></label>
        <div className="grid2">
          <label className="field"><span>Type</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </label>
          <label className="field"><span>Cuisine</span>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value as Cuisine)}>
              {(Object.keys(CUISINE_LABEL) as Cuisine[]).map((c) => <option key={c} value={c}>{CUISINE_LABEL[c]}</option>)}
            </select>
          </label>
          <label className="field"><span>Diet</span>
            <select value={diet} onChange={(e) => setDiet(e.target.value as Diet)}>
              <option value="veg">Vegetarian</option><option value="egg">Has egg</option><option value="nonveg">Meat / fish</option>
            </select>
          </label>
          <div className="field"><span>Meals</span>
            <div className="chips">
              {(["breakfast", "lunch", "dinner"] as Meal[]).map((m) => (
                <button key={m} className={`chip small ${meals.includes(m) ? "sel" : ""}`}
                  onClick={() => setMeals(meals.includes(m) ? meals.filter((x) => x !== m) : [...meals, m])}>{m}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="field"><span>Ingredients for ONE serving</span>
          {rows.map((r, k) => (
            <div key={k} className="ing-row">
              <input placeholder="Ingredient" value={r.item} onChange={(e) => setRow(k, { item: e.target.value })} />
              <input type="number" min="0" step="any" value={r.qty} onChange={(e) => setRow(k, { qty: Number(e.target.value) })} />
              <select value={r.unit} onChange={(e) => setRow(k, { unit: e.target.value as Unit })}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
              <select value={r.section} onChange={(e) => setRow(k, { section: e.target.value as Section })}>
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
          <button className="link" onClick={() => setRows([...rows, { item: "", qty: 50, unit: "g", section: "produce" }])}>+ Another ingredient</button>
        </div>
        <label className="field"><span>Pantry staples (comma separated)</span>
          <input value={pantry} onChange={(e) => setPantry(e.target.value)} placeholder="mustard seeds, curry leaves, oil" />
        </label>
        <div className="row">
          <button onClick={onCancel}>Cancel</button>
          <button className="primary" disabled={!valid} onClick={save}>Save dish</button>
        </div>
      </div>
    </div>
  );
}
